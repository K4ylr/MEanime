"use client";

import { ALL_GENRES, GENRE_CN } from "@/lib/genreColors";

export interface FilterState {
  genre: string;
  year: string;
  season: string;
  format: string;
  status: string;
}

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());

const SEASONS = [
  { value: "", label: "全部季度" },
  { value: "WINTER", label: "冬季 (1-3月)" },
  { value: "SPRING", label: "春季 (4-6月)" },
  { value: "SUMMER", label: "夏季 (7-9月)" },
  { value: "FALL", label: "秋季 (10-12月)" },
];

const FORMATS = [
  { value: "", label: "全部格式" },
  { value: "TV", label: "TV 动画" },
  { value: "MOVIE", label: "剧场版" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "SPECIAL", label: "特别篇" },
  { value: "TV_SHORT", label: "TV 短篇" },
];

const STATUSES = [
  { value: "", label: "全部状态" },
  { value: "RELEASING", label: "连载中" },
  { value: "FINISHED", label: "已完结" },
  { value: "NOT_YET_RELEASED", label: "未放送" },
];

function SelectDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-300 outline-none transition-colors focus:border-sky-500 hover:border-gray-600 sm:px-3 sm:py-2 sm:text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}) {
  const genreOptions = [
    { value: "", label: "全部类型" },
    ...ALL_GENRES.map((g) => ({ value: g, label: GENRE_CN[g] || g })),
  ];

  const yearOptions = [
    { value: "", label: "全部年份" },
    ...YEARS.map((y) => ({ value: y, label: y })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <SelectDropdown
        value={filters.genre}
        onChange={(v) => onChange({ ...filters, genre: v })}
        options={genreOptions}
      />
      <SelectDropdown
        value={filters.year}
        onChange={(v) => onChange({ ...filters, year: v })}
        options={yearOptions}
      />
      <SelectDropdown
        value={filters.season}
        onChange={(v) => onChange({ ...filters, season: v })}
        options={SEASONS}
      />
      <SelectDropdown
        value={filters.format}
        onChange={(v) => onChange({ ...filters, format: v })}
        options={FORMATS}
      />
      <SelectDropdown
        value={filters.status}
        onChange={(v) => onChange({ ...filters, status: v })}
        options={STATUSES}
      />
      {(filters.genre || filters.year || filters.season || filters.format || filters.status) && (
        <button
          onClick={() => onChange({ genre: "", year: "", season: "", format: "", status: "" })}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
