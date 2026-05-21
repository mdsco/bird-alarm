import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import {
  getAlarms,
  getDailyVideo,
  addToVideoLibrary,
  getTodayDateString,
} from '../services/storage';
import { isVideoCached, downloadVideo, getLocalVideoPath } from '../services/downloader';
import { scheduleSnooze } from '../services/alarms';
import { VideoPlayerView } from '../components/VideoPlayerView';
import { PulsingDot } from '../components/PulsingDot';
import { usePalette } from '../theme/ThemeContext';
import { FONTS } from '../theme/fonts';
import { Alarm, DailyVideoMetadata } from '../constants/types';
import { to24h } from '../utils/nextAlarm';

const SNOOZE_MINUTES = 9;
const SNOOZE_DISMISS_DELAY_MS = 1500;
const FEEDBACK_DURATION_MS = 3000;
const RECENT_ALARM_WINDOW_MS = 10 * 60 * 1000; // 10 min

type LoadState =
  | { phase: 'loading' }
  | { phase: 'downloading'; progress: number }
  | { phase: 'ready'; video: DailyVideoMetadata; uri: string }
  | { phase: 'error'; message: string };

/** Most-recently-fired alarm in the last 10 minutes, if any. */
function findRecentAlarm(alarms: Alarm[], now: Date): Alarm | null {
  let best: { alarm: Alarm; firedAt: number } | null = null;
  for (const a of alarms) {
    if (!a.on) continue;
    const h24 = to24h(a.hour, a.ampm);
    const t = new Date(now);
    t.setHours(h24, a.minute, 0, 0);
    let firedAt = t.getTime();
    if (firedAt > now.getTime()) firedAt -= 24 * 60 * 60 * 1000;
    const age = now.getTime() - firedAt;
    if (age < 0 || age > RECENT_ALARM_WINDOW_MS) continue;
    if (a.repeat.length > 0) {
      const dow = new Date(firedAt).getDay();
      if (!a.repeat.includes(dow as 0 | 1 | 2 | 3 | 4 | 5 | 6)) continue;
    }
    if (!best || firedAt > best.firedAt) best = { alarm: a, firedAt };
  }
  return best?.alarm ?? null;
}

function timeOfDayGreeting(d: Date): string {
  const h = d.getHours();
  if (h < 5) return 'Pre-dawn chorus';
  if (h < 12) return 'The lark is calling';
  if (h < 17) return 'Afternoon flight';
  if (h < 21) return 'Evening roost';
  return 'Night birds singing';
}

