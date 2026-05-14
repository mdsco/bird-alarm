// AsyncStorage keys
export const STORAGE_KEYS = {
  ALARM_TIME: 'alarm_time',          // { hour: number; minute: number } | null
  ALARM_ENABLED: 'alarm_enabled',    // boolean string 'true' | 'false'
  DAILY_VIDEO: 'daily_video',        // DailyVideoMetadata JSON
  LAST_FETCH_DATE: 'last_fetch_date', // 'YYYY-MM-DD'
  VIDEO_LIBRARY: 'video_library',    // VideoLibraryEntry[] JSON
} as const;

// SecureStore keys (device-level, persists across reinstalls on iOS)
export const SECURE_KEYS = {
  DEVICE_ID: 'device_id',
} as const;
