import * as Notifications from 'expo-notifications';
import { AlarmTime } from '../constants/types';

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
 * Schedule (or reschedule) the daily alarm notification.
 * Fires every day at the given hour:minute.
 * The notification data carries the route to open on tap.
 */
export async function scheduleAlarm(
  time: AlarmTime,
  species: string = 'your morning bird',
): Promise<void> {
  // Cancel any existing alarm first
  await cancelAlarm();

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

/**
 * Cancel the scheduled daily alarm.
 */
export async function cancelAlarm(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(ALARM_NOTIFICATION_ID);
}

/**
 * Check whether the alarm notification is currently scheduled.
 */
export async function isAlarmScheduled(): Promise<boolean> {
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
