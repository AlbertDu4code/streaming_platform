export interface UsageRecord {
  id: string;
  userId: string;
  accountId: string;
  date: Date;
  duration: number; // 使用时长(分钟)
  episodeCount?: number; // 观看剧集数
  dataUsage?: number; // 数据使用量(GB)
  contentType?: string; // 电影、电视剧、音乐等
  genre?: string; // 类型
  quality?: string; // 画质/音质
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUsageRecordRequest {
  accountId: string;
  date: string; // ISO date string
  duration: number;
  episodeCount?: number;
  dataUsage?: number;
  contentType?: string;
  genre?: string;
  quality?: string;
}

export interface UpdateUsageRecordRequest {
  date?: string;
  duration?: number;
  episodeCount?: number;
  dataUsage?: number;
  contentType?: string;
  genre?: string;
  quality?: string;
}

export interface UsageStatistics {
  totalDuration: number;
  totalEpisodes: number;
  totalDataUsage: number;
  averageDurationPerDay: number;
  mostWatchedContentType: string;
  mostWatchedGenre: string;
}
