"use client";

import { useState, useEffect, useRef } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "搜索番剧...",
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <svg
          className="h-5 w-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3 pl-11 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-300"
        >
          ✕
        </button>
      )}
    </div>
  );
}
