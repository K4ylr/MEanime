"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import SearchBar from "@/components/SearchBar";
import AnimeGrid from "@/components/AnimeGrid";
import AnimeRow from "@/components/AnimeRow";
import FilterBar, { FilterState } from "@/components/FilterBar";
import LoadingGrid from "@/components/LoadingGrid";
import { Anime } from "@/lib/types";
import {
  getTrendingThisSeason,
  getPopularThisSeason,
  getUpcomingNextSeason,
  getAllTimePopular,
  searchAnime,
  browseAnime,
} from "@/lib/anilist";

type ViewMode = "sections" | "search" | "browse";

export default function HomePage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>("sections");
  const [loading, setLoading] = useState(true);
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());

  // Section data
  const [trending, setTrending] = useState<Anime[]>([]);
  const [popular, setPopular] = useState<Anime[]>([]);
  const [upcoming, setUpcoming] = useState<Anime[]>([]);
  const [allTime, setAllTime] = useState<Anime[]>([]);

  // Search / browse results
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    genre: "", year: "", season: "", format: "", status: "",
  });
  const [browsePage, setBrowsePage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Fetch homepage sections
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [t, p, u, a] = await Promise.all([
          getTrendingThisSeason(),
          getPopularThisSeason(),
          getUpcomingNextSeason(),
          getAllTimePopular(),
        ]);
        setTrending(t);
        setPopular(p);
        setUpcoming(u);
        setAllTime(a);
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, []);

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setViewMode("sections");
      return;
    }
    setViewMode("search");
    setLoading(true);
    try {
      const result = await searchAnime(query);
      setSearchResults(result.media);
      setHasNextPage(result.pageInfo.hasNextPage);
      setBrowsePage(1);
    } catch {
      setSearchResults([]);
    }
    setLoading(false);
  }, []);

  // Filter change handler
  const handleFilterChange = useCallback(async (newFilters: FilterState) => {
    setFilters(newFilters);
    const hasFilter = Object.values(newFilters).some(Boolean);
    if (!hasFilter && !searchQuery) {
      setViewMode("sections");
      return;
    }
    setViewMode("browse");
    setLoading(true);
    try {
      const result = await browseAnime(1, {
        genre: newFilters.genre || undefined,
        year: newFilters.year ? parseInt(newFilters.year) : undefined,
        season: newFilters.season || undefined,
        format: newFilters.format || undefined,
        status: newFilters.status || undefined,
      });
      setSearchResults(result.media);
      setHasNextPage(result.pageInfo.hasNextPage);
      setBrowsePage(1);
    } catch {
      setSearchResults([]);
    }
    setLoading(false);
  }, [searchQuery]);

  // Load more
  async function loadMore() {
    setLoadingMore(true);
    const nextPage = browsePage + 1;
    try {
      const result = viewMode === "search"
        ? await searchAnime(searchQuery, nextPage)
        : await browseAnime(nextPage, {
            genre: filters.genre || undefined,
            year: filters.year ? parseInt(filters.year) : undefined,
            season: filters.season || undefined,
            format: filters.format || undefined,
            status: filters.status || undefined,
          });
      setSearchResults((prev) => [...prev, ...result.media]);
      setHasNextPage(result.pageInfo.hasNextPage);
      setBrowsePage(nextPage);
    } catch {
      // silent
    }
    setLoadingMore(false);
  }

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

  const heading =
    viewMode === "search"
      ? `"${searchQuery}" 的搜索结果`
      : viewMode === "browse"
        ? "筛选结果"
        : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold text-sky-400">MEanime</h1>
        <p className="text-gray-400">记录你的番剧旅程，发现更多好番</p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-4 max-w-xl">
        <SearchBar onSearch={handleSearch} placeholder="搜索番剧名称..." />
      </div>

      {/* Filters */}
      <div className="mb-6 flex justify-center">
        <FilterBar filters={filters} onChange={handleFilterChange} />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingGrid />
      ) : viewMode === "sections" ? (
        <>
          <AnimeRow title="当季热门" animeList={trending} watchedIds={watchedIds} onWatchToggle={handleWatchToggle} />
          <AnimeRow title="本季人气" animeList={popular} watchedIds={watchedIds} onWatchToggle={handleWatchToggle} />
          <AnimeRow title="下季新番" animeList={upcoming} watchedIds={watchedIds} onWatchToggle={handleWatchToggle} />
          <AnimeRow title="历史人气" animeList={allTime} watchedIds={watchedIds} onWatchToggle={handleWatchToggle} />
        </>
      ) : (
        <>
          <h2 className="mb-4 text-lg font-semibold text-gray-200">{heading}</h2>
          {searchResults.length === 0 ? (
            <div className="py-20 text-center text-gray-500">没有找到相关番剧</div>
          ) : (
            <>
              <AnimeGrid
                animeList={searchResults}
                watchedIds={watchedIds}
                onWatchToggle={handleWatchToggle}
              />
              {hasNextPage && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-xl bg-gray-800 px-8 py-3 font-medium text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loadingMore ? "加载中..." : "加载更多"}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
