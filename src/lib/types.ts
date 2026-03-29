export interface AnimeTitle {
  romaji: string;
  native: string | null;
  english: string | null;
}

export interface AnimeTag {
  name: string;
  rank: number;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  coverImage: { large: string };
  averageScore: number | null;
  genres: string[];
  episodes: number | null;
  status: string | null;
  description: string | null;
  format: string | null;
  season: string | null;
  seasonYear: number | null;
  tags: AnimeTag[];
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
}
