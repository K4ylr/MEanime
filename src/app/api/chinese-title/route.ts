import { NextRequest, NextResponse } from "next/server";
import { searchChineseInfo } from "@/lib/bangumi";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  if (!keyword) {
    return NextResponse.json({ title: null, summary: null });
  }

  const info = await searchChineseInfo(keyword);
  return NextResponse.json(info);
}
