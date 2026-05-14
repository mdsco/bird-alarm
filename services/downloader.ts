import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { updateDailyVideoLocalPath } from './storage';

const VIDEO_CACHE_DIR = `${FileSystem.cacheDirectory}bird-alarm/videos/`;

/**
 * Returns the local cache path for a given video ID.
 */
export function getLocalVideoPath(videoId: string): string {
  return `${VIDEO_CACHE_DIR}${videoId}.mp4`;
}

/**
 * Check whether a video is already cached locally.
 * Always returns false on web (no local filesystem).
 */
export async function isVideoCached(videoId: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const path = getLocalVideoPath(videoId);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists;
}

/**
 * Download a video from its CloudFront URL to the local cache directory.
 * Updates AsyncStorage with the local path on success.
 * Calls onProgress with 0–100 progress values.
 * Not supported on web.
 */
export async function downloadVideo(
  videoId: string,
  videoUrl: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Video download is not supported in the web browser.');
  }

  // Ensure the cache directory exists
  const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true });
  }

  const localPath = getLocalVideoPath(videoId);

  const downloadResumable = FileSystem.createDownloadResumable(
    videoUrl,
    localPath,
    {},
    (downloadProgress) => {
      const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
      if (totalBytesExpectedToWrite > 0 && onProgress) {
        const progress = Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100);
        onProgress(progress);
      }
    },
  );

  const result = await downloadResumable.downloadAsync();
  if (!result || result.status !== 200) {
    // Clean up any partial file
    await FileSystem.deleteAsync(localPath, { idempotent: true });
    throw new Error(`Download failed with status ${result?.status ?? 'unknown'}`);
  }

  // Persist local path to AsyncStorage so other code can find it
  await updateDailyVideoLocalPath(localPath);

  return localPath;
}

/**
 * Delete a cached video file (e.g. for cleanup).
 */
export async function deleteVideoCache(videoId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const path = getLocalVideoPath(videoId);
  await FileSystem.deleteAsync(path, { idempotent: true });
}
