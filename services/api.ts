import { BirdFacts, DailyVideoMetadata } from '../constants/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

interface DailyVideoResponse {
  videoId: string;
  videoUrl: string;
  thumbnailUrl: string;
  species: string;
  description: string;
  facts: BirdFacts;
}

/**
 * Fetch today's assigned video from the Lambda API.
 * The server ensures each device never sees the same video twice.
 */
export async function fetchDailyVideo(deviceId: string): Promise<DailyVideoMetadata> {
  console.log('[fetchDailyVideo] starting', { API_BASE_URL, deviceId });
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not set. Add it to your .env file.');
  }

  const url = `${API_BASE_URL}/daily-video?device_id=${encodeURIComponent(deviceId)}`;
  console.log('[fetchDailyVideo] fetching', url);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    console.log('[fetchDailyVideo] fetch threw', err);
    throw err;
  }
  console.log('[fetchDailyVideo] response', { status: response.status, ok: response.ok });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API error ${response.status}: ${body}`);
  }

  const data: DailyVideoResponse = await response.json();

  const today = new Date();
  const assignedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return {
    videoId: data.videoId,
    videoUrl: data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    species: data.species,
    description: data.description,
    facts: data.facts,
    localPath: null,
    assignedDate,
  };
}
