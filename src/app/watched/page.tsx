"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { WatchedAnime } from "@/lib/types";
import { getBahamutUrl, getBilibiliUrl } from "@/lib/links";
import { getGenreColor, GENRE_CN } from "@/lib/genreColors";

// Client-side Chinese title cache
const cnTitleCache = new Map<number, string | null>();

function useChineseTitles(watchedList: WatchedAnime[]) {
  const [titles, setTitles] = useState<Map<number, string | null>>(new Map());

  useEffect(() => {
    watchedList.forEach((anime) => {
      if (cnTitleCache.has(anime.anilistId)) {
        setTitles((prev) => new Map(prev).set(anime.anilistId, cnTitleCache.get(anime.anilistId) || null));
        return;
      }
      const keyword = anime.titleNative || anime.titleRomaji;
      fetch(`/api/chinese-title?keyword=${encodeURIComponent(keyword)}`)
        .then((res) => res.json())
        .then((data) => {
          cnTitleCache.set(anime.anilistId, data.title);
          setTitles((prev) => new Map(prev).set(anime.anilistId, data.title));
        })
        .catch(() => {
          cnTitleCache.set(anime.anilistId, null);
        });
    });
  }, [watchedList]);

  return titles;
}

export default function WatchedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [watchedList, setWatchedList] = useState<WatchedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const cnTitles = useChineseTitles(watchedList);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/watched")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWatchedList(data);
      })
      .finally(() => setLoading(false));
  }, [session]);

  async function handleRemove(anilistId: number) {
    await fetch(`/api/watched?anilistId=${anilistId}`, { method: "DELETE" });
    setWatchedList((prev) => prev.filter((w) => w.anilistId !== anilistId));
  }

  // Genre stats
  const genreCount: Record<string, number> = {};
  watchedList.forEach((w) => {
    w.genres.forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          我的已看列表
          <span className="ml-2 text-lg font-normal text-gray-500">
            ({watchedList.length} 部)
          </span>
        </h1>
      </div>

      {/* Genre Stats */}
      {topGenres.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            你的观看口味
          </h3>
          <div className="flex flex-wrap gap-2">
            {topGenres.map(([genre, count]) => (
              <span
                key={genre}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${getGenreColor(genre)}`}
              >
                {GENRE_CN[genre] || genre}{" "}
                <span className="opacity-60">x{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {watchedList.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-gray-500">还没有记录任何番剧</p>
          <p className="mt-2 text-sm text-gray-600">
            去首页搜索并添加你看过的番剧吧！
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchedList.map((anime) => {
            const cnTitle = cnTitles.get(anime.anilistId);
            const displayTitle = cnTitle || anime.titleEnglish || anime.titleRomaji;
            const bilibiliUrl = getBilibiliUrl(cnTitle || null, anime.titleEnglish, anime.titleRomaji);
            return (
              <div
                key={anime.id}
                className="flex gap-4 rounded-xl border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
              >
                {/* Cover */}
                <Link href={`/anime/${anime.anilistId}`} className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={anime.coverImage}
                    alt={displayTitle}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/anime/${anime.anilistId}`}>
                      <h3 className="font-semibold text-gray-100 hover:text-sky-300 transition-colors">
                        {displayTitle}
                      </h3>
                    </Link>
                    {anime.titleNative && anime.titleNative !== displayTitle && (
                      <p className="text-xs text-gray-500">{anime.titleNative}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {anime.genres.slice(0, 4).map((g) => (
                        <span
                          key={g}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getGenreColor(g)}`}
                        >
                          {GENRE_CN[g] || g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {anime.averageScore && (
                      <span
                        className={
                          anime.averageScore >= 75
                            ? "text-green-400"
                            : anime.averageScore >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                        }
                      >
                        {anime.averageScore}%
                      </span>
                    )}
                    {anime.episodes && <span>{anime.episodes} 集</span>}
                    <span>
                      添加于{" "}
                      {new Date(anime.addedAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col items-end justify-between gap-1">
                  <button
                    onClick={() => handleRemove(anime.anilistId)}
                    className="rounded-lg px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  >
                    移除
                  </button>
                  <div className="flex gap-1">
                    <a
                      href={getBahamutUrl(anime.titleNative, anime.titleRomaji)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-orange-600/20 px-2 py-1 text-xs text-orange-400 hover:bg-orange-600/30"
                    >
                      动画疯
                    </a>
                    <a
                      href={bilibiliUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-sky-600/20 px-2 py-1 text-xs text-sky-400 hover:bg-sky-600/30"
                    >
                      B站
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
