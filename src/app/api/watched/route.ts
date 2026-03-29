import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const watched = await prisma.watched.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
  });

  const result = watched.map((w) => ({
    ...w,
    genres: JSON.parse(w.genres),
    tags: JSON.parse(w.tags),
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const watched = await prisma.watched.create({
    data: {
      userId,
      anilistId: body.anilistId,
      titleRomaji: body.titleRomaji,
      titleNative: body.titleNative || null,
      titleEnglish: body.titleEnglish || null,
      coverImage: body.coverImage,
      averageScore: body.averageScore || null,
      genres: JSON.stringify(body.genres || []),
      tags: JSON.stringify(body.tags || []),
      episodes: body.episodes || null,
      status: body.status || null,
    },
  });

  return NextResponse.json(watched);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const anilistId = searchParams.get("anilistId");

  if (!anilistId) {
    return NextResponse.json({ error: "缺少 anilistId" }, { status: 400 });
  }

  await prisma.watched.deleteMany({
    where: { userId, anilistId: parseInt(anilistId) },
  });

  return NextResponse.json({ message: "已移除" });
}
