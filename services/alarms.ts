import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../constants/types';
import { BirdAlarmModule } from '../modules/BirdAlarmModule';
import { computeNextAlarm, to24h } from '../utils/nextAlarm';

const ALARM_NOTIFICATION_ID = 'bird-alarm-daily';
const SNOOZE_NOTIFICATION_ID = 'bird-alarm-snooze';

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
 * Recompute which alarm fires next and (re)schedule it on the native layer.
 *
 * Strategy: only the *next-upcoming* on-alarm is held by the OS. Other alarms
 * live in JS state. After each fire (or whenever the alarm set changes), call
 * this again to schedule the new "next."
 *
 * Android: uses AlarmManager via the native BirdAlarm module so the alarm can
 *          fire a full-screen intent over the lock screen.
 * iOS:     uses expo-notifications with a one-shot DATE trigger at the exact
 *          fire time (NOT a DAILY trigger — we recompute after each fire).
 */
export async function rescheduleAll(alarms: Alarm[], now: Date = new Date()): Promise<void> {
  await cancelScheduledAlarm();

  const next = computeNextAlarm(alarms, now);
  if (!next) return;

  if (Platform.OS === 'android' && BirdAlarmModule) {
    const h24 = to24h(next.alarm.hour, next.alarm.ampm);
    await BirdAlarmModule.scheduleAlarm(h24, next.alarm.minute);
  } else if (Platform.OS !== 'web') {
    await Notifications.scheduleNotificationAsync({
      identifier: ALARM_NOTIFICATION_ID,
      content: {
        title: 'Bird Alarm',
        body: `${next.alarm.label} \u{1F426}`,
        data: { url: '/video-player', alarmId: next.alarm.id, firedAt: next.fireAt.getTime() },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: next.fireAt,
      },
    });
  }
}

/**
 * Cancel any scheduled alarm. Does NOT touch alarm data in storage.
 */
export async function cancelScheduledAlarm(): Promise<void> {
  if (Platform.OS === 'android' && BirdAlarmModule) {
    await BirdAlarmModule.cancelAlarm();
  } else if (Platform.OS !== 'web') {
    await Notifications.cancelScheduledNotificationAsync(ALARM_NOTIFICATION_ID).catch(() => {});
  }
}

/**
 * Schedule a one-shot snooze that fires delayMs from now. Does not change the
 * next-upcoming alarm reservation — but on iOS we currently share the
 * scheduled-alarm pipeline, so the snooze and next-alarm are independent IDs.
 */
export async function scheduleSnooze(delayMs: number): Promise<void> {
  await cancelSnooze();

  if (Platform.OS === 'android' && BirdAlarmModule) {
    await BirdAlarmModule.scheduleSnooze(delayMs);
  } else if (Platform.OS !== 'web') {
    await Notifications.scheduleNotificationAsync({
      identifier: SNOOZE_NOTIFICATION_ID,
      content: {
        title: 'Bird Alarm',
        body: `Good morning! Today’s bird is ready \u{1F426}`,
        data: { url: '/video-player', firedAt: Date.now() + delayMs },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(delayMs / 1000)),
      },
    });
  }
}

export async function cancelSnooze(): Promise<void> {
  if (Platform.OS === 'android' && BirdAlarmModule) {
    await BirdAlarmModule.cancelSnooze();
  } else if (Platform.OS !== 'web') {
    await Notifications.cancelScheduledNotificationAsync(SNOOZE_NOTIFICATION_ID).catch(() => {});
  }
}

/**
 * Format an Alarm's time as a human-readable string, e.g. "7:05 AM".
 */
export function formatAlarmTime(alarm: Pick<Alarm, 'hour' | 'minute' | 'ampm'>): string {
  return `${alarm.hour}:${String(alarm.minute).padStart(2, '0')} ${alarm.ampm}`;
}
