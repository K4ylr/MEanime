"use client";

import { Anime } from "@/lib/types";
import AnimeCard from "./AnimeCard";

export default function AnimeGrid({
  animeList,
  watchedIds,
  onWatchToggle,
}: {
  animeList: Anime[];
  watchedIds: Set<number>;
  onWatchToggle: (anime: Anime) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {animeList.map((anime) => (
        <AnimeCard
          key={anime.id}
          anime={anime}
          watchedIds={watchedIds}
          onWatchToggle={onWatchToggle}
        />
      ))}
    </div>
  );
}
