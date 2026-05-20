/** Time-of-day greeting shown at the top of the alarm list. */
export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 5) return 'The night birds rest.';
  if (h < 12) return 'The lark is calling.';
  if (h < 17) return 'Good afternoon, songbird.';
  if (h < 21) return 'Evening.';
  return 'Roost time. Sleep well.';
}

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Wednesday  ·  May 20" */
export function formatHeaderDate(d: Date = new Date()): string {
  return `${DAYS[d.getDay()]}  ·  ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Compact repeat description for an alarm card. */
export function formatRepeat(repeat: number[]): string {
  if (repeat.length === 0) return 'One-time';
  if (repeat.length === 7) return 'Every day';
  const weekdays = [1, 2, 3, 4, 5];
  if (repeat.length === 5 && weekdays.every((d) => repeat.includes(d))) return 'Weekdays';
  if (repeat.length === 2 && repeat.includes(0) && repeat.includes(6)) return 'Weekends';
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return [...repeat]
    .sort((a, b) => a - b)
    .map((d) => labels[d])
    .join(' ');
}
