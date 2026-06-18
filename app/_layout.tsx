/**
 * Root layout — entry point of the app.
 *
 * IMPORTANT: The background task import MUST come first so TaskManager
 * registers the task when the JS bundle loads in headless (background) mode.
 */
import '../tasks/backgroundDownload';
import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { AppState, DeviceEventEmitter, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { BirdAlarmModule } from '../modules/BirdAlarmModule';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import { BACKGROUND_DOWNLOAD_TASK } from '../constants/tasks';
import { ThemeProvider } from '../theme/ThemeContext';
import { useAppFonts } from '../theme/fonts';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Configure how notifications appear while the app is in the foreground (native only).
// We suppress the banner because the notification received listener navigates directly
// to the video player — no tap required when the app is open.
// shouldShowList is also temporarily false so no entry appears in the notification
// center while the video plays; flip back to true to restore.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Handles alarm → video navigation. Extracted into its own component so that
 * the Notifications hooks are always called unconditionally within it, while
 * the component itself is omitted on web where the API is unavailable.
 *
 * Two paths:
 *  - Foreground: addNotificationReceivedListener fires immediately when the
 *    alarm triggers while the app is open → navigate directly, no tap needed.
 *  - Background / killed: OS shows the notification; user taps it →
 *    useLastNotificationResponse fires → navigate to video player.
 */
/** Ignore notification responses older than this — prevents a stale tap from
 * a previous session re-opening the video player on every launch. */
const STALE_NOTIFICATION_MS = 5 * 60 * 1000;

function isFresh(firedAt: unknown): boolean {
  const ts = typeof firedAt === 'number' ? firedAt : Number(firedAt);
  if (!Number.isFinite(ts) || ts <= 0) return false;
  return Date.now() - ts < STALE_NOTIFICATION_MS;
}

function NotificationHandler() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();

  // Background / killed app: open video player on notification tap
  useEffect(() => {
    if (!lastResponse) return;
    const data = lastResponse.notification.request.content.data as
      | { url?: string; firedAt?: number | string }
      | undefined;
    // Only navigate if the tapped notification fired recently. Past taps are
    // replayed by useLastNotificationResponse on every cold-start otherwise.
    if (data?.url === '/video-player' && isFresh(data.firedAt)) {
      router.push('/video-player');
    }
  }, [lastResponse]);

  // iOS foreground: open video player immediately when alarm fires (no tap required)
  useEffect(() => {
    if (Platform.OS === 'android') return;
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as
        | { url?: string; firedAt?: number | string }
        | undefined;
      if (data?.url === '/video-player' && isFresh(data.firedAt)) {
        router.push('/video-player');
      }
    });
    return () => subscription.remove();
  }, [router]);

  // Android: native AlarmManager fires → open video player
  useEffect(() => {
    if (Platform.OS !== 'android' || !BirdAlarmModule) return;

    // Check if the alarm fired before JS was ready (app launch or background→foreground)
    BirdAlarmModule.checkAlarmFired().then((fired) => {
      if (fired) router.push('/video-player');
    });

    // Immediate event when the alarm fires while the app is in the foreground
    const alarmSub = DeviceEventEmitter.addListener('BirdAlarmFired', () => {
      router.push('/video-player');
    });

    // When the app returns to the foreground after a background alarm notification tap
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        BirdAlarmModule!.checkAlarmFired().then((fired) => {
          if (fired) router.push('/video-player');
        });
      }
    });

    return () => {
      alarmSub.remove();
      appStateSub.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  // Register background download task once on mount (native only)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      BackgroundTask.registerTaskAsync(BACKGROUND_DOWNLOAD_TASK, {
        minimumInterval: 60 * 60, // At most once per hour
      }).catch((err) => {
        // Safe to ignore "already registered" errors
        console.log('[BackgroundTask] Registration note:', err.message);
      });
    }
  }, []);

  // Keep the splash screen up until fonts are ready, so the first paint uses Fraunces/Inter/Mono.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="dark" />
          {Platform.OS !== 'web' && <NotificationHandler />}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="edit-alarm"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="video-player"
              options={{
                title: '',
                presentation: 'fullScreenModal',
                headerStyle: { backgroundColor: '#000000' },
                headerTintColor: '#ffffff',
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
