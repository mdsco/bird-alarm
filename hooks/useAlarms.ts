import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
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

// Shared module-level store so every useAlarms() consumer (list screen, edit
// screen, etc.) sees the same alarms array. Without this, each component had
// its own useState copy and edits in one screen never reached the others.
let alarmsState: Alarm[] = [];
let isLoadingState = true;
const listeners = new Set<() => void>();
let hydrationPromise: Promise<void> | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const l of listeners) l();
}

function setStore(next: Alarm[], loading = false) {
  alarmsState = next;
  isLoadingState = loading;
  emit();
}

function hydrate() {
  if (!hydrationPromise) {
    hydrationPromise = getAlarms().then((stored) => {
      setStore(stored, false);
      rescheduleAll(stored).catch(() => {});
    });
  }
  return hydrationPromise;
}

async function commit(next: Alarm[]) {
  setStore(next, false);
  await persistAlarms(next);
  await rescheduleAll(next);
}

/**
 * Manages the list of alarms in storage and keeps the OS-scheduled
 * "next-upcoming" alarm in sync with whichever alarm fires soonest.
 *
 * Persistence: alarm array in AsyncStorage (see services/storage.ts).
 * Scheduling: services/alarms.ts -> rescheduleAll().
 */
export function useAlarms(): UseAlarmsResult {
  const alarms = useSyncExternalStore(
    subscribe,
    () => alarmsState,
    () => alarmsState,
  );
  const isLoading = useSyncExternalStore(
    subscribe,
    () => isLoadingState,
    () => isLoadingState,
  );

  useEffect(() => {
    hydrate();
  }, []);

  const addAlarm = useCallback(async (alarm: Alarm) => {
    if (alarm.on) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permission denied. Please enable notifications in Settings.');
      }
    }
    await commit([...alarmsState, alarm]);
  }, []);

  const updateAlarm = useCallback(async (alarm: Alarm) => {
    if (alarm.on) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permission denied. Please enable notifications in Settings.');
      }
    }
    await commit(alarmsState.map((a) => (a.id === alarm.id ? alarm : a)));
  }, []);

  const deleteAlarm = useCallback(async (id: string) => {
    const next = alarmsState.filter((a) => a.id !== id);
    await commit(next);
    if (next.every((a) => !a.on)) {
      await cancelScheduledAlarm();
    }
  }, []);

  const toggleAlarm = useCallback(async (id: string) => {
    const target = alarmsState.find((a) => a.id === id);
    if (!target) return;
    if (!target.on) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        throw new Error('Notification permission denied. Please enable notifications in Settings.');
      }
    }
    await commit(alarmsState.map((a) => (a.id === id ? { ...a, on: !a.on } : a)));
  }, []);

  return useMemo(
    () => ({ alarms, isLoading, addAlarm, updateAlarm, deleteAlarm, toggleAlarm }),
    [alarms, isLoading, addAlarm, updateAlarm, deleteAlarm, toggleAlarm],
  );
}
