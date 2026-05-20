import { Alarm, AmPm, DayOfWeek } from '../constants/types';

/** Convert (hour 1..12, ampm) → 0..23 */
export function to24h(hour: number, ampm: AmPm): number {
  const h12 = hour % 12;
  return ampm === 'PM' ? h12 + 12 : h12;
}

/** Convert 0..23 → { hour 1..12, ampm } */
export function from24h(hour24: number): { hour: number; ampm: AmPm } {
  const ampm: AmPm = hour24 < 12 ? 'AM' : 'PM';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour, ampm };
}

/**
 * Compute the next datetime an alarm will fire, given current time `now`.
 *
 * - If repeat is empty (one-time): next occurrence is later today if still in
 *   the future, otherwise tomorrow.
 * - If repeat is non-empty: next occurrence is the soonest matching day-of-week
 *   (including today if the time is still future).
 */
export function nextOccurrence(alarm: Alarm, now: Date): Date {
  const h24 = to24h(alarm.hour, alarm.ampm);
  const candidate = new Date(now);
  candidate.setHours(h24, alarm.minute, 0, 0);

  if (alarm.repeat.length === 0) {
    if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
    return candidate;
  }

  // Repeating: check up to 7 days ahead for the next matching weekday.
  for (let offset = 0; offset < 8; offset++) {
    const probe = new Date(now);
    probe.setDate(probe.getDate() + offset);
    probe.setHours(h24, alarm.minute, 0, 0);
    const dow = probe.getDay() as DayOfWeek;
    if (alarm.repeat.includes(dow) && probe > now) {
      return probe;
    }
  }
  // Shouldn't be reachable if repeat is non-empty.
  return candidate;
}

export type NextAlarmInfo = {
  alarm: Alarm;
  fireAt: Date;
  msUntil: number;
};

/**
 * Of all enabled alarms, find the one that will fire soonest.
 * Returns null if no alarms are enabled.
 */
export function computeNextAlarm(alarms: Alarm[], now: Date = new Date()): NextAlarmInfo | null {
  const active = alarms.filter((a) => a.on);
  if (active.length === 0) return null;

  let best: NextAlarmInfo | null = null;
  for (const a of active) {
    const fireAt = nextOccurrence(a, now);
    const msUntil = fireAt.getTime() - now.getTime();
    if (!best || msUntil < best.msUntil) {
      best = { alarm: a, fireAt, msUntil };
    }
  }
  return best;
}

/** Format an interval as "1h 23m", "23m", or "1d 4h". */
export function formatInterval(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  const days = Math.floor(mins / (60 * 24));
  const hours = Math.floor((mins % (60 * 24)) / 60);
  const minutes = mins % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
