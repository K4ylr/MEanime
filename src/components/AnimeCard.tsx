"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Anime, WatchStatus, WATCH_STATUS_CN } from "@/lib/types";
import { getGenreColor } from "@/lib/genreColors";
import { GENRE_CN } from "@/lib/genreColors";

// Global client-side cache for Chinese titles
const cnTitleCache = new Map<number, string | null>();

function useChineseTitle(anime: Anime): string | null {
  const [cnTitle, setCnTitle] = useState<string | null>(
    anime.chineseTitle || cnTitleCache.get(anime.id) || null
  );

  useEffect(() => {
    if (cnTitle || cnTitleCache.has(anime.id)) return;
    const keyword = anime.title.native || anime.title.romaji;
    fetch(`/api/chinese-title?keyword=${encodeURIComponent(keyword)}`)
      .then((res) => res.json())
      .then((data) => {
        cnTitleCache.set(anime.id, data.title);
        if (data.title) setCnTitle(data.title);
      })
      .catch(() => {
        cnTitleCache.set(anime.id, null);
      });
  }, [anime.id, anime.title.native, anime.title.romaji, cnTitle]);

  return cnTitle;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score >= 75
      ? "bg-green-500/20 text-green-400 border-green-500/40"
      : score >= 50
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
        : "bg-red-500/20 text-red-400 border-red-500/40";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${color}`}>
      {score}%
    </span>
  );
}

const STATUS_CN: Record<string, string> = {
  FINISHED: "完结",
  RELEASING: "连载中",
  NOT_YET_RELEASED: "未放送",
  CANCELLED: "已取消",
  HIATUS: "休刊中",
};

const FORMAT_CN: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "短篇",
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

export default function AnimeCard({
  anime,
  watchedIds,
  onWatchToggle,
  onStatusChange,
}: {
  anime: Anime;
  watchedIds: Set<number>;
  onWatchToggle: (anime: Anime, status?: WatchStatus) => void;
  onStatusChange?: (anime: Anime, status: WatchStatus) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cnTitle = useChineseTitle(anime);
  const displayTitle = cnTitle || anime.title.english || anime.title.romaji;
  const isWatched = watchedIds.has(anime.id);

  const studioName = anime.studios?.nodes?.[0]?.name;

  function handleStatusClick(status: WatchStatus) {
    if (isWatched && onStatusChange) {
      onStatusChange(anime, status);
    } else {
      onWatchToggle(anime, status);
    }
  }

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover Image */}
      <Link href={`/anime/${anime.id}`} className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={anime.coverImage.large}
          alt={displayTitle}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute right-2 top-2">
          <ScoreBadge score={anime.averageScore} />
        </div>
      </Link>

      {/* Title & quick info */}
      <div className="h-[76px] p-3">
        <Link href={`/anime/${anime.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-100 transition-colors hover:text-sky-300">
            {displayTitle}
          </h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {anime.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${getGenreColor(genre)}`}
            >
              {GENRE_CN[genre] || genre}
            </span>
          ))}
        </div>
      </div>

      {/* Hover info panel */}
      {hovered && (
        <div className="absolute left-0 right-0 bottom-0 z-20 rounded-b-xl border-t border-gray-700 bg-gray-900/95 p-3 backdrop-blur-sm">
          {anime.seasonYear && anime.season && (
            <p className="text-xs text-gray-400">
              {anime.seasonYear} {SEASON_CN[anime.season] || anime.season}季
            </p>
          )}
          {studioName && (
            <p className="text-xs text-sky-400">{studioName}</p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            {anime.format && <span>{FORMAT_CN[anime.format] || anime.format}</span>}
            {anime.episodes && <span>{anime.episodes} 集</span>}
            {anime.status && <span>{STATUS_CN[anime.status] || anime.status}</span>}
          </div>
          {anime.nextAiringEpisode && (
            <p className="mt-1 text-xs text-teal-400">
              第 {anime.nextAiringEpisode.episode} 集即将播出
            </p>
          )}
          <div className="mt-2 flex gap-1">
            {(Object.keys(WATCH_STATUS_CN) as WatchStatus[]).map((ws) => (
              <button
                key={ws}
                onClick={(e) => {
                  e.preventDefault();
                  handleStatusClick(ws);
                }}
                className={`flex-1 rounded-lg py-1.5 text-center text-[10px] font-medium transition-colors sm:text-xs ${
                  isWatched
                    ? "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {WATCH_STATUS_CN[ws]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
