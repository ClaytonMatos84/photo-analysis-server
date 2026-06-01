export interface YoutubePlayerResponseVideoDetails {
  videoId?: string;
  title?: string;
  lengthSeconds?: string;
  channelId?: string;
  shortDescription?: string;
  viewCount?: string;
  author?: string;
  isLiveContent?: boolean;
}

export interface YoutubePlayerMicroformatRenderer {
  likeCount?: string;
  category?: string;
  ownerProfileUrl?: string;
}

export interface YoutubePlayerResponseMicroformat {
  playerMicroformatRenderer?: YoutubePlayerMicroformatRenderer;
}

export interface YoutubeInitialPlayerResponse {
  videoDetails?: YoutubePlayerResponseVideoDetails;
  microformat?: YoutubePlayerResponseMicroformat;
}

export interface YoutubeAnalysisSummary {
  id: number;
  youtubeUrl: string;
  videoId: string | null;
  title: string | null;
  lengthSeconds: string | null;
  channelId: string | null;
  shortDescription: string | null;
  viewCount: string | null;
  author: string | null;
  isLiveContent: boolean;
  likeCount: string | null;
  category: string | null;
  ownerProfileUrl: string | null;
  createdAt: Date;
}

export interface PaginatedYoutubeAnalysisResultsDto {
  data: YoutubeAnalysisSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
