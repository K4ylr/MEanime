const BGM_API = "https://api.bgm.tv";
const WIKI_API = "https://zh.wikipedia.org/w/api.php";

// Global in-memory cache for Chinese titles
const titleCache = new Map<string, string | null>();

// Cache for Chinese info (title + summary + bgmId)
const infoCache = new Map<string, { title: string | null; summary: string | null; bgmId: number | null }>();

// Detect if text is primarily Japanese (contains significant hiragana/katakana)
function isJapanese(text: string): boolean {
  if (!text) return false;
  const jpChars = text.match(/[\u3040-\u309F\u30A0-\u30FF]/g);
  if (!jpChars) return false;
  return jpChars.length / text.length > 0.15;
}

// Detect if text contains meaningful Chinese content
function isChinese(text: string): boolean {
  if (!text) return false;
  const cnChars = text.match(/[\u4e00-\u9fff]/g);
  if (!cnChars) return false;
  return cnChars.length / text.length > 0.2;
}

// Search Bangumi for a single keyword, return raw results
async function searchBangumi(keyword: string): Promise<{ id?: number; name_cn?: string; summary?: string }[]> {
  try {
    const res = await fetch(
      `${BGM_API}/search/subject/${encodeURIComponent(keyword)}?type=2&responseGroup=large`,
      {
        headers: { "User-Agent": "MEanime/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.list || [];
  } catch {
    return [];
  }
}

// Fetch Chinese summary from Chinese Wikipedia
async function fetchWikiSummary(keyword: string): Promise<string | null> {
  try {
    const searchRes = await fetch(
      `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(keyword + " 动画")}&srnamespace=0&srlimit=3&format=json&origin=*`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) return null;

    const title = results[0].title;
    const extractRes = await fetch(
      `${WIKI_API}?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json&origin=*`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!extractRes.ok) return null;
    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as { extract?: string };
    const extract = page?.extract;
    if (!extract || extract.length < 20) return null;

    if (!isChinese(extract) || isJapanese(extract)) return null;

    if (extract.length > 500) {
      const trimmed = extract.substring(0, 500);
      const lastPeriod = trimmed.lastIndexOf("。");
      return lastPeriod > 100 ? trimmed.substring(0, lastPeriod + 1) : trimmed + "...";
    }
    return extract;
  } catch {
    return null;
  }
}

export async function searchChineseTitle(keyword: string): Promise<string | null> {
  if (titleCache.has(keyword)) return titleCache.get(keyword) || null;

  const info = await searchChineseInfo(keyword);
  titleCache.set(keyword, info.title);
  return info.title;
}

export async function searchChineseInfo(keyword: string): Promise<{ title: string | null; summary: string | null; bgmId: number | null }> {
  if (infoCache.has(keyword)) return infoCache.get(keyword)!;

  try {
    const list = await searchBangumi(keyword);
    let bestTitle: string | null = null;
    let bestSummary: string | null = null;
    let bgmId: number | null = null;

    for (const item of list.slice(0, 5)) {
      if (!bgmId && item.id) bgmId = item.id;
      if (!bestTitle && item.name_cn) {
        bestTitle = item.name_cn;
        if (!bgmId && item.id) bgmId = item.id;
      }
      if (!bestSummary && item.summary && !isJapanese(item.summary) && isChinese(item.summary)) {
        bestSummary = item.summary;
      }
      if (bestTitle && bestSummary) break;
    }

    // Fallback to Wikipedia for summary
    if (!bestSummary) {
      const searchTerm = bestTitle || keyword;
      bestSummary = await fetchWikiSummary(searchTerm);
      if (!bestSummary && searchTerm !== keyword) {
        bestSummary = await fetchWikiSummary(keyword);
      }
    }

    const result = { title: bestTitle, summary: bestSummary, bgmId };
    infoCache.set(keyword, result);
    titleCache.set(keyword, result.title);
    return result;
  } catch {
    const result = { title: null, summary: null, bgmId: null };
    infoCache.set(keyword, result);
    return result;
  }
}

// Fetch Chinese comments from Bangumi
export interface BgmComment {
  user: string;
  comment: string;
  rate: number;
}

export async function fetchBgmComments(bgmId: number): Promise<BgmComment[]> {
  try {
    const res = await fetch(
      `${BGM_API}/v0/subjects/${bgmId}/comments?limit=10`,
      {
        headers: { "User-Agent": "MEanime/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((c: { comment?: string; rate?: number }) => c.comment && c.comment.length > 5)
      .slice(0, 8)
      .map((c: { user?: { nickname?: string; username?: string }; comment: string; rate?: number }) => ({
        user: c.user?.nickname || c.user?.username || "匿名",
        comment: c.comment,
        rate: c.rate || 0,
      }));
  } catch {
    return [];
  }
}

// Batch fetch Chinese titles for multiple anime
// Tries multiple keywords per anime: native → romaji → english
export async function batchSearchChineseTitles(
  items: { id: number; native?: string | null; romaji?: string; english?: string | null }[]
): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const toFetch: typeof items = [];

  // Check cache first
  for (const item of items) {
    const keyword = item.native || item.romaji || "";
    if (titleCache.has(keyword) && titleCache.get(keyword)) {
      result.set(item.id, titleCache.get(keyword)!);
    } else {
      toFetch.push(item);
    }
  }

  // Fetch remaining in parallel (max 10 concurrent)
  const chunks: typeof items[] = [];
  for (let i = 0; i < toFetch.length; i += 10) {
    chunks.push(toFetch.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (item) => {
      const keywords = [item.native, item.romaji, item.english].filter(Boolean) as string[];

      for (const kw of keywords) {
        if (titleCache.has(kw) && titleCache.get(kw)) {
          result.set(item.id, titleCache.get(kw)!);
          return;
        }
      }

      // Try each keyword until we find a Chinese title
      for (const kw of keywords) {
        const list = await searchBangumi(kw);
        for (const bgmItem of list.slice(0, 3)) {
          if (bgmItem.name_cn) {
            result.set(item.id, bgmItem.name_cn);
            // Cache all keywords for this anime
            for (const k of keywords) titleCache.set(k, bgmItem.name_cn);
            return;
          }
        }
      }

      // No result found - cache as null
      for (const k of keywords) titleCache.set(k, null);
    });

    await Promise.all(promises);
  }

  return result;
}
