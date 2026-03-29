import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "请填写用户名和密码" }, { status: 400 });
  }
  if (username.length < 2 || username.length > 20) {
    return NextResponse.json({ error: "用户名长度需在2-20个字符之间" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少6个字符" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashed },
  });

  return NextResponse.json({ message: "注册成功" });
}
