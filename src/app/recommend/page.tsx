"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AnimeGrid from "@/components/AnimeGrid";
import LoadingGrid from "@/components/LoadingGrid";
import { Anime, WatchedAnime, AnimeTag } from "@/lib/types";

export default function RecommendPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
  const [topGenres, setTopGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    fetchRecommendations();
  }, [session]);

  async function fetchRecommendations() {
    setLoading(true);
    setError("");

    try {
      // Get watched list
      const watchedRes = await fetch("/api/watched");
      const watchedData: WatchedAnime[] = await watchedRes.json();

      if (!Array.isArray(watchedData) || watchedData.length === 0) {
        setError("请先添加一些已看番剧，以便生成推荐");
        setLoading(false);
        return;
      }

      const ids = watchedData.map((w) => w.anilistId);
      setWatchedIds(new Set(ids));

      // Analyze taste - count genres and tags
      const genreCount: Record<string, number> = {};
      const tagCount: Record<string, number> = {};

      watchedData.forEach((w) => {
        w.genres.forEach((g) => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
        w.tags.forEach((t: AnimeTag) => {
          tagCount[t.name] = (tagCount[t.name] || 0) + 1;
        });
      });

      const sortedGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([g]) => g);

      const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([t]) => t);

      setTopGenres(sortedGenres);

      // Query AniList for recommendations
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query ($genres: [String], $idNotIn: [Int]) {
            Page(perPage: 30) {
              media(type: ANIME, genre_in: $genres, id_not_in: $idNotIn, sort: SCORE_DESC, averageScore_greater: 60) {
                id title { romaji native english }
                coverImage { large } averageScore genres
                episodes status description format season seasonYear
                tags { name rank }
              }
            }
          }`,
          variables: {
            genres: sortedGenres.length > 0 ? sortedGenres : undefined,
            idNotIn: ids.length > 0 ? ids : undefined,
          },
        }),
      });

      const json = await res.json();
      let results: Anime[] = json.data.Page.media;

      // Re-rank by tag match
      if (sortedTags.length > 0) {
        const tagSet = new Set(sortedTags.map((t) => t.toLowerCase()));
        results = results.sort((a, b) => {
          const aScore = a.tags.filter((t) =>
            tagSet.has(t.name.toLowerCase())
          ).length;
          const bScore = b.tags.filter((t) =>
            tagSet.has(t.name.toLowerCase())
          ).length;
          if (bScore !== aScore) return bScore - aScore;
          return (b.averageScore || 0) - (a.averageScore || 0);
        });
      }

      setRecommendations(results);
    } catch {
      setError("获取推荐失败，请稍后重试");
    }
    setLoading(false);
  }

  async function handleWatchToggle(anime: Anime) {
    const isWatched = watchedIds.has(anime.id);

    if (isWatched) {
      await fetch(`/api/watched?anilistId=${anime.id}`, { method: "DELETE" });
      setWatchedIds((prev) => {
        const next = new Set(prev);
        next.delete(anime.id);
        return next;
      });
    } else {
      await fetch("/api/watched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anilistId: anime.id,
          titleRomaji: anime.title.romaji,
          titleNative: anime.title.native,
          titleEnglish: anime.title.english,
          coverImage: anime.coverImage.large,
          averageScore: anime.averageScore,
          genres: anime.genres,
          tags: anime.tags,
          episodes: anime.episodes,
          status: anime.status,
        }),
      });
      setWatchedIds((prev) => new Set(prev).add(anime.id));
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">智能推荐</h1>
        <p className="mt-1 text-sm text-gray-500">
          根据你的观看记录和品味，为你推荐相似的优秀番剧
        </p>
      </div>

      {/* Taste Profile */}
      {topGenres.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-2 text-sm font-medium text-gray-400">
            因为你喜欢这些类型：
          </h3>
          <div className="flex flex-wrap gap-2">
            {topGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 text-sm font-medium text-purple-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <div className="py-20 text-center">
          <p className="text-lg text-gray-500">{error}</p>
          {error.includes("添加") && (
            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-500"
            >
              去首页添加番剧
            </button>
          )}
        </div>
      ) : loading ? (
        <LoadingGrid />
      ) : recommendations.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          暂无推荐结果，试试多添加一些已看番剧
        </div>
      ) : (
        <AnimeGrid
          animeList={recommendations}
          watchedIds={watchedIds}
          onWatchToggle={handleWatchToggle}
        />
      )}
    </div>
  );
}
