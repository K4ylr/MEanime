"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { AnimeDetail, Anime, WatchStatus, WATCH_STATUS_CN } from "@/lib/types";
import { getAnimeDetail } from "@/lib/anilist";
import { getGenreColor, GENRE_CN, TAG_CN } from "@/lib/genreColors";
import { getBahamutUrl, getBilibiliUrl } from "@/lib/links";

const STATUS_CN: Record<string, string> = {
  FINISHED: "完结",
  RELEASING: "连载中",
  NOT_YET_RELEASED: "未放送",
  CANCELLED: "已取消",
  HIATUS: "休刊中",
};

const FORMAT_CN: Record<string, string> = {
  TV: "TV 动画",
  TV_SHORT: "TV 短篇",
  MOVIE: "剧场版",
  SPECIAL: "特别篇",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "音乐",
};

const SEASON_CN: Record<string, string> = {
  WINTER: "冬",
  SPRING: "春",
  SUMMER: "夏",
  FALL: "秋",
};

// Chinese title cache (shared across components on this page)
const cnCache = new Map<string, string | null>();

async function fetchChineseInfo(keyword: string): Promise<{ title: string | null; summary: string | null; bgmId: number | null }> {
  try {
    const res = await fetch(`/api/chinese-title?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    return { title: data.title || null, summary: data.summary || null, bgmId: data.bgmId || null };
  } catch {
    return { title: null, summary: null, bgmId: null };
  }
}

function useChineseTitle(keyword: string | null) {
  const [cnTitle, setCnTitle] = useState<string | null>(null);
  useEffect(() => {
    if (!keyword) return;
    if (cnCache.has(keyword)) {
      setCnTitle(cnCache.get(keyword) || null);
      return;
    }
    fetch(`/api/chinese-title?keyword=${encodeURIComponent(keyword)}`)
      .then((r) => r.json())
      .then((d) => {
        cnCache.set(keyword, d.title || null);
        setCnTitle(d.title || null);
      })
      .catch(() => {});
  }, [keyword]);
  return cnTitle;
}

function RecCard({ rec }: { rec: Anime }) {
  const keyword = rec.title.native || rec.title.romaji;
  const cnTitle = useChineseTitle(keyword);
  const displayTitle = cnTitle || rec.title.native || rec.title.romaji;
  return (
    <Link href={`/anime/${rec.id}`} className="group w-36 shrink-0 sm:w-40">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
        <Image
          src={rec.coverImage.large}
          alt={displayTitle}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="160px"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-gray-300 group-hover:text-sky-300">
        {displayTitle}
      </p>
      {rec.averageScore && (
        <p className={`text-xs ${rec.averageScore >= 75 ? "text-green-400" : rec.averageScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
          {rec.averageScore}%
        </p>
      )}
    </Link>
  );
}

