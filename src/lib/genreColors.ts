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
  Dystopia: "反乌托邦", Foreign: "异国", Countryside: "乡村",
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
  Volleyball: "排球", Basketball: "篮球", Baseball: "棒球", Soccer: "足球",
  Swimming: "游泳", Boxing: "拳击", Tennis: "网球", Rugby: "橄榄球",
  Cycling: "自行车", "Ice Skating": "滑冰", "Track & Field": "田径",
  Badminton: "羽毛球", "Table Tennis": "乒乓球", Golf: "高尔夫",
  Archery: "射箭", Fishing: "钓鱼", Skateboarding: "滑板",
  Surfing: "冲浪", Climbing: "攀岩", Wrestling: "摔跤",
  "Card Battle": "卡牌对战", "Board Game": "桌游",
  Fitness: "健身", "Martial Arts Tournament": "武术大会",
  // Arts & Culture
  Band: "乐队", Idol: "偶像", Dancing: "舞蹈",
  Cooking: "料理", Drawing: "绘画", Acting: "演技",
  Photography: "摄影", Fashion: "时尚", Calligraphy: "书法",
  // Supernatural
  Gods: "神明", Angels: "天使", Ghost: "幽灵", Zombies: "丧尸",
  Witch: "女巫", Exorcism: "驱魔", Reincarnation: "转生",
  Afterlife: "来世", Shapeshifting: "变身", Youkai: "妖怪",
  Curse: "诅咒", Curses: "诅咒", Necromancy: "死灵术",
  // Relationships
  Family: "家庭", Friendship: "友情", Siblings: "兄弟姐妹",
  "Found Family": "羁绊家庭", Pets: "宠物", Teacher: "教师",
  // Character Archetypes
  Kuudere: "酷娇", Tsundere: "傲娇", Yandere: "病娇",
  Dandere: "呆娇", Himedere: "公主娇", Coodere: "冷淡",
  // School/Club
  "School Club": "校园社团", "Student Council": "学生会",
  "Delinquents": "不良少年", "School Life": "校园生活",
  // Cute/Moe
  "Cute Boys Doing Cute Things": "男孩日常", "Cute Girls Doing Cute Things": "女孩日常",
  Chibi: "Q版", Moe: "萌系", Loli: "萝莉", Shota: "正太",
  // Other common tags
  Comedy: "喜剧", Drama: "剧情", Fantasy: "奇幻",
  "Sci-Fi": "科幻", Action: "动作", Adventure: "冒险",
  Supernatural: "超自然", Thriller: "惊悚",
  "Dissociative Identities": "人格分裂",
  Amnesia: "失忆", "Age Gap": "年龄差",
  Otaku: "宅文化", NEET: "尼特族", Chuunibyou: "中二病",
  Cultivation: "修仙", Wuxia: "武侠",
  Robots: "机器人", "Artificial Intelligence": "人工智能",
  "Virtual World": "虚拟世界", "Video Games": "游戏",
  Anthology: "选集", Episodic: "单元剧",
  "4-koma": "四格漫画", CGI: "CG动画",
  "Based on a Manga": "漫画改编", "Based on a Light Novel": "轻小说改编",
  "Based on a Visual Novel": "视觉小说改编", "Based on a Video Game": "游戏改编",
  "Original Work": "原创",
  // Power/Ability
  Superpower: "超能力", Telekinesis: "念力", Telepathy: "心灵感应",
  "Power Suit": "动力甲", Transformation: "变身",
  // Dark/Mature
  "Dark Fantasy": "黑暗奇幻", Noir: "黑色", Terrorism: "恐怖主义",
  Drugs: "毒品", Gambling: "赌博", Gangs: "帮派", Prison: "监狱",
  // Sci-Fi specific
  Alien: "外星人", Android: "仿生人", Clone: "克隆",
  "Time Manipulation": "时间操控", Steampunk: "蒸汽朋克",
  "Space Opera": "太空歌剧",
  // Daily Life
  Workplace: "职场", Food: "美食", Travel: "旅行",
  Camping: "露营",
  // Emotional
  Heartwarming: "治愈", Tearjerker: "催泪", "Feel-good": "暖心",
  Bittersweet: "苦甜", Melancholy: "忧郁",
  // Narrative
  Flashback: "回忆", Foreshadowing: "伏笔", "Non-linear": "非线性叙事",
  "Unreliable Narrator": "不可靠叙述者", Meta: "元叙事",
  // Misc
  Ninja: "忍者", Pirate: "海盗", Knight: "骑士", Dragon: "龙",
  Monster: "怪物", Dungeon: "地牢", Adventurer: "冒险者",
  Guild: "公会", Kingdom: "王国", Empire: "帝国",
  Mythology: "神话", Folklore: "民间传说",
  "Love Polygon": "多角恋", Henshin: "变身",
  "Gender Bending": "性转",
  Crossdressing: "女装/男装", Cosplay: "角色扮演",
  Villainess: "恶役千金", Otome: "乙女",
  Iyashikei: "治愈系", CGDCT: "可爱女孩日常",
  "Boys' Love": "耽美", "Girls' Love": "百合",
  Yuri: "百合", Yaoi: "耽美", BL: "耽美", GL: "百合",
  Fanservice: "福利",
  Masochism: "受虐", Sadism: "施虐",
  "Age Regression": "年龄回溯", "Body Swapping": "灵魂互换",
  Memory: "记忆",
  Medieval: "中世纪", "Feudal Japan": "日本战国",
  "Tang Dynasty": "唐朝", "Edo Period": "江户时代",
  Tokugawa: "德川", Meiji: "明治",
  // More tags (no duplicates with above)
  "Surreal Comedy": "荒诞喜剧", "Dark Comedy": "黑色幽默",
  "Romantic Comedy": "恋爱喜剧", "Romantic Subtext": "恋爱暗线",
  "LGBTQ+ Themes": "LGBT题材", Animals: "动物", Torture: "拷问",
  "Monster Girl": "怪物娘", "Monster Boy": "怪物男",
  Gyaru: "辣妹", Fairy: "妖精", Elf: "精灵", Dwarf: "矮人",
  Succubus: "魅魔", Demon: "恶魔",
  "Lost Civilization": "失落文明", Apocalypse: "末日",
  "Natural Disaster": "自然灾害", Pandemic: "瘟疫",
  "Augmented Reality": "增强现实", "Virtual Reality": "虚拟现实",
  Espionage: "谍战", Assassin: "刺客", Fencing: "击剑",
  Orchestra: "管弦乐", Singing: "歌唱", Rap: "说唱",
  Necromancer: "死灵法师", Summoning: "召唤", Alchemist: "炼金术师",
  "Fan Service": "福利", "Full Color": "全彩", "Full CGI": "全CG",
  "Primarily Child Cast": "儿童为主",
  Heterosexual: "异性恋", Bisexual: "双性恋", "Non-binary": "非二元",
  "Cosmic Horror": "宇宙恐怖", Kaiju: "怪兽",
  "Otaku Culture": "宅文化", "Cute Pets": "萌宠",
  "Animal Ears": "兽耳", Kemonomimi: "兽耳娘",
  Anthropomorphism: "拟人化", "Super Deformed": "Q版",
  Prophecy: "预言", "Power of Friendship": "友情之力",
  Overpowered: "无敌主角", "Weak to Strong": "由弱变强",
  "Game Elements": "游戏元素", "Status Screen": "状态界面",
  Cheat: "作弊能力", Levelup: "升级",
  "Magical Girl": "魔法少女", "Lost Memory": "失忆",
};
