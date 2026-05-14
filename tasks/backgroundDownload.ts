/**
 * Background task definition — MUST be imported at the top of app/_layout.tsx
 * before any React components render, so TaskManager registers it when JS
 * loads in background (headless) mode.
 *
 * This file uses only direct module imports — no React hooks.
 */
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { BACKGROUND_DOWNLOAD_TASK } from '../constants/tasks';
import { getDailyVideo } from '../services/storage';
import { isVideoCached, downloadVideo } from '../services/downloader';

TaskManager.defineTask(BACKGROUND_DOWNLOAD_TASK, async (): Promise<BackgroundTask.BackgroundTaskResult> => {
  try {
    const video = await getDailyVideo();

    if (!video) {
      // No video metadata yet — nothing to download
      return BackgroundTask.BackgroundTaskResult.NoData;
    }

    const cached = await isVideoCached(video.videoId);
    if (cached) {
      // Already downloaded — nothing to do
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    // Download the video (no progress callback in background context)
    await downloadVideo(video.videoId, video.videoUrl);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (err) {
    console.error('[BackgroundDownload] Task failed:', err);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
