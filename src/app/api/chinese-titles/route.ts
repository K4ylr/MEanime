import { NextRequest, NextResponse } from "next/server";
import { batchSearchChineseTitles } from "@/lib/bangumi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items as { id: number; native?: string | null; romaji?: string; english?: string | null }[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ titles: {} });
    }

    const titleMap = await batchSearchChineseTitles(items);
    const titles: Record<number, string> = {};
    for (const [id, title] of titleMap) {
      titles[id] = title;
    }

    return NextResponse.json({ titles });
  } catch {
    return NextResponse.json({ titles: {} });
  }
}
