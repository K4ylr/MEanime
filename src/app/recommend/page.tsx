"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AnimeGrid from "@/components/AnimeGrid";
import LoadingGrid from "@/components/LoadingGrid";
import { Anime, WatchedAnime, AnimeTag } from "@/lib/types";
import { getRecommendations } from "@/lib/anilist";
import { ALL_GENRES, GENRE_CN, getGenreColor } from "@/lib/genreColors";

export default function RecommendPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
  const [topGenres, setTopGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Genre filter: "" = all, otherwise specific genre
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Store analyzed data for pagination
  const [currentGenres, setCurrentGenres] = useState<string[]>([]);
  const [analyzedTags, setAnalyzedTags] = useState<string[]>([]);
  const [excludeIds, setExcludeIds] = useState<number[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    fetchRecommendations("all");
  }, [session]);

  // mode: "all" = no genre filter, specific genre string = filter by that genre
  async function fetchRecommendations(genreFilter: string) {
    setLoading(true);
    setError("");
    setPage(1);

    try {
      const watchedRes = await fetch("/api/watched");
      const watchedData: WatchedAnime[] = await watchedRes.json();

      if (!Array.isArray(watchedData) || watchedData.length === 0) {
        setError("请先添加一些已看番剧，以便生成推荐");
        setLoading(false);
        return;
      }

      const ids = watchedData.map((w) => w.anilistId);
      setWatchedIds(new Set(ids));
      setExcludeIds(ids);

      // Analyze taste
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
      setAnalyzedTags(sortedTags);

      // "all" = empty genres array (no filter), otherwise single genre
      const useGenres = genreFilter === "all" ? [] : [genreFilter];
      setCurrentGenres(useGenres);

      const result = await getRecommendations(useGenres, sortedTags, ids, 1);
      setRecommendations(result.media);
      setHasNextPage(result.pageInfo.hasNextPage);
    } catch {
      setError("获取推荐失败，请稍后重试");
    }
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const result = await getRecommendations(currentGenres, analyzedTags, excludeIds, nextPage);
      setRecommendations((prev) => [...prev, ...result.media]);
      setHasNextPage(result.pageInfo.hasNextPage);
      setPage(nextPage);
    } catch {
      // silent
    }
    setLoadingMore(false);
  }

  function handleGenreFilter(genre: string) {
    setSelectedGenre(genre);
    fetchRecommendations(genre || "all");
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">智能推荐</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          根据你的观看记录和品味，为你推荐相似的优秀番剧
        </p>
      </div>

      {/* Taste Profile */}
      {topGenres.length > 0 && (
        <div className="mb-4 rounded-xl border border-gray-800 bg-gray-900 p-3 sm:mb-6 sm:p-4">
          <h3 className="mb-2 text-xs font-medium text-gray-400 sm:text-sm">
            你偏好的类型：
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {topGenres.map((genre) => (
              <span
                key={genre}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium sm:px-3 sm:py-1 sm:text-sm ${getGenreColor(genre)}`}
              >
                {GENRE_CN[genre] || genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Genre Filter */}
      <div className="mb-4 sm:mb-6">
        <h3 className="mb-2 text-xs font-medium text-gray-400 sm:text-sm">按类型筛选：</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleGenreFilter("")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              !selectedGenre
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                : "bg-gray-800 text-gray-400 border border-transparent hover:bg-gray-700"
            }`}
          >
            全部
          </button>
          {ALL_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreFilter(genre)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedGenre === genre
                  ? getGenreColor(genre)
                  : "border-transparent bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {GENRE_CN[genre] || genre}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="py-20 text-center">
          <p className="text-base text-gray-500 sm:text-lg">{error}</p>
          {error.includes("添加") && (
            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-lg bg-sky-600 px-6 py-2 text-white hover:bg-sky-500"
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
        <>
          <AnimeGrid
            animeList={recommendations}
            watchedIds={watchedIds}
            onWatchToggle={handleWatchToggle}
          />
          {hasNextPage && (
            <div className="mt-6 text-center sm:mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-xl bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50 sm:px-8 sm:py-3"
              >
                {loadingMore ? "加载中..." : "加载更多"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
