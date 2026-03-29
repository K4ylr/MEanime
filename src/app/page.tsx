"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import SearchBar from "@/components/SearchBar";
import AnimeGrid from "@/components/AnimeGrid";
import LoadingGrid from "@/components/LoadingGrid";
import { Anime } from "@/lib/types";

export default function HomePage() {
  const { data: session } = useSession();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
  const [heading, setHeading] = useState("热门番剧");

  // Fetch watched IDs
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/watched")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWatchedIds(new Set(data.map((w: { anilistId: number }) => w.anilistId)));
        }
      })
      .catch(() => {});
  }, [session]);

  // Fetch trending on mount
  useEffect(() => {
    fetchTrending();
  }, []);

  async function fetchTrending() {
    setLoading(true);
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query {
            Page(perPage: 20) {
              media(type: ANIME, sort: TRENDING_DESC) {
                id title { romaji native english }
                coverImage { large } averageScore genres
                episodes status description format season seasonYear
                tags { name rank }
              }
            }
          }`,
        }),
      });
      const json = await res.json();
      setAnimeList(json.data.Page.media);
      setHeading("热门番剧");
    } catch {
      setAnimeList([]);
    }
    setLoading(false);
  }

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      fetchTrending();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query ($search: String) {
            Page(perPage: 20) {
              media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                id title { romaji native english }
                coverImage { large } averageScore genres
                episodes status description format season seasonYear
                tags { name rank }
              }
            }
          }`,
          variables: { search: query },
        }),
      });
      const json = await res.json();
      setAnimeList(json.data.Page.media);
      setHeading(`"${query}" 的搜索结果`);
    } catch {
      setAnimeList([]);
    }
    setLoading(false);
  }, []);

  async function handleWatchToggle(anime: Anime) {
    if (!session?.user) {
      window.location.href = "/login";
      return;
    }

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
          MEanime
        </h1>
        <p className="text-gray-400">记录你的番剧旅程，发现更多好番</p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-8 max-w-xl">
        <SearchBar onSearch={handleSearch} placeholder="搜索番剧名称..." />
      </div>

      {/* Content */}
      <h2 className="mb-4 text-lg font-semibold text-gray-200">{heading}</h2>
      {loading ? (
        <LoadingGrid />
      ) : animeList.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          {searchQuery ? "没有找到相关番剧" : "暂无数据"}
        </div>
      ) : (
        <AnimeGrid
          animeList={animeList}
          watchedIds={watchedIds}
          onWatchToggle={handleWatchToggle}
        />
      )}
    </div>
  );
}
