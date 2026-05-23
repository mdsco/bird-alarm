export interface DailyVideoMetadata {
  videoId: string;
  videoUrl: string;       // CloudFront URL
  thumbnailUrl: string;   // CloudFront thumbnail URL
  species: string;
  description: string;
  localPath: string | null; // null until downloaded
  assignedDate: string;   // 'YYYY-MM-DD'
}

export interface AlarmTime {
  hour: number;    // 0–23
  minute: number;  // 0–59
}

export type AmPm = 'AM' | 'PM';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday

export interface Alarm {
  id: string;
  hour: number;        // 1..12
  minute: number;      // 0..59
  ampm: AmPm;
  label: string;
  repeat: DayOfWeek[]; // empty = one-time (fires once at next occurrence)
  on: boolean;
}

export interface VideoLibraryEntry {
  videoId: string;
  species: string;
  thumbnailUrl: string;
  localPath: string | null;
  watchedDate: string; // 'YYYY-MM-DD'
}
