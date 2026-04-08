"use client";

// Persistent Chinese title cache using localStorage + in-memory Map
const MEM_CACHE = new Map<number, string | null>();
const LS_KEY = "meanime_cn_titles";

function loadFromStorage(): void {
  if (MEM_CACHE.size > 0) return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Record<string, string>;
      for (const [id, title] of Object.entries(data)) {
        MEM_CACHE.set(Number(id), title);
      }
    }
  } catch {
    // ignore
  }
}

function saveToStorage(): void {
  try {
    const obj: Record<string, string> = {};
    for (const [id, title] of MEM_CACHE) {
      if (title) obj[id] = title;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

// Debounced save
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveToStorage, 1000);
}

export function getCachedTitle(id: number): string | null {
  loadFromStorage();
  return MEM_CACHE.get(id) || null;
}

export function setCachedTitle(id: number, title: string | null): void {
  MEM_CACHE.set(id, title);
  if (title) debouncedSave();
}

export function hasCachedTitle(id: number): boolean {
  loadFromStorage();
  return MEM_CACHE.has(id);
}

// Fetch a single Chinese title from Bangumi API (tries multiple keywords)
export async function fetchChineseTitle(
  id: number,
  native?: string | null,
  romaji?: string,
  english?: string | null
): Promise<string | null> {
  if (hasCachedTitle(id)) return getCachedTitle(id);

  const keywords = [native, romaji, english].filter(Boolean) as string[];
  for (const kw of keywords) {
    try {
      const res = await fetch(`/api/chinese-title?keyword=${encodeURIComponent(kw)}`);
      const data = await res.json();
      if (data.title) {
        setCachedTitle(id, data.title);
        return data.title;
      }
    } catch {
      // try next keyword
    }
  }
  setCachedTitle(id, null);
  return null;
}

// Pre-fetch Chinese titles for a list of anime (parallel, populates cache)
// Returns when all are fetched or timeout is reached
export async function prefetchChineseTitles(
  items: { id: number; title: { native: string | null; romaji: string; english: string | null } }[],
  timeoutMs = 4000
): Promise<void> {
  loadFromStorage();

  const toFetch = items.filter((a) => !MEM_CACHE.has(a.id));
  if (toFetch.length === 0) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await Promise.allSettled(
      toFetch.map(async (item) => {
        if (controller.signal.aborted) return;
        const keywords = [item.title.native, item.title.romaji, item.title.english].filter(Boolean) as string[];
        for (const kw of keywords) {
          if (controller.signal.aborted) return;
          try {
            const res = await fetch(`/api/chinese-title?keyword=${encodeURIComponent(kw)}`, {
              signal: controller.signal,
            });
            const data = await res.json();
            if (data.title) {
              setCachedTitle(item.id, data.title);
              return;
            }
          } catch {
            // try next keyword or abort
            if (controller.signal.aborted) return;
          }
        }
        setCachedTitle(item.id, null);
      })
    );
  } finally {
    clearTimeout(timeout);
  }
}
