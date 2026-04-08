"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WatchedAnime, WATCH_STATUS_CN, WatchStatus } from "@/lib/types";
import { getGenreColor, GENRE_CN } from "@/lib/genreColors";

function BarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue: number }) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="w-20 shrink-0 truncate text-xs text-gray-400 sm:w-24">{item.label}</span>
          <div className="flex-1">
            <div
              className={`h-5 rounded-full ${item.color || "bg-sky-500/40"} transition-all duration-500`}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, minWidth: item.value > 0 ? "8px" : "0" }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-bold text-gray-300">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [watchedList, setWatchedList] = useState<WatchedAnime[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  // Basic stats
  const totalAnime = watchedList.length;
  const totalEpisodes = watchedList.reduce((sum, w) => sum + (w.episodes || 0), 0);
  const scoredList = watchedList.filter((w) => w.userScore);
  const avgUserScore = scoredList.length > 0
    ? (scoredList.reduce((sum, w) => sum + (w.userScore || 0), 0) / scoredList.length).toFixed(1)
    : "-";
  const avgAnilistScore = watchedList.filter((w) => w.averageScore).length > 0
    ? (watchedList.filter((w) => w.averageScore).reduce((sum, w) => sum + (w.averageScore || 0), 0) / watchedList.filter((w) => w.averageScore).length).toFixed(0)
    : "-";

  // Status distribution
  const statusCount: Record<string, number> = {};
  watchedList.forEach((w) => {
    const ws = w.watchStatus || "COMPLETED";
    statusCount[ws] = (statusCount[ws] || 0) + 1;
  });

  // Genre distribution
  const genreCount: Record<string, number> = {};
  watchedList.forEach((w) => {
    w.genres.forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });
  const genreData = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([genre, count]) => ({
      label: GENRE_CN[genre] || genre,
      value: count,
      color: getGenreColor(genre).split(" ")[0], // Just the bg class
    }));
  const maxGenre = genreData.length > 0 ? genreData[0].value : 0;

  // Score distribution (user scores)
  const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1}`,
    value: watchedList.filter((w) => w.userScore === i + 1).length,
  }));
  const maxScoreCount = Math.max(...scoreDistribution.map((s) => s.value), 1);

  // Estimated watch time (24 min per episode)
  const totalMinutes = totalEpisodes * 24;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = (totalHours / 24).toFixed(1);

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">观看统计</h1>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">你的番剧观看数据总览</p>
      </div>

      {totalAnime === 0 ? (
        <div className="py-20 text-center">
          <p className="text-base text-gray-500">还没有观看数据</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-sky-600 px-6 py-2 text-white hover:bg-sky-500"
          >
            去首页添加番剧
          </button>
        </div>
      ) : (
        <>
          {/* Overview cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard label="总番剧数" value={totalAnime} />
            <StatCard label="总集数" value={totalEpisodes} sub={`约 ${totalHours} 小时 (${totalDays} 天)`} />
            <StatCard label="我的平均分" value={avgUserScore} sub={`${scoredList.length} 部已评分`} />
            <StatCard label="AniList 均分" value={`${avgAnilistScore}%`} />
          </div>

          {/* Watch status */}
          <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-300">观看状态</h3>
            <div className="flex gap-4">
              {(Object.keys(WATCH_STATUS_CN) as WatchStatus[]).map((ws) => (
                <div key={ws} className="text-center">
                  <p className="text-2xl font-bold text-white">{statusCount[ws] || 0}</p>
                  <p className="text-xs text-gray-500">{WATCH_STATUS_CN[ws]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Genre chart */}
          <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-300">类型分布</h3>
            <BarChart data={genreData} maxValue={maxGenre} />
          </div>

          {/* Score distribution */}
          {scoredList.length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
              <h3 className="mb-3 text-sm font-bold text-gray-300">评分分布</h3>
              <div className="flex items-end gap-1 sm:gap-2" style={{ height: 120 }}>
                {scoreDistribution.map((s) => (
                  <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{s.value || ""}</span>
                    <div
                      className="w-full rounded-t bg-yellow-500/40 transition-all duration-500"
                      style={{
                        height: `${maxScoreCount > 0 ? (s.value / maxScoreCount) * 80 : 0}px`,
                        minHeight: s.value > 0 ? "4px" : "0",
                      }}
                    />
                    <span className="text-[10px] text-gray-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
