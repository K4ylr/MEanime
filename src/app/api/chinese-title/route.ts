import { NextRequest, NextResponse } from "next/server";
import { searchChineseInfo, fetchBgmComments } from "@/lib/bangumi";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  const bgmIdParam = req.nextUrl.searchParams.get("bgmId");

  // Fetch comments by Bangumi subject ID
  if (bgmIdParam) {
    const comments = await fetchBgmComments(parseInt(bgmIdParam));
    return NextResponse.json({ comments });
  }

  if (!keyword) {
    return NextResponse.json({ title: null, summary: null, bgmId: null });
  }

  const info = await searchChineseInfo(keyword);
  return NextResponse.json(info);
}
