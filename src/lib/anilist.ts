import { Anime } from "./types";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  id
  title { romaji native english }
  coverImage { large }
  averageScore
  genres
  episodes
  status
  description(asHtml: false)
  format
  season
  seasonYear
  tags { name rank }
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

export async function searchAnime(search: string, page = 1): Promise<Anime[]> {
  const query = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 20) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = (await queryAniList(query, { search, page })) as {
    Page: { media: Anime[] };
  };
  return data.Page.media;
}

export async function getTrendingAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(perPage: 20) {
        media(type: ANIME, sort: TRENDING_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = (await queryAniList(query, {})) as {
    Page: { media: Anime[] };
  };
  return data.Page.media;
}

export async function getRecommendations(
  genres: string[],
  tags: string[],
  excludeIds: number[]
): Promise<Anime[]> {
  const query = `
    query ($genres: [String], $idNotIn: [Int]) {
      Page(perPage: 30) {
        media(type: ANIME, genre_in: $genres, id_not_in: $idNotIn, sort: SCORE_DESC, averageScore_greater: 60) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = (await queryAniList(query, {
    genres: genres.length > 0 ? genres : undefined,
    idNotIn: excludeIds.length > 0 ? excludeIds : undefined,
  })) as {
    Page: { media: Anime[] };
  };

  // If we have tags, score results higher if they match user tags
  if (tags.length > 0) {
    const tagSet = new Set(tags.map((t) => t.toLowerCase()));
    return data.Page.media.sort((a, b) => {
      const aTagScore = a.tags.filter((t) => tagSet.has(t.name.toLowerCase())).length;
      const bTagScore = b.tags.filter((t) => tagSet.has(t.name.toLowerCase())).length;
      if (bTagScore !== aTagScore) return bTagScore - aTagScore;
      return (b.averageScore || 0) - (a.averageScore || 0);
    });
  }

  return data.Page.media;
}
