import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS, SECURE_KEYS } from '../constants/storage-keys';
import { Alarm, AlarmTime, DailyVideoMetadata, VideoLibraryEntry } from '../constants/types';
import { from24h } from '../utils/nextAlarm';

// ─── SecureStore (device UUID) ───────────────────────────────────────────────
// SecureStore is native-only; fall back to AsyncStorage on web.

export async function getDeviceId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(SECURE_KEYS.DEVICE_ID);
  }
  return SecureStore.getItemAsync(SECURE_KEYS.DEVICE_ID);
}

export async function setDeviceId(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    return AsyncStorage.setItem(SECURE_KEYS.DEVICE_ID, id);
  }
  return SecureStore.setItemAsync(SECURE_KEYS.DEVICE_ID, id);
}

// ─── Alarm settings ──────────────────────────────────────────────────────────

export async function getAlarmTime(): Promise<AlarmTime | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALARM_TIME);
  return raw ? JSON.parse(raw) : null;
}

export async function setAlarmTime(time: AlarmTime): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ALARM_TIME, JSON.stringify(time));
}

export async function getAlarmEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALARM_ENABLED);
  return raw === 'true';
}

export async function setAlarmEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ALARM_ENABLED, enabled ? 'true' : 'false');
}

// ─── Daily video metadata ────────────────────────────────────────────────────

export async function getDailyVideo(): Promise<DailyVideoMetadata | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_VIDEO);
  return raw ? JSON.parse(raw) : null;
}

export async function setDailyVideo(metadata: DailyVideoMetadata): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DAILY_VIDEO, JSON.stringify(metadata));
}

export async function updateDailyVideoLocalPath(localPath: string): Promise<void> {
  const current = await getDailyVideo();
  if (current) {
    await setDailyVideo({ ...current, localPath });
  }
}

// ─── Last fetch date ─────────────────────────────────────────────────────────

export async function getLastFetchDate(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.LAST_FETCH_DATE);
}

export async function setLastFetchDate(date: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_FETCH_DATE, date);
}

export function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// ─── Video library (history of past birds) ───────────────────────────────────

export async function getVideoLibrary(): Promise<VideoLibraryEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.VIDEO_LIBRARY);
  return raw ? JSON.parse(raw) : [];
}

export async function addToVideoLibrary(entry: VideoLibraryEntry): Promise<void> {
  const library = await getVideoLibrary();
  const alreadyExists = library.some((e) => e.videoId === entry.videoId);
  if (!alreadyExists) {
    library.unshift(entry); // Newest first
    await AsyncStorage.setItem(STORAGE_KEYS.VIDEO_LIBRARY, JSON.stringify(library));
  }
}

// ─── Alarms (multi-alarm) ────────────────────────────────────────────────────

/**
 * Read all alarms from storage. If the alarms key is missing, migrate any
 * legacy single-alarm state (ALARM_TIME + ALARM_ENABLED) into an Alarm[].
 */
export async function getAlarms(): Promise<Alarm[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
  if (raw) return JSON.parse(raw);

  // First-run migration: convert old single-alarm storage into one Alarm.
  const legacyTime = await getAlarmTime();
  const legacyEnabled = await getAlarmEnabled();
  const migrated: Alarm[] = legacyTime
    ? [
        {
          id: 'migrated-1',
          ...from24h(legacyTime.hour),
          minute: legacyTime.minute,
          label: 'Wake up',
          repeat: [1, 2, 3, 4, 5],
          sound: 'Skylark',
          on: legacyEnabled,
        },
      ]
    : [];
  await setAlarms(migrated);
  return migrated;
}

export async function setAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
}
