import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDailyVideo, addToVideoLibrary, getTodayDateString } from '../services/storage';
import { isVideoCached, downloadVideo, getLocalVideoPath } from '../services/downloader';
import { scheduleSnooze } from '../services/alarm';
import { VideoPlayerView } from '../components/VideoPlayerView';
import { DailyVideoMetadata } from '../constants/types';

const SLEEP_MINUTES = 10;
const SNOOZE_DISMISS_DELAY_MS = 1500;
const FEEDBACK_DURATION_MS = 3000;

type State =
  | { phase: 'loading' }
  | { phase: 'downloading'; progress: number }
  | { phase: 'ready'; video: DailyVideoMetadata; uri: string }
  | { phase: 'error'; message: string };

export default function VideoPlayerScreen() {
  const router = useRouter();
  const [state, setState] = useState<State>({ phase: 'loading' });
  const [sleepFeedback, setSleepFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const handleSleep = useCallback(async () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    try {
      await scheduleSnooze(SLEEP_MINUTES * 60 * 1000);
      setSleepFeedback(`Snoozed — back in ${SLEEP_MINUTES} minutes`);
      feedbackTimeoutRef.current = setTimeout(() => router.back(), SNOOZE_DISMISS_DELAY_MS);
    } catch (err) {
      setSleepFeedback(err instanceof Error ? err.message : 'Failed to snooze');
      feedbackTimeoutRef.current = setTimeout(() => setSleepFeedback(null), FEEDBACK_DURATION_MS);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const video = await getDailyVideo();
        if (!video) {
          setState({ phase: 'error', message: 'No video assigned for today yet.' });
          return;
        }

        // Check if already downloaded
        const cached = await isVideoCached(video.videoId);
        if (cached) {
          const uri = `file://${getLocalVideoPath(video.videoId)}`;
          if (!cancelled) setState({ phase: 'ready', video, uri });
          return;
        }

        // Stored path from a previous session
        if (video.localPath) {
          if (!cancelled) setState({ phase: 'ready', video, uri: `file://${video.localPath}` });
          return;
        }

        // Download now (foreground fallback)
        if (!cancelled) setState({ phase: 'downloading', progress: 0 });

        const localPath = await downloadVideo(video.videoId, video.videoUrl, (p) => {
          if (!cancelled) setState({ phase: 'downloading', progress: p });
        });

        if (!cancelled) {
          setState({
            phase: 'ready',
            video: { ...video, localPath },
            uri: `file://${localPath}`,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            phase: 'error',
            message: err instanceof Error ? err.message : 'Failed to load video',
          });
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handlePlaybackEnd = async () => {
    if (state.phase !== 'ready') return;
    const { video } = state;
    // Add to library when user finishes watching
    await addToVideoLibrary({
      videoId: video.videoId,
      species: video.species,
      thumbnailUrl: video.thumbnailUrl,
      localPath: video.localPath,
      watchedDate: getTodayDateString(),
    });
  };

  if (state.phase === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1a6dbb" size="large" />
        <Text style={styles.statusText}>Loading...</Text>
      </View>
    );
  }

  if (state.phase === 'downloading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1a6dbb" size="large" />
        <Text style={styles.statusText}>Downloading... {state.progress}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${state.progress}%` }]} />
        </View>
      </View>
    );
  }

  if (state.phase === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Couldn't load video</Text>
        <Text style={styles.errorText}>{state.message}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // state.phase === 'ready'
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <VideoPlayerView
        uri={state.uri}
        autoPlay
        onPlaybackEnd={handlePlaybackEnd}
        onSleep={handleSleep}
      />
      <View style={styles.overlay}>
        <Text style={styles.speciesText}>{state.video.species}</Text>
      </View>
      {sleepFeedback ? (
        <View style={styles.feedbackContainer} pointerEvents="none">
          <Text style={styles.feedbackText}>{sleepFeedback}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    padding: 32,
    gap: 16,
  },
  statusText: {
    color: '#8ab4d4',
    fontSize: 16,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#1e3a5f',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a6dbb',
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#e07070',
    fontSize: 14,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  speciesText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 80,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
