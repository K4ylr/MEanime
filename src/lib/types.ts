export interface AnimeTitle {
  romaji: string;
  native: string | null;
  english: string | null;
}

export interface AnimeTag {
  name: string;
  rank: number;
}

export interface AnimeStudio {
  name: string;
}

export interface NextAiringEpisode {
  episode: number;
  airingAt: number;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  coverImage: { large: string; color?: string | null };
  bannerImage?: string | null;
  averageScore: number | null;
  popularity?: number | null;
  genres: string[];
  episodes: number | null;
  status: string | null;
  description: string | null;
  format: string | null;
  season: string | null;
  seasonYear: number | null;
  tags: AnimeTag[];
  studios?: { nodes: AnimeStudio[] };
  nextAiringEpisode?: NextAiringEpisode | null;
  chineseTitle?: string;
}

export interface AnimeReview {
  summary: string;
  score: number;
  user: {
    name: string;
    avatar: { medium: string };
  };
}

export interface AnimeDetail extends Anime {
  bannerImage: string | null;
  popularity: number | null;
  trending: number | null;
  studios: { nodes: AnimeStudio[] };
  recommendations: {
    nodes: { mediaRecommendation: Anime | null }[];
  };
  reviews: {
    nodes: AnimeReview[];
  };
}

export interface WatchedAnime {
  id: string;
  anilistId: number;
  titleRomaji: string;
  titleNative: string | null;
  titleEnglish: string | null;
  coverImage: string;
  averageScore: number | null;
  genres: string[];
  tags: AnimeTag[];
  episodes: number | null;
  status: string | null;
  addedAt: string;
  chineseTitle?: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  currentPage: number;
  lastPage: number;
}
