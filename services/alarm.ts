import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AlarmTime } from '../constants/types';
import { BirdAlarmModule } from '../modules/BirdAlarmModule';

const ALARM_NOTIFICATION_ID = 'bird-alarm-daily';

/**
 * Request notification permissions. Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });
  return status === 'granted';
}

/**
 * Schedule (or reschedule) the daily alarm.
 *
 * Android: uses AlarmManager via the native BirdAlarm module so the alarm can
 *          fire a full-screen intent over the lock screen.
 * iOS:     uses expo-notifications (lock-screen bypass is not available on iOS).
 */
export async function scheduleAlarm(
  time: AlarmTime,
  _species: string = 'your morning bird',
): Promise<void> {
  await cancelAlarm();

  if (Platform.OS === 'android' && BirdAlarmModule) {
    await BirdAlarmModule.scheduleAlarm(time.hour, time.minute);
  } else {
    await Notifications.scheduleNotificationAsync({
      identifier: ALARM_NOTIFICATION_ID,
      content: {
        title: 'Bird Alarm',
        body: `Good morning! Today\u2019s bird is ready \u{1F426}`,
        data: { url: '/video-player' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
  }
}

/**
 * Cancel the scheduled daily alarm.
 */
export async function cancelAlarm(): Promise<void> {
  if (Platform.OS === 'android' && BirdAlarmModule) {
    await BirdAlarmModule.cancelAlarm();
  } else {
    await Notifications.cancelScheduledNotificationAsync(ALARM_NOTIFICATION_ID);
  }
}

/**
 * Check whether the alarm is currently scheduled.
 * On Android the enabled state is authoritative in storage (managed by useAlarm),
 * so this always returns false and the hook relies on its own state.
 */
export async function isAlarmScheduled(): Promise<boolean> {
  if (Platform.OS === 'android') return false;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === ALARM_NOTIFICATION_ID);
}

/**
 * Format AlarmTime as a human-readable string, e.g. "7:05 AM".
 */
export function formatAlarmTime(time: AlarmTime): string {
  const period = time.hour < 12 ? 'AM' : 'PM';
  const displayHour = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
  const displayMinute = String(time.minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}
