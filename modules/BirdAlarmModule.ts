import { NativeModules, Platform } from 'react-native';

const { BirdAlarm } = NativeModules;

/**
 * Thin JS wrapper around the Android AlarmManager native module.
 * null on iOS — callers should guard with Platform.OS checks or the null-safe methods below.
 */
export const BirdAlarmModule: {
  scheduleAlarm(hour: number, minute: number): Promise<void>;
  cancelAlarm(): Promise<void>;
  /** Returns true (once) if the alarm fired since the last check. Clears the flag. */
  checkAlarmFired(): Promise<boolean>;
  /** False on Android 14+ when USE_FULL_SCREEN_INTENT has not been granted by the user. */
  canUseFullScreenIntent(): Promise<boolean>;
} | null = Platform.OS === 'android' && BirdAlarm
  ? {
      scheduleAlarm: (hour, minute) => BirdAlarm.scheduleAlarm(hour, minute),
      cancelAlarm: () => BirdAlarm.cancelAlarm(),
      checkAlarmFired: () => BirdAlarm.checkAlarmFired(),
      canUseFullScreenIntent: () => BirdAlarm.canUseFullScreenIntent(),
    }
  : null;
