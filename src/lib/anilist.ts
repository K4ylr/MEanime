import { Anime, AnimeDetail, PageInfo } from "./types";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  id
  title { romaji native english }
  coverImage { large color }
  bannerImage
  averageScore
  popularity
  genres
  episodes
  status
  description(asHtml: false)
  format
  season
  seasonYear
  tags { name rank }
  studios(isMain: true) { nodes { name } }
  nextAiringEpisode { episode airingAt }
`;

const MEDIA_FIELDS_MINIMAL = `
  id
  title { romaji native english }
  coverImage { large color }
  averageScore
  popularity
  genres
  episodes
  status
  format
  season
  seasonYear
  tags { name rank }
  studios(isMain: true) { nodes { name } }
  nextAiringEpisode { episode airingAt }
`;

async function queryAniList(query: string, variables: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList query failed");
  return json.data;
}

// Current season helper
function getCurrentSeason(): { season: string; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (month >= 1 && month <= 3) return { season: "WINTER", year };
  if (month >= 4 && month <= 6) return { season: "SPRING", year };
  if (month >= 7 && month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

function getNextSeason(): { season: string; year: number } {
  const { season, year } = getCurrentSeason();
  const order = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const idx = order.indexOf(season);
  if (idx === 3) return { season: "WINTER", year: year + 1 };
  return { season: order[idx + 1], year };
}

// Search with pagination
export async function searchAnime(
  search: string,
  page = 1,
  filters?: {
    genre?: string;
    year?: number;
    season?: string;
    format?: string;
    status?: string;
  }
): Promise<{ media: Anime[]; pageInfo: PageInfo }> {
  const query = `
    query ($search: String, $page: Int, $genre: String, $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus) {
      Page(page: $page, perPage: 20) {
        pageInfo { hasNextPage currentPage lastPage }
        media(search: $search, type: ANIME, sort: POPULARITY_DESC,
              genre: $genre, seasonYear: $year, season: $season,
              format: $format, status: $status) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, {
    search: search || undefined,
    page,
    genre: filters?.genre || undefined,
    year: filters?.year || undefined,
    season: filters?.season || undefined,
    format: filters?.format || undefined,
    status: filters?.status || undefined,
  })) as {
    Page: { media: Anime[]; pageInfo: PageInfo };
  };
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}

// Homepage sections
export async function getTrendingThisSeason(): Promise<Anime[]> {
  const { season, year } = getCurrentSeason();
  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(perPage: 8) {
        media(type: ANIME, sort: TRENDING_DESC, season: $season, seasonYear: $year) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { season, year })) as {
    Page: { media: Anime[] };
  };
  return data.Page.media;
}

export async function getPopularThisSeason(): Promise<Anime[]> {
  const { season, year } = getCurrentSeason();
  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(perPage: 8) {
        media(type: ANIME, sort: POPULARITY_DESC, season: $season, seasonYear: $year) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { season, year })) as {
    Page: { media: Anime[] };
  };
  return data.Page.media;
}

export async function getUpcomingNextSeason(): Promise<Anime[]> {
  const { season, year } = getNextSeason();
  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(perPage: 8) {
        media(type: ANIME, sort: POPULARITY_DESC, season: $season, seasonYear: $year, status: NOT_YET_RELEASED) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { season, year })) as {
    Page: { media: Anime[] };
  };
  return data.Page.media;
}

export async function getAllTimePopular(): Promise<Anime[]> {
  const query = `
    query {
      Page(perPage: 8) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, {})) as {
    Page: { media: Anime[] };
  };
  return data.Page.media;
}

// Anime detail page
export async function getAnimeDetail(id: number): Promise<AnimeDetail> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        trending
        recommendations(perPage: 10, sort: RATING_DESC) {
          nodes {
            mediaRecommendation {
              ${MEDIA_FIELDS_MINIMAL}
            }
          }
        }
        reviews(sort: RATING_DESC, perPage: 5) {
          nodes {
            summary
            score
            user {
              name
              avatar { medium }
            }
          }
        }
      }
    }
  `;
  const data = (await queryAniList(query, { id })) as {
    Media: AnimeDetail;
  };
  return data.Media;
}

// Improved recommendations with pagination
export async function getRecommendations(
  genres: string[],
  tags: string[],
  excludeIds: number[],
  page = 1
): Promise<{ media: Anime[]; pageInfo: PageInfo }> {
  const query = `
    query ($genres: [String], $idNotIn: [Int], $page: Int) {
      Page(page: $page, perPage: 30) {
        pageInfo { hasNextPage currentPage lastPage }
        media(type: ANIME, genre_in: $genres, id_not_in: $idNotIn,
              sort: POPULARITY_DESC, averageScore_greater: 40) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, {
    genres: genres.length > 0 ? genres : undefined,
    idNotIn: excludeIds.length > 0 ? excludeIds : undefined,
    page,
  })) as {
    Page: { media: Anime[]; pageInfo: PageInfo };
  };

  let media = data.Page.media;

  // If we have tags, score results higher if they match user tags
  if (tags.length > 0) {
    const tagSet = new Set(tags.map((t) => t.toLowerCase()));
    media = media.sort((a, b) => {
      const aTagScore = a.tags.filter((t) => tagSet.has(t.name.toLowerCase())).length;
      const bTagScore = b.tags.filter((t) => tagSet.has(t.name.toLowerCase())).length;
      if (bTagScore !== aTagScore) return bTagScore - aTagScore;
      return (b.averageScore || 0) - (a.averageScore || 0);
    });
  }

  return { media, pageInfo: data.Page.pageInfo };
}

// Browse with full filters and pagination (for "View All" pages)
export async function browseAnime(
  page = 1,
  filters?: {
    genre?: string;
    year?: number;
    season?: string;
    format?: string;
    status?: string;
    sort?: string;
  }
): Promise<{ media: Anime[]; pageInfo: PageInfo }> {
  // Map sort string to AniList enum
  const sortMap: Record<string, string> = {
    TRENDING: "TRENDING_DESC",
    POPULARITY: "POPULARITY_DESC",
    SCORE: "SCORE_DESC",
    NEWEST: "START_DATE_DESC",
  };
  const sort = sortMap[filters?.sort || "POPULARITY"] || "POPULARITY_DESC";

  const query = `
    query ($page: Int, $genre: String, $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus) {
      Page(page: $page, perPage: 20) {
        pageInfo { hasNextPage currentPage lastPage }
        media(type: ANIME, sort: ${sort},
              genre: $genre, seasonYear: $year, season: $season,
              format: $format, status: $status) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, {
    page,
    genre: filters?.genre || undefined,
    year: filters?.year || undefined,
    season: filters?.season || undefined,
    format: filters?.format || undefined,
    status: filters?.status || undefined,
  })) as {
    Page: { media: Anime[]; pageInfo: PageInfo };
  };
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}

// Legacy export for backward compatibility
export async function getTrendingAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(perPage: 20) {
        media(type: ANIME, sort: TRENDING_DESC) {
          ${MEDIA_FIELDS_MINIMAL}
        }
      }
    }
  `;
  const data = (await queryAniList(query, {})) as {
    Page: { media: Anime[] };
  };
  return data.Page.media;
}
