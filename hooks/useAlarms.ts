import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alarm } from '../constants/types';
import { getAlarms, setAlarms as persistAlarms } from '../services/storage';
import {
  cancelScheduledAlarm,
  rescheduleAll,
  requestNotificationPermissions,
} from '../services/alarms';

export type UseAlarmsResult = {
  alarms: Alarm[];
  isLoading: boolean;
  addAlarm: (alarm: Alarm) => Promise<void>;
  updateAlarm: (alarm: Alarm) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
};

/**
 * Manages the list of alarms in storage and keeps the OS-scheduled
 * "next-upcoming" alarm in sync with whichever alarm fires soonest.
 *
 * Persistence: alarm array in AsyncStorage (see services/storage.ts).
 * Scheduling: services/alarms.ts -> rescheduleAll().
 */
export function useAlarms(): UseAlarmsResult {
  const [alarms, setAlarmsState] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAlarms().then((stored) => {
      if (cancelled) return;
      setAlarmsState(stored);
      setIsLoading(false);
      // Re-sync the OS scheduler with whatever is in storage on launch.
      rescheduleAll(stored).catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback(async (next: Alarm[]) => {
    setAlarmsState(next);
    await persistAlarms(next);
    await rescheduleAll(next);
  }, []);

  const addAlarm = useCallback(
    async (alarm: Alarm) => {
      if (alarm.on) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          throw new Error('Notification permission denied. Please enable notifications in Settings.');
        }
      }
      await commit([...alarms, alarm]);
    },
    [alarms, commit],
  );

  const updateAlarm = useCallback(
    async (alarm: Alarm) => {
      if (alarm.on) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          throw new Error('Notification permission denied. Please enable notifications in Settings.');
        }
      }
      await commit(alarms.map((a) => (a.id === alarm.id ? alarm : a)));
    },
    [alarms, commit],
  );

  const deleteAlarm = useCallback(
    async (id: string) => {
      const next = alarms.filter((a) => a.id !== id);
      await commit(next);
      if (next.every((a) => !a.on)) {
        await cancelScheduledAlarm();
      }
    },
    [alarms, commit],
  );

  const toggleAlarm = useCallback(
    async (id: string) => {
      const target = alarms.find((a) => a.id === id);
      if (!target) return;
      if (!target.on) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          throw new Error('Notification permission denied. Please enable notifications in Settings.');
        }
      }
      await commit(alarms.map((a) => (a.id === id ? { ...a, on: !a.on } : a)));
    },
    [alarms, commit],
  );

  return useMemo(
    () => ({ alarms, isLoading, addAlarm, updateAlarm, deleteAlarm, toggleAlarm }),
    [alarms, isLoading, addAlarm, updateAlarm, deleteAlarm, toggleAlarm],
  );
}