function ScoreCircle({ score }: { score: number | null }) {
  if (score == null) return null;
  const color = score >= 75 ? "text-green-400 border-green-500" : score >= 50 ? "text-yellow-400 border-yellow-500" : "text-red-400 border-red-500";
  return (
    <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${color}`}>
      <span className="text-xl font-bold">{score}%</span>
    </div>
  );
}

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [cnTitle, setCnTitle] = useState<string | null>(null);
  const [cnSummary, setCnSummary] = useState<string | null>(null);
  const [bgmComments, setBgmComments] = useState<{ user: string; comment: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [watchStatus, setWatchStatus] = useState<WatchStatus>("COMPLETED");
  const [userScore, setUserScore] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const detail = await getAnimeDetail(parseInt(id));
        setAnime(detail);
        // Fetch Chinese title + summary + bgmId
        const keyword = detail.title.native || detail.title.romaji;
        const info = await fetchChineseInfo(keyword);
        setCnTitle(info.title);
        setCnSummary(info.summary);
        // Fetch Bangumi comments if we have a subject ID
        if (info.bgmId) {
          fetch(`/api/chinese-title?bgmId=${info.bgmId}`)
            .then((r) => r.json())
            .then((d) => { if (d.comments) setBgmComments(d.comments); })
            .catch(() => {});
        }
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Check watched status
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/watched")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const entry = data.find((w: { anilistId: number }) => w.anilistId === parseInt(id));
          if (entry) {
            setIsWatched(true);
            setWatchStatus(entry.watchStatus || "COMPLETED");
            setUserScore(entry.userScore || null);
          }
        }
      })
      .catch(() => {});
  }, [session, id]);

  async function handleSetStatus(status: WatchStatus) {
    if (!session?.user || !anime) {
      window.location.href = "/login";
      return;
    }
    if (isWatched) {
      await fetch("/api/watched", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anilistId: anime.id, watchStatus: status }),
      });
      setWatchStatus(status);
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
          watchStatus: status,
        }),
      });
      setIsWatched(true);
      setWatchStatus(status);
    }
  }

  async function handleSetScore(score: number) {
    if (!session?.user || !anime || !isWatched) return;
    await fetch("/api/watched", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anilistId: anime.id, userScore: score }),
    });
    setUserScore(score);
  }

  async function handleRemove() {
    if (!anime) return;
    await fetch(`/api/watched?anilistId=${anime.id}`, { method: "DELETE" });
    setIsWatched(false);
    setUserScore(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="py-20 text-center text-gray-500">
        番剧不存在或加载失败
        <br />
        <Link href="/" className="mt-4 inline-block text-sky-400 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const displayTitle = cnTitle || anime.title.english || anime.title.romaji;
  const studioName = anime.studios?.nodes?.[0]?.name;
  const recommendations = anime.recommendations?.nodes
    ?.map((n) => n.mediaRecommendation)
    .filter((r): r is Anime => r != null) || [];
  const reviews = anime.reviews?.nodes || [];
  const bilibiliUrl = getBilibiliUrl(cnTitle, anime.title.english, anime.title.romaji);
  const bahamutUrl = getBahamutUrl(anime.title.native, anime.title.romaji);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      {anime.bannerImage && (
        <div className="relative h-48 w-full sm:h-64 md:h-80">
          <Image
            src={anime.bannerImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/60 to-gray-950" />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        {/* Main info */}
        <div className={`flex flex-col gap-4 sm:flex-row sm:gap-6 ${anime.bannerImage ? "-mt-16 sm:-mt-24 relative z-10" : "pt-6 sm:pt-8"}`}>
          {/* Cover */}
          <div className="shrink-0">
            <div className="relative mx-auto h-56 w-40 overflow-hidden rounded-xl shadow-2xl sm:mx-0 sm:h-80 sm:w-56">
              <Image
                src={anime.coverImage.large}
                alt={displayTitle}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Action buttons under cover */}
            <div className="mt-4 flex flex-col gap-2">
              {/* Watch status buttons */}
              <div className="flex gap-1.5">
                {(Object.keys(WATCH_STATUS_CN) as WatchStatus[]).map((ws) => (
                  <button
                    key={ws}
                    onClick={() => handleSetStatus(ws)}
                    className={`flex-1 rounded-xl py-2 text-xs font-medium transition-colors sm:text-sm ${
                      isWatched && watchStatus === ws
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                        : "bg-gray-800 text-gray-400 border border-transparent hover:bg-gray-700"
                    }`}
                  >
                    {WATCH_STATUS_CN[ws]}
                  </button>
                ))}
              </div>
              {/* Remove button */}
              {isWatched && (
                <button
                  onClick={handleRemove}
                  className="w-full rounded-xl py-1.5 text-xs text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  移除记录
                </button>
              )}
              {/* Rating */}
              {isWatched && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                  <p className="mb-2 text-xs text-gray-400">我的评分</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                      <button
                        key={score}
                        onClick={() => handleSetScore(score)}
                        className={`flex-1 rounded py-1 text-xs font-bold transition-colors ${
                          userScore && score <= userScore
                            ? "bg-yellow-500/30 text-yellow-400"
                            : "bg-gray-800 text-gray-600 hover:bg-gray-700 hover:text-gray-400"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  {userScore && (
                    <p className="mt-1.5 text-center text-sm font-bold text-yellow-400">{userScore}/10</p>
                  )}
                </div>
              )}
              <a
                href={bahamutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-orange-600/20 py-2.5 text-center text-sm font-medium text-orange-400 transition-colors hover:bg-orange-600/30"
              >
                在动画疯搜索
              </a>
              <a
                href={bilibiliUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-sky-600/20 py-2.5 text-center text-sm font-medium text-sky-400 transition-colors hover:bg-sky-600/30"
              >
                在B站搜索
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 sm:pt-28">
            <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">{displayTitle}</h1>
            <div className="mt-2 space-y-0.5">
              {anime.title.native && (
                <p className="text-sm text-gray-400">{anime.title.native}</p>
              )}
              {anime.title.english && anime.title.english !== displayTitle && (
                <p className="text-sm text-gray-400">{anime.title.english}</p>
              )}
              {anime.title.romaji !== displayTitle && (
                <p className="text-sm text-gray-500">{anime.title.romaji}</p>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <ScoreCircle score={anime.averageScore} />
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                {anime.format && (
                  <span className="rounded-lg bg-gray-800 px-2.5 py-1">
                    {FORMAT_CN[anime.format] || anime.format}
                  </span>
                )}
                {anime.episodes && (
                  <span className="rounded-lg bg-gray-800 px-2.5 py-1">{anime.episodes} 集</span>
                )}
                {anime.status && (
                  <span className="rounded-lg bg-gray-800 px-2.5 py-1">
                    {STATUS_CN[anime.status] || anime.status}
                  </span>
                )}
                {anime.season && anime.seasonYear && (
                  <span className="rounded-lg bg-gray-800 px-2.5 py-1">
                    {anime.seasonYear} {SEASON_CN[anime.season] || anime.season}季
                  </span>
                )}
                {studioName && (
                  <span className="rounded-lg bg-sky-500/10 px-2.5 py-1 text-sky-400">
                    {studioName}
                  </span>
                )}
                {anime.popularity && (
                  <span className="text-gray-500">人气 {anime.popularity.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Next airing */}
            {anime.nextAiringEpisode && (
              <div className="mt-3 rounded-lg bg-teal-500/10 px-3 py-2 text-sm text-teal-400">
                第 {anime.nextAiringEpisode.episode} 集将于{" "}
                {new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleDateString("zh-CN", {
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                播出
              </div>
            )}

            {/* Genres */}
            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getGenreColor(genre)}`}
                >
                  {GENRE_CN[genre] || genre}
                </span>
              ))}
            </div>

            {/* Description - only show Chinese summary */}
            {cnSummary && (
              <div className="mt-4">
                <p className="leading-relaxed text-gray-300">{cnSummary}</p>
              </div>
            )}

            {/* Tags */}
            {anime.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {anime.tags.slice(0, 15).map((tag) => (
                  <span key={tag.name} className="rounded-lg bg-gray-800 px-2 py-1 text-xs text-gray-500">
                    {TAG_CN[tag.name] || tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-white">相似推荐</h2>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {recommendations.map((rec) => (
                <RecCard key={rec.id} rec={rec} />
              ))}
            </div>
          </section>
        )}

        {/* Comments: Bangumi Chinese first, AniList fallback */}
        {bgmComments.length > 0 ? (
          <section className="mt-12 pb-12">
            <h2 className="mb-4 text-lg font-bold text-white">用户短评</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {bgmComments.map((c, idx) => (
                <div key={idx} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">{c.user}</span>
                    {c.rate > 0 && (
                      <span className={`ml-auto text-sm font-bold ${c.rate >= 8 ? "text-green-400" : c.rate >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                        {c.rate}/10
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {c.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : reviews.length > 0 ? (
          <section className="mt-12 pb-12">
            <h2 className="mb-4 text-lg font-bold text-white">用户评价</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {reviews.map((review, idx) => (
                <div key={idx} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <div className="flex items-center gap-3">
                    {review.user.avatar?.medium && (
                      <Image
                        src={review.user.avatar.medium}
                        alt={review.user.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-300">{review.user.name}</span>
                    <span className={`ml-auto text-sm font-bold ${review.score >= 75 ? "text-green-400" : review.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {review.score}/100
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-400">
                    {review.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
