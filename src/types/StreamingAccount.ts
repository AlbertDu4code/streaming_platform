export type StreamingService =
  | "NETFLIX"
  | "AMAZON_PRIME"
  | "DISNEY_PLUS"
  | "HULU"
  | "HBO_MAX"
  | "SPOTIFY"
  | "APPLE_MUSIC"
  | "YOUTUBE_PREMIUM"
  | "TWITCH"
  | "OTHER";

export interface StreamingAccount {
  id: string;
  userId: string;
  service: StreamingService;
  accountName?: string;
  isActive: boolean;
  monthlyFee?: number;
  currency: string;
  billingDate?: number;
  apiKey?: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStreamingAccountRequest {
  service: StreamingService;
  accountName?: string;
  monthlyFee?: number;
  currency?: string;
  billingDate?: number;
  apiKey?: string;
  username?: string;
}

export interface UpdateStreamingAccountRequest {
  service?: StreamingService;
  accountName?: string;
  isActive?: boolean;
  monthlyFee?: number;
  currency?: string;
  billingDate?: number;
  apiKey?: string;
  username?: string;
}
