"use client";

import Image from "next/image";
import { Anime } from "@/lib/types";
import { getBahamutUrl, getBilibiliUrl } from "@/lib/links";

function ScoreBadgeLarge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score >= 75
      ? "from-green-500 to-emerald-600"
      : score >= 50
        ? "from-yellow-500 to-amber-600"
        : "from-red-500 to-rose-600";
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${color} text-lg font-bold text-white shadow-lg`}
    >
      {score}
    </div>
  );
}

export default function AnimeDetailModal({
  anime,
  onClose,
}: {
  anime: Anime;
  onClose: () => void;
}) {
  const title = anime.title.native || anime.title.romaji;

  const statusMap: Record<string, string> = {
    FINISHED: "完结",
    RELEASING: "连载中",
    NOT_YET_RELEASED: "未放送",
    CANCELLED: "已取消",
    HIATUS: "休刊中",
  };

  const formatMap: Record<string, string> = {
    TV: "TV 动画",
    TV_SHORT: "TV 短篇",
    MOVIE: "剧场版",
    SPECIAL: "特别篇",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "音乐",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/80 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
        >
          ✕
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Cover */}
          <div className="relative aspect-[3/4] w-full shrink-0 sm:w-56">
            <Image
              src={anime.coverImage.large}
              alt={title}
              fill
              className="rounded-t-2xl object-cover sm:rounded-l-2xl sm:rounded-tr-none"
            />
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {anime.title.romaji !== title && (
                  <p className="mt-1 text-sm text-gray-400">
                    {anime.title.romaji}
                  </p>
                )}
                {anime.title.english && (
                  <p className="text-sm text-gray-500">
                    {anime.title.english}
                  </p>
                )}
              </div>
              <ScoreBadgeLarge score={anime.averageScore} />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-400">
              {anime.format && (
                <span className="rounded bg-gray-800 px-2 py-0.5">
                  {formatMap[anime.format] || anime.format}
                </span>
              )}
              {anime.episodes && (
                <span className="rounded bg-gray-800 px-2 py-0.5">
                  {anime.episodes} 集
                </span>
              )}
              {anime.status && (
                <span className="rounded bg-gray-800 px-2 py-0.5">
                  {statusMap[anime.status] || anime.status}
                </span>
              )}
              {anime.season && anime.seasonYear && (
                <span className="rounded bg-gray-800 px-2 py-0.5">
                  {anime.seasonYear}{" "}
                  {anime.season === "WINTER"
                    ? "冬"
                    : anime.season === "SPRING"
                      ? "春"
                      : anime.season === "SUMMER"
                        ? "夏"
                        : "秋"}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5">
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-300"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Tags */}
            {anime.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {anime.tags.slice(0, 10).map((tag) => (
                  <span
                    key={tag.name}
                    className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-500"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {anime.description && (
              <p className="line-clamp-6 text-sm leading-relaxed text-gray-300">
                {anime.description.replace(/<[^>]*>/g, "")}
              </p>
            )}

            {/* Links */}
            <div className="mt-auto flex gap-2 pt-2">
              <a
                href={getBahamutUrl(anime.title.native, anime.title.romaji)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-orange-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-orange-500"
              >
                在动画疯观看
              </a>
              <a
                href={getBilibiliUrl(anime.title.native, anime.title.romaji)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-sky-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-sky-500"
              >
                在B站观看
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
