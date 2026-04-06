const BGM_API = "https://api.bgm.tv";

// Global in-memory cache for Chinese titles
const titleCache = new Map<string, string | null>();

// Cache for Chinese info (title + summary)
const infoCache = new Map<string, { title: string | null; summary: string | null }>();

export async function searchChineseTitle(keyword: string): Promise<string | null> {
  if (titleCache.has(keyword)) return titleCache.get(keyword) || null;

  const info = await searchChineseInfo(keyword);
  titleCache.set(keyword, info.title);
  return info.title;
}

export async function searchChineseInfo(keyword: string): Promise<{ title: string | null; summary: string | null }> {
  if (infoCache.has(keyword)) return infoCache.get(keyword)!;

  try {
    const res = await fetch(
      `${BGM_API}/search/subject/${encodeURIComponent(keyword)}?type=2&responseGroup=large`,
      {
        headers: { "User-Agent": "MEanime/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) {
      const result = { title: null, summary: null };
      infoCache.set(keyword, result);
      return result;
    }
    const data = await res.json();
    if (data.list && data.list.length > 0) {
      const item = data.list[0];
      const result = {
        title: item.name_cn || null,
        summary: item.summary || null,
      };
      infoCache.set(keyword, result);
      titleCache.set(keyword, result.title);
      return result;
    }
    const result = { title: null, summary: null };
    infoCache.set(keyword, result);
    return result;
  } catch {
    const result = { title: null, summary: null };
    infoCache.set(keyword, result);
    return result;
  }
}
