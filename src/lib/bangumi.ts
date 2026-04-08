const BGM_API = "https://api.bgm.tv";
const WIKI_API = "https://zh.wikipedia.org/w/api.php";

// Global in-memory cache for Chinese titles
const titleCache = new Map<string, string | null>();

// Cache for Chinese info (title + summary)
const infoCache = new Map<string, { title: string | null; summary: string | null }>();

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

// Fetch Chinese summary from Chinese Wikipedia
async function fetchWikiSummary(keyword: string): Promise<string | null> {
  try {
    // Step 1: Search for the anime on Chinese Wikipedia
    const searchRes = await fetch(
      `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(keyword + " 动画")}&srnamespace=0&srlimit=3&format=json&origin=*`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) return null;

    // Step 2: Get the extract (intro paragraph) from the best match
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

    // Only return if it's actually Chinese content
    if (!isChinese(extract) || isJapanese(extract)) return null;

    // Trim to a reasonable length (first ~500 chars)
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

export async function searchChineseInfo(keyword: string): Promise<{ title: string | null; summary: string | null }> {
  if (infoCache.has(keyword)) return infoCache.get(keyword)!;

  try {
    // Step 1: Try Bangumi first
    const res = await fetch(
      `${BGM_API}/search/subject/${encodeURIComponent(keyword)}?type=2&responseGroup=large`,
      {
        headers: { "User-Agent": "MEanime/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );
    let bestTitle: string | null = null;
    let bestSummary: string | null = null;

    if (res.ok) {
      const data = await res.json();
      if (data.list && data.list.length > 0) {
        for (const item of data.list.slice(0, 5)) {
          if (!bestTitle && item.name_cn) {
            bestTitle = item.name_cn;
          }
          if (!bestSummary && item.summary && !isJapanese(item.summary) && isChinese(item.summary)) {
            bestSummary = item.summary;
          }
          if (bestTitle && bestSummary) break;
        }
      }
    }

    // Step 2: If no Chinese summary from Bangumi, try Chinese Wikipedia
    if (!bestSummary) {
      const searchTerm = bestTitle || keyword;
      bestSummary = await fetchWikiSummary(searchTerm);
      // If that didn't work and we used cnTitle, try with original keyword
      if (!bestSummary && searchTerm !== keyword) {
        bestSummary = await fetchWikiSummary(keyword);
      }
    }

    const result = { title: bestTitle, summary: bestSummary };
    infoCache.set(keyword, result);
    titleCache.set(keyword, result.title);
    return result;
  } catch {
    const result = { title: null, summary: null };
    infoCache.set(keyword, result);
    return result;
  }
}
