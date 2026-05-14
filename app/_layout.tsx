/**
 * Root layout — entry point of the app.
 *
 * IMPORTANT: The background task import MUST come first so TaskManager
 * registers the task when the JS bundle loads in headless (background) mode.
 */
import '../tasks/backgroundDownload';

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import { BACKGROUND_DOWNLOAD_TASK } from '../constants/tasks';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Configure how notifications appear while the app is in the foreground (native only)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Handles notification taps → navigation. Extracted into its own component so
 * that useLastNotificationResponse() is always called unconditionally within it,
 * while the component itself is omitted on web where the API is unavailable.
 */
function NotificationHandler() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!lastResponse) return;
    const data = lastResponse.notification.request.content.data as
      | Record<string, string>
      | undefined;
    if (data?.url === '/video-player') {
      router.push('/video-player');
    }
  }, [lastResponse]);
  return null;
}

export default function RootLayout() {
  // Register background download task once on mount (native only)
  useEffect(() => {
    SplashScreen.hideAsync();

    if (Platform.OS !== 'web') {
      BackgroundTask.registerTaskAsync(BACKGROUND_DOWNLOAD_TASK, {
        minimumInterval: 60 * 60, // At most once per hour
      }).catch((err) => {
        // Safe to ignore "already registered" errors
        console.log('[BackgroundTask] Registration note:', err.message);
      });
    }
  }, []);

  return (
    <>
      <StatusBar style="light" />
      {Platform.OS !== 'web' && <NotificationHandler />}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a1628' },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0a1628' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
    </>
  );
}
