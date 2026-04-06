export function getBahamutUrl(titleNative: string | null, titleRomaji: string): string {
  const keyword = titleNative || titleRomaji;
  return `https://ani.gamer.com.tw/search.php?keyword=${encodeURIComponent(keyword)}`;
}

export function getBilibiliUrl(
  chineseTitle: string | null,
  titleEnglish: string | null,
  titleRomaji: string
): string {
  const keyword = chineseTitle || titleEnglish || titleRomaji;
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;
}