export default function VideoPlayerScreen() {
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const [firingAlarm, setFiringAlarm] = useState<Alarm | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // Resolve which alarm fired (best-effort; falls back to defaults).
  useEffect(() => {
    let cancelled = false;
    getAlarms().then((all) => {
      if (cancelled) return;
      setFiringAlarm(findRecentAlarm(all, new Date()));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load + (if needed) download the daily video.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const video = await getDailyVideo();
        if (!video) {
          setState({ phase: 'error', message: 'No video assigned for today yet.' });
          return;
        }
        const cached = await isVideoCached(video.videoId);
        if (cached) {
          if (!cancelled) {
            setState({ phase: 'ready', video, uri: `file://${getLocalVideoPath(video.videoId)}` });
          }
          return;
        }
        if (video.localPath) {
          if (!cancelled) setState({ phase: 'ready', video, uri: `file://${video.localPath}` });
          return;
        }
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
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSnooze = useCallback(async () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    try {
      await scheduleSnooze(SNOOZE_MINUTES * 60 * 1000);
      setFeedback(`Snoozed — back in ${SNOOZE_MINUTES} minutes`);
      feedbackTimeoutRef.current = setTimeout(() => router.back(), SNOOZE_DISMISS_DELAY_MS);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to snooze');
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    }
  }, [router]);

  const handleWakeUp = useCallback(async () => {
    if (state.phase === 'ready') {
      await addToVideoLibrary({
        videoId: state.video.videoId,
        species: state.video.species,
        thumbnailUrl: state.video.thumbnailUrl,
        localPath: state.video.localPath,
        watchedDate: getTodayDateString(),
      }).catch(() => {});
    }
    router.back();
  }, [router, state]);

  const handlePlaybackEnd = async () => {
    if (state.phase !== 'ready') return;
    const { video } = state;
    await addToVideoLibrary({
      videoId: video.videoId,
      species: video.species,
      thumbnailUrl: video.thumbnailUrl,
      localPath: video.localPath,
      watchedDate: getTodayDateString(),
    });
  };

  // ─── Background states ───────────────────────────────────────────────────────
  if (state.phase === 'loading' || state.phase === 'downloading' || state.phase === 'error') {
    return (
      <View style={[styles.statusRoot, { backgroundColor: palette.bg }]}>
        <StatusBar style="dark" />
        <LinearGradient
          colors={palette.bgGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.statusContent}>
          {state.phase === 'error' ? (
            <>
              <Text style={[styles.statusEmoji, { color: palette.text }]}>⚠</Text>
              <Text style={[styles.statusTitle, { color: palette.text }]}>
                Couldn't load video
              </Text>
              <Text style={[styles.statusSub, { color: palette.sub }]}>{state.message}</Text>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.statusBtn,
                  {
                    backgroundColor: palette.accent,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={styles.statusBtnText}>Go back</Text>
              </Pressable>
            </>
          ) : (
            <>
              <ActivityIndicator color={palette.accent} size="large" />
              <Text style={[styles.statusTitle, { color: palette.text, marginTop: 16 }]}>
                {state.phase === 'downloading' ? 'Downloading bird video' : 'Loading'}
              </Text>
              {state.phase === 'downloading' && (
                <>
                  <Text style={[styles.statusSub, { color: palette.sub }]}>
                    {state.progress}%
                  </Text>
                  <View style={[styles.progressTrack, { backgroundColor: palette.surfaceSoft }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${state.progress}%`, backgroundColor: palette.accent },
                      ]}
                    />
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  // ─── Ringing scene ───────────────────────────────────────────────────────────
  const greeting = timeOfDayGreeting(now);
  const timeStr = firingAlarm
    ? `${firingAlarm.hour}:${String(firingAlarm.minute).padStart(2, '0')}`
    : `${((now.getHours() % 12) || 12)}:${String(now.getMinutes()).padStart(2, '0')}`;
  const label = firingAlarm?.label ?? state.video.species ?? 'Wake up';
  const sound = firingAlarm?.sound ?? 'Skylark';

  return (
    <View style={styles.ringRoot}>
      <StatusBar style="light" />
      <VideoPlayerView uri={state.uri} autoPlay onPlaybackEnd={handlePlaybackEnd} />

      {/* Dimming vignette for legibility */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.35)', 'transparent', 'transparent', 'rgba(0,0,0,0.55)']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top overlay */}
      <View
        pointerEvents="box-none"
        style={[styles.topOverlay, { top: insets.top + 24 }]}
      >
        <BlurView intensity={24} tint="dark" style={styles.nowPill}>
          <PulsingDot />
          <Text style={styles.nowPillText}>NOW SINGING</Text>
        </BlurView>

        <Text style={styles.greeting}>{greeting.toUpperCase()}</Text>
        <Text style={styles.timeHero}>{timeStr}</Text>
        <Text style={styles.label}>{label}</Text>

        <BlurView intensity={20} tint="dark" style={styles.soundChip}>
          <Text style={styles.soundChipText}>♪ {sound}</Text>
        </BlurView>
      </View>

      {/* Bottom scrim + actions */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.55)']}
        style={[styles.bottomScrim, { height: 220 + insets.bottom }]}
      />

      <View style={[styles.actions, { bottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={handleSnooze}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <BlurView intensity={32} tint="light" style={styles.snoozeBlur}>
            <Text style={styles.snoozeText}>Snooze · {SNOOZE_MINUTES} min</Text>
          </BlurView>
        </Pressable>

        <Pressable
          onPress={handleWakeUp}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.wakeBtn,
            {
              shadowColor: palette.accent,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={[palette.warm, palette.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wakeGradient}
          >
            <Text style={styles.wakeText}>Wake up</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {feedback ? (
        <View pointerEvents="none" style={[styles.feedbackWrap, { top: insets.top + 80 }]}>
          <BlurView intensity={30} tint="dark" style={styles.feedbackPill}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </BlurView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Status states (loading / downloading / error) ─────
  statusRoot: { flex: 1, position: 'relative' },
  statusContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  statusEmoji: { fontSize: 40 },
  statusTitle: { fontFamily: FONTS.serifMedium, fontSize: 22, textAlign: 'center' },
  statusSub: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', marginTop: 4 },
  statusBtn: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 22,
  },
  statusBtnText: {
    color: '#fff',
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
  },
  progressTrack: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: { height: '100%' },

  // ─── Ringing scene ─────────────────────────────────────
  ringRoot: { flex: 1, backgroundColor: '#000', position: 'relative' },
  topOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  nowPillText: {
    color: '#fff',
    fontFamily: FONTS.monoSemibold,
    fontSize: 10,
    letterSpacing: 2,
  },
  greeting: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONTS.monoMedium,
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 14,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  timeHero: {
    color: '#fff',
    fontFamily: FONTS.serif,
    fontSize: 110,
    lineHeight: 116,
    letterSpacing: -4,
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  label: {
    color: '#fff',
    fontFamily: FONTS.serif,
    fontSize: 22,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  soundChip: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  soundChipText: {
    color: 'rgba(255,255,255,0.95)',
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  actions: {
    position: 'absolute',
    left: 22,
    right: 22,
    gap: 12,
  },
  actionBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  snoozeBlur: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      Platform.OS === 'android' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 22,
  },
  snoozeText: {
    color: '#fff',
    fontFamily: FONTS.bodySemibold,
    fontSize: 16,
  },
  wakeBtn: {
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  wakeGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  wakeText: { color: '#fff', fontFamily: FONTS.bodyBold, fontSize: 17 },

  feedbackWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  feedbackPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  feedbackText: { color: '#fff', fontFamily: FONTS.bodyMedium, fontSize: 14 },
});
