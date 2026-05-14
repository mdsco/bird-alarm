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

export interface VideoLibraryEntry {
  videoId: string;
  species: string;
  thumbnailUrl: string;
  localPath: string | null;
  watchedDate: string; // 'YYYY-MM-DD'
}
