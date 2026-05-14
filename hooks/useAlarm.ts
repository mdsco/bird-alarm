import { useState, useEffect, useCallback } from 'react';
import { getAlarmTime, setAlarmTime, getAlarmEnabled, setAlarmEnabled } from '../services/storage';
import { scheduleAlarm, cancelAlarm, requestNotificationPermissions } from '../services/alarm';
import { AlarmTime } from '../constants/types';

interface UseAlarmResult {
  alarmTime: AlarmTime | null;
  alarmEnabled: boolean;
  isLoading: boolean;
  setAlarm: (time: AlarmTime) => Promise<void>;
  toggleAlarm: () => Promise<void>;
}

/**
 * Manages alarm state: reads from storage, schedules/cancels notifications.
 */
export function useAlarm(species?: string): UseAlarmResult {
  const [alarmTime, setAlarmTimeState] = useState<AlarmTime | null>(null);
  const [alarmEnabled, setAlarmEnabledState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [time, enabled] = await Promise.all([getAlarmTime(), getAlarmEnabled()]);
      if (!cancelled) {
        setAlarmTimeState(time);
        setAlarmEnabledState(enabled);
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setAlarm = useCallback(async (time: AlarmTime) => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      throw new Error('Notification permission denied. Please enable notifications in Settings.');
    }

    await setAlarmTime(time);
    await setAlarmEnabled(true);
    await scheduleAlarm(time, species);

    setAlarmTimeState(time);
    setAlarmEnabledState(true);
  }, [species]);

  const toggleAlarm = useCallback(async () => {
    if (alarmEnabled) {
      await cancelAlarm();
      await setAlarmEnabled(false);
      setAlarmEnabledState(false);
    } else {
      if (!alarmTime) return;
      const granted = await requestNotificationPermissions();
      if (!granted) return;
      await scheduleAlarm(alarmTime, species);
      await setAlarmEnabled(true);
      setAlarmEnabledState(true);
    }
  }, [alarmEnabled, alarmTime, species]);

  return { alarmTime, alarmEnabled, isLoading, setAlarm, toggleAlarm };
}
