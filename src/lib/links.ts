export function getBahamutUrl(titleNative: string | null, titleRomaji: string): string {
  const keyword = titleNative || titleRomaji;
  return `https://ani.gamer.com.tw/search.php?keyword=${encodeURIComponent(keyword)}`;
}

export function getBilibiliUrl(titleNative: string | null, titleRomaji: string): string {
  const keyword = titleNative || titleRomaji;
  return `https://search.bilibili.com/bangumi?keyword=${encodeURIComponent(keyword)}`;
}
