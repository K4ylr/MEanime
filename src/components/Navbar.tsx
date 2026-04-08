"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "首页" },
    { href: "/watched", label: "追番" },
    { href: "/recommend", label: "推荐" },
    { href: "/stats", label: "统计" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold text-sky-400 sm:text-xl"
        >
          MEanime
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm ${
                pathname === link.href
                  ? "bg-sky-500/20 text-sky-300"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {session?.user ? (
            <>
              <span className="hidden text-sm text-gray-400 sm:inline">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-lg bg-gray-800 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 sm:px-3 sm:py-1.5 sm:text-sm"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-sky-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-sky-500 sm:px-4 sm:py-1.5 sm:text-sm"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
