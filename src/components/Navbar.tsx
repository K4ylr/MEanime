"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "首页" },
    { href: "/watched", label: "已看列表" },
    { href: "/recommend", label: "智能推荐" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-xl font-bold text-sky-400"
        >
          MEanime
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-sky-500/20 text-sky-300"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="text-sm text-gray-400">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
