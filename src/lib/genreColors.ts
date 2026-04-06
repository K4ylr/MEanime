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

export const TAG_CN: Record<string, string> = {
  // Demographics
  Shounen: "少年", Shoujo: "少女", Seinen: "青年", Josei: "女性向",
  Kids: "儿童",
  // Themes
  "Super Power": "超能力", School: "校园", "Slice of Life": "日常",
  Isekai: "异世界", "Post-Apocalyptic": "末日后", Military: "军事",
  "Martial Arts": "武术", Historical: "历史", Samurai: "武士",
  Vampire: "吸血鬼", Demons: "恶魔", Magic: "魔法", Space: "太空",
  "Time Travel": "时间旅行", "Alternate Universe": "平行世界",
  Survival: "生存", "Coming of Age": "成长", Revenge: "复仇",
  War: "战争", Crime: "犯罪", Politics: "政治", Philosophy: "哲学",
  // Character & Cast
  "Male Protagonist": "男主角", "Female Protagonist": "女主角",
  "Ensemble Cast": "群像剧", "Anti-Hero": "反英雄",
  "Primarily Male Cast": "男性为主", "Primarily Female Cast": "女性为主",
  "Primarily Teen Cast": "青少年为主", "Primarily Adult Cast": "成年人为主",
  Orphan: "孤儿", Tomboy: "假小子", Twins: "双胞胎",
  // Setting
  Urban: "都市", "Urban Fantasy": "都市奇幻", Cyberpunk: "赛博朋克",
  Dystopia: "反乌托邦", "Foreign": "异国", "Countryside": "乡村",
  // Story Elements
  Romance: "恋爱", "Love Triangle": "三角恋", Tragedy: "悲剧",
  Mystery: "悬疑", Conspiracy: "阴谋", Detective: "侦探",
  Psychological: "心理", Horror: "恐怖", "Body Horror": "肉体恐怖",
  Gore: "血腥", Death: "死亡", Bullying: "霸凌",
  // Genre-specific
  Mecha: "机甲", "Real Robot": "真实系机甲", "Super Robot": "超级系机甲",
  Harem: "后宫", "Reverse Harem": "逆后宫",
  "Mahou Shoujo": "魔法少女", Tokusatsu: "特摄",
  Parody: "恶搞", Satire: "讽刺", Slapstick: "闹剧",
  // Action/Adventure
  Battle: "战斗", Guns: "枪战",
  Swordplay: "剑术", "Hand to Hand Combat": "近身格斗",
  // Sports & Competition
  Basketball: "篮球", Baseball: "棒球", Soccer: "足球",
  Swimming: "游泳", Boxing: "拳击", Tennis: "网球",
  "Card Battle": "卡牌对战", "Board Game": "桌游",
  // Arts & Culture
  "Band": "乐队", Idol: "偶像", Dancing: "舞蹈",
  Cooking: "料理", Drawing: "绘画", Acting: "演技",
  Photography: "摄影", Fashion: "时尚",
  // Supernatural
  Gods: "神明", Angels: "天使", Ghost: "幽灵", Zombies: "丧尸",
  Witch: "女巫", Exorcism: "驱魔", Reincarnation: "转生",
  Afterlife: "来世", Shapeshifting: "变身", Youkai: "妖怪",
  Curse: "诅咒", Curses: "诅咒",
  // Relationships
  Family: "家庭", Friendship: "友情", Siblings: "兄弟姐妹",
  "Found Family": "羁绊家庭", Pets: "宠物", Teacher: "教师",
  // Other common tags
  Comedy: "喜剧", Drama: "剧情", Fantasy: "奇幻",
  "Sci-Fi": "科幻", Action: "动作", Adventure: "冒险",
  Supernatural: "超自然", Thriller: "惊悚",
  "Dissociative Identities": "人格分裂",
  Amnesia: "失忆", "Age Gap": "年龄差",
  Otaku: "宅文化", NEET: "尼特族", "Chuunibyou": "中二病",
  Cultivation: "修仙", Wuxia: "武侠",
  Robots: "机器人", "Artificial Intelligence": "人工智能",
  "Virtual World": "虚拟世界", "Video Games": "游戏",
  Anthology: "选集", Episodic: "单元剧",
  "4-koma": "四格漫画", CGI: "CG动画",
  "Based on a Manga": "漫画改编", "Based on a Light Novel": "轻小说改编",
  "Based on a Visual Novel": "视觉小说改编", "Based on a Video Game": "游戏改编",
  "Original Work": "原创",
};
