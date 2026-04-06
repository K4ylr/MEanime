const BGM_API = "https://api.bgm.tv";

// Global in-memory cache for Chinese titles
const titleCache = new Map<string, string | null>();

export async function searchChineseTitle(keyword: string): Promise<string | null> {
  if (titleCache.has(keyword)) return titleCache.get(keyword) || null;

  try {
    const res = await fetch(
      `${BGM_API}/search/subject/${encodeURIComponent(keyword)}?type=2&responseGroup=small`,
      {
        headers: { "User-Agent": "MEanime/1.0" },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!res.ok) {
      titleCache.set(keyword, null);
      return null;
    }
    const data = await res.json();
    if (data.list && data.list.length > 0) {
      const cn = data.list[0].name_cn || null;
      titleCache.set(keyword, cn);
      return cn;
    }
    titleCache.set(keyword, null);
    return null;
  } catch {
    titleCache.set(keyword, null);
    return null;
  }
}
