export interface VideoEntry {
  id: string;
  species: string;
  file: string;       // S3 key, e.g. "videos/v001.mp4"
  thumbnail: string;  // S3 key, e.g. "thumbnails/v001.jpg"
  description: string;
}

export interface Manifest {
  videos: VideoEntry[];
}

export interface DeviceHistory {
  device_id: string;
  assigned_videos: AssignedVideo[];
  last_assigned_date: string; // 'YYYY-MM-DD'
}

export interface AssignedVideo {
  videoId: string;
  assignedDate: string; // 'YYYY-MM-DD'
}

export interface DailyVideoResponse {
  videoId: string;
  videoUrl: string;
  thumbnailUrl: string;
  species: string;
  description: string;
}
