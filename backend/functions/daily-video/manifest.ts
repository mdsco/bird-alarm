import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Manifest } from './types';

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  ...(process.env.LOCALSTACK_ENDPOINT && {
    endpoint: process.env.LOCALSTACK_ENDPOINT,
    forcePathStyle: true, // required when endpoint is an IP address (e.g. LocalStack)
  }),
});
const BUCKET = process.env.S3_BUCKET ?? '';
const MANIFEST_KEY = 'videos.json';

// Module-scope cache — lives for the lifetime of a warm Lambda container (~5 min TTL)
let cachedManifest: Manifest | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getManifest(): Promise<Manifest> {
  const now = Date.now();
  if (cachedManifest && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedManifest;
  }

  const response = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: MANIFEST_KEY }),
  );

  const body = await response.Body?.transformToString('utf-8');
  if (!body) throw new Error('Empty manifest from S3');

  const manifest: Manifest = JSON.parse(body);
  if (!Array.isArray(manifest.videos) || manifest.videos.length === 0) {
    throw new Error('Manifest contains no videos');
  }

  cachedManifest = manifest;
  cacheTimestamp = now;
  return manifest;
}
