import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getManifest } from './manifest';
import { getDeviceHistory, recordAssignment } from './history';
import { DailyVideoResponse } from './types';

const CF_BASE_URL = process.env.CLOUDFRONT_BASE_URL ?? '';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Dev-only: rewrite host-loopback URLs using the request's Host header so a
// device on the LAN gets a URL pointing at the dev machine, not at "localhost"
// (which on Android resolves to the device itself). No-op in production where
// CLOUDFRONT_BASE_URL points at a real CloudFront distribution.
function resolveCfBaseUrl(event: APIGatewayProxyEventV2): string {
  const hostHeader = event.headers?.host ?? event.headers?.Host ?? '';
  const requestHost = hostHeader.split(':')[0];
  if (!requestHost || requestHost === 'localhost' || requestHost === '127.0.0.1') {
    return CF_BASE_URL;
  }
  return CF_BASE_URL
    .replace('__REQUEST_HOST__', requestHost)
    .replace('://localhost', `://${requestHost}`)
    .replace('://127.0.0.1', `://${requestHost}`);
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function makeResponse(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Temporary: log env vars to confirm they reach the container
    console.log('[debug] LOCALSTACK_ENDPOINT:', process.env.LOCALSTACK_ENDPOINT);
    console.log('[debug] S3_BUCKET:', process.env.S3_BUCKET);
    console.log('[debug] DYNAMODB_TABLE:', process.env.DYNAMODB_TABLE);

    // ── Validate device_id ──────────────────────────────────────────────────
    const deviceId = event.queryStringParameters?.device_id ?? '';
    if (!UUID_REGEX.test(deviceId)) {
      return makeResponse(400, { error: 'Missing or invalid device_id (must be a UUID)' });
    }

    // ── Load manifest + device history in parallel ──────────────────────────
    const [manifest, history] = await Promise.all([
      getManifest(),
      getDeviceHistory(deviceId),
    ]);

    const cfBaseUrl = resolveCfBaseUrl(event);
    const today = todayDateString();

    // If the device already received a video today, return the same one (idempotent)
    if (history?.last_assigned_date === today) {
      const todayAssignment = history.assigned_videos.find((v) => v.assignedDate === today);
      if (todayAssignment) {
        const video = manifest.videos.find((v) => v.id === todayAssignment.videoId);
        if (video) {
          const response: DailyVideoResponse = {
            videoId: video.id,
            videoUrl: `${cfBaseUrl}/${video.file}`,
            thumbnailUrl: `${cfBaseUrl}/${video.thumbnail}`,
            species: video.species,
            description: video.description,
            facts: video.facts,
          };
          return makeResponse(200, response);
        }
      }
    }

    // ── Pick next unseen video ──────────────────────────────────────────────
    const seenIds = new Set((history?.assigned_videos ?? []).map((v) => v.videoId));
    let unseen = manifest.videos.filter((v) => !seenIds.has(v.id));

    if (unseen.length === 0) {
      // All videos have been seen — gracefully wrap around
      unseen = manifest.videos;
    }

    // Pick deterministically (first in list order) for reproducibility
    const chosen = unseen[0];

    // ── Record assignment in DynamoDB ───────────────────────────────────────
    await recordAssignment(deviceId, { videoId: chosen.id, assignedDate: today });

    // ── Return response ─────────────────────────────────────────────────────
    const response: DailyVideoResponse = {
      videoId: chosen.id,
      videoUrl: `${cfBaseUrl}/${chosen.file}`,
      thumbnailUrl: `${cfBaseUrl}/${chosen.thumbnail}`,
      species: chosen.species,
      description: chosen.description,
      facts: chosen.facts,
    };
    return makeResponse(200, response);
  } catch (err) {
    console.error('[daily-video] Unhandled error:', err);
    return makeResponse(500, { error: 'Internal server error' });
  }
};
