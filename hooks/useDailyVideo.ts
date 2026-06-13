import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage-keys';

import { useCallback,useEffect,useState } from 'react';
import { DailyVideoMetadata } from '../constants/types';
import { fetchDailyVideo } from '../services/api';
import { isVideoCached } from '../services/downloader';
import {
  getAlarms,
  getDailyVideo,
  getLastFetchDate,
  getTodayDateString,
  setDailyVideo,
  setLastFetchDate,
} from '../services/storage';
import { computeNextAlarm } from '../utils/nextAlarm';

/** Don't hit the API until we're this close to the next alarm. */
const PREFETCH_WINDOW_MS = 24 * 60 * 60 * 1000;

interface UseDailyVideoResult {
  video: DailyVideoMetadata | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Manages fetching and caching the daily video.
 * - On mount: if today's video is already cached, use it; otherwise only fetch
 *   from the API when the next on-alarm is within PREFETCH_WINDOW_MS.
 * - If the app stays open past the threshold, a one-shot timer re-checks at
 *   the exact moment the window opens.
 */
export function useDailyVideo(deviceId: string | null): UseDailyVideoResult {
  console.log('[useDailyVideo] render', { deviceId });   // top of function body
  const [video, setVideo] = useState<DailyVideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideo = useCallback(async () => {
    console.log('[useDailyVideo] loadVideo CALLED', { deviceId });   // first line of loadVideo
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_FETCH_DATE);

    if (!deviceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const today = getTodayDateString();
      const lastFetch = await getLastFetchDate();
      let metadata: DailyVideoMetadata | null = null;

      if (lastFetch === today) {
        // Already fetched today — reuse regardless of alarm timing.
        metadata = await getDailyVideo();
      } else {
        // Only hit the API if we're within the prefetch window of the next alarm.
        const alarms = await getAlarms();
        const next = computeNextAlarm(alarms, new Date());
        console.log('[useDailyVideo] window check', {
          alarmCount: alarms.length,
          next: next ? { msUntil: next.msUntil, alarmId: next.alarm.id } : null,
          withinWindow: !!(next && next.msUntil <= PREFETCH_WINDOW_MS),
        });
        if (next && next.msUntil <= PREFETCH_WINDOW_MS) {
          metadata = await fetchDailyVideo(deviceId);
          await setDailyVideo(metadata);
          await setLastFetchDate(today);
        }
      }

      // Reattach the local path if the file is on disk but storage lost it.
      if (metadata && metadata.localPath === null) {
        const cached = await isVideoCached(metadata.videoId);
        if (cached) {
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

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    // Force a new fetch by clearing the last fetch date
    await setLastFetchDate('');
    await loadVideo();
  }, [deviceId, loadVideo]);

  useEffect(() => {
    console.log('[useDailyVideo] effect FIRED', { deviceId });   // first line of effect
    loadVideo();
  }, [loadVideo]);

  // If we're sitting outside the prefetch window with no cached video yet,
  // schedule a re-check at the exact moment we cross into the window.
  useEffect(() => {
    if (video) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    (async () => {
      const lastFetch = await getLastFetchDate();
      if (lastFetch === getTodayDateString()) return;
      const alarms = await getAlarms();
      const next = computeNextAlarm(alarms, new Date());
      if (!next) return;
      const msUntilWindow = next.msUntil - PREFETCH_WINDOW_MS;
      if (msUntilWindow <= 0) return;
      timeout = setTimeout(() => {
        if (!cancelled) loadVideo();
      }, msUntilWindow + 1000);
    })();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [video, loadVideo]);

  return { video, isLoading, error, refresh };
}
