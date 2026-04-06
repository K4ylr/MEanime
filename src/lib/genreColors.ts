const GENRE_COLORS: Record<string, string> = {
  Action: "bg-red-500/20 text-red-400 border-red-500/30",
  Adventure: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Comedy: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Drama: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Fantasy: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Horror: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  "Mahou Shoujo": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Mecha: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  Music: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  Mystery: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Psychological: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Romance: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Sci-Fi": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Slice of Life": "bg-green-500/20 text-green-400 border-green-500/30",
  Sports: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Supernatural: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Thriller: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Ecchi: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
};

export function getGenreColor(genre: string): string {
  return GENRE_COLORS[genre] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

export const ALL_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery",
  "Psychological", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller",
];

export const GENRE_CN: Record<string, string> = {
  Action: "动作", Adventure: "冒险", Comedy: "喜剧", Drama: "剧情",
  Fantasy: "奇幻", Horror: "恐怖", "Mahou Shoujo": "魔法少女",
  Mecha: "机甲", Music: "音乐", Mystery: "悬疑",
  Psychological: "心理", Romance: "恋爱", "Sci-Fi": "科幻",
  "Slice of Life": "日常", Sports: "运动", Supernatural: "超自然",
  Thriller: "惊悚", Ecchi: "Ecchi",
};
