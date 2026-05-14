import { useState, useEffect, useCallback } from 'react';
import { fetchDailyVideo } from '../services/api';
import {
  getDailyVideo,
  setDailyVideo,
  getLastFetchDate,
  setLastFetchDate,
  getTodayDateString,
} from '../services/storage';
import { isVideoCached, downloadVideo } from '../services/downloader';
import { DailyVideoMetadata } from '../constants/types';

interface UseDailyVideoResult {
  video: DailyVideoMetadata | null;
  isLoading: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  error: string | null;
  refresh: () => Promise<void>;
  triggerDownload: () => Promise<void>;
}

/**
 * Manages fetching and caching the daily video.
 * - On mount: checks if today's video is already fetched; if not, fetches from API.
 * - Checks local cache; if video file is missing, downloads it in the foreground.
 */
export function useDailyVideo(deviceId: string | null): UseDailyVideoResult {
  const [video, setVideo] = useState<DailyVideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadVideo = useCallback(async () => {
    if (!deviceId) return;
    setIsLoading(true);
    setError(null);

    try {
      const today = getTodayDateString();
      const lastFetch = await getLastFetchDate();
      let metadata: DailyVideoMetadata | null = null;

      if (lastFetch === today) {
        // Already fetched today — use cached metadata
        metadata = await getDailyVideo();
      }

      if (!metadata) {
        // New day or first launch — fetch from API
        metadata = await fetchDailyVideo(deviceId);
        await setDailyVideo(metadata);
        await setLastFetchDate(today);
      }

      // Check if file is downloaded
      if (metadata.localPath === null) {
        const cached = await isVideoCached(metadata.videoId);
        if (cached) {
          // File exists but path wasn't saved — fix it
          const { getLocalVideoPath } = await import('../services/downloader');
          metadata = { ...metadata, localPath: getLocalVideoPath(metadata.videoId) };
          await setDailyVideo(metadata);
        }
      }

      setVideo(metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily video');
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  const triggerDownload = useCallback(async () => {
    if (!video || isDownloading) return;
    if (video.localPath) return; // Already downloaded

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      const localPath = await downloadVideo(video.videoId, video.videoUrl, setDownloadProgress);
      setVideo((prev) => (prev ? { ...prev, localPath } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [video, isDownloading]);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    // Force a new fetch by clearing the last fetch date
    await setLastFetchDate('');
    await loadVideo();
  }, [deviceId, loadVideo]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  return { video, isLoading, isDownloading, downloadProgress, error, refresh, triggerDownload };
}
