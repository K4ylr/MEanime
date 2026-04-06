import { NextRequest, NextResponse } from "next/server";
import { searchChineseTitle } from "@/lib/bangumi";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  if (!keyword) {
    return NextResponse.json({ title: null });
  }

  const title = await searchChineseTitle(keyword);
  return NextResponse.json({ title });
}
