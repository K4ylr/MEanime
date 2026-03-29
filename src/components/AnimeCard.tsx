"use client";

import { useState } from "react";
import Image from "next/image";
import { Anime } from "@/lib/types";
import { getBahamutUrl, getBilibiliUrl } from "@/lib/links";
import AnimeDetailModal from "./AnimeDetailModal";
import WatchedButton from "./WatchedButton";

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score >= 75
      ? "bg-green-500/20 text-green-400"
      : score >= 50
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-red-500/20 text-red-400";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

export default function AnimeCard({
  anime,
  watchedIds,
  onWatchToggle,
}: {
  anime: Anime;
  watchedIds: Set<number>;
  onWatchToggle: (anime: Anime) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const title = anime.title.native || anime.title.romaji;
  const isWatched = watchedIds.has(anime.id);

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
        {/* Cover Image */}
        <div
          className="relative aspect-[3/4] cursor-pointer overflow-hidden"
          onClick={() => setShowDetail(true)}
        >
          <Image
            src={anime.coverImage.large}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {/* Score Badge */}
          <div className="absolute right-2 top-2">
            <ScoreBadge score={anime.averageScore} />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3
            className="line-clamp-2 cursor-pointer text-sm font-semibold text-gray-100 transition-colors hover:text-purple-300"
            onClick={() => setShowDetail(true)}
          >
            {title}
          </h3>

          {anime.title.english && anime.title.english !== title && (
            <p className="line-clamp-1 text-xs text-gray-500">
              {anime.title.english}
            </p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Episodes & Status */}
          <div className="mt-auto flex items-center gap-2 text-xs text-gray-500">
            {anime.episodes && <span>{anime.episodes} 集</span>}
            {anime.status && (
              <span>
                {anime.status === "FINISHED"
                  ? "完结"
                  : anime.status === "RELEASING"
                    ? "连载中"
                    : anime.status === "NOT_YET_RELEASED"
                      ? "未放送"
                      : anime.status}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <WatchedButton
              isWatched={isWatched}
              onClick={() => onWatchToggle(anime)}
            />
            <a
              href={getBahamutUrl(anime.title.native, anime.title.romaji)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-orange-600/20 py-1.5 text-center text-xs font-medium text-orange-400 transition-colors hover:bg-orange-600/30"
              title="在动画疯观看"
            >
              动画疯
            </a>
            <a
              href={getBilibiliUrl(anime.title.native, anime.title.romaji)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-sky-600/20 py-1.5 text-center text-xs font-medium text-sky-400 transition-colors hover:bg-sky-600/30"
              title="在B站观看"
            >
              B站
            </a>
          </div>
        </div>
      </div>

      {showDetail && (
        <AnimeDetailModal anime={anime} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
