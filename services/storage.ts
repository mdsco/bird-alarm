import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS, SECURE_KEYS } from '../constants/storage-keys';
import { AlarmTime, DailyVideoMetadata, VideoLibraryEntry } from '../constants/types';

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
