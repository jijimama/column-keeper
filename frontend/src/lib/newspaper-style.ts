// 新聞ごとに薄いアクセント色を割り当てる。
// Tailwind v4 の JIT はクラス名を静的に検出するため、全て完全な文字列で記述する必要がある。
// 地域・色相のゆるい対応:
//   全国紙 = 固有色
//   東北 = 寒色系
//   関東 = 緑〜橙系
//   信越 = 緑〜黄
//   東海・関西 = 茶〜紫
//   中国 = 紫系
//   四国 = ピンク〜緑
//   九州・沖縄 = 暖色〜マゼンタ

export type NewspaperStyle = {
  accent: string; // 左ボーダー
  chipBg: string; // チップ背景
  chipText: string; // チップ文字
  dot: string; // ドット
};

const STYLES: Record<string, NewspaperStyle> = {
  // --- 全国紙 ---
  朝日新聞: {
    accent: "border-l-rose-400",
    chipBg: "bg-rose-100/70 dark:bg-rose-900/30",
    chipText: "text-rose-900 dark:text-rose-200",
    dot: "bg-rose-400",
  },
  毎日新聞: {
    accent: "border-l-slate-400",
    chipBg: "bg-slate-100/70 dark:bg-slate-800/50",
    chipText: "text-slate-900 dark:text-slate-200",
    dot: "bg-slate-400",
  },
  東京新聞: {
    accent: "border-l-emerald-500",
    chipBg: "bg-emerald-100/70 dark:bg-emerald-900/30",
    chipText: "text-emerald-900 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },

  // --- 北海道・東北 ---
  東奥日報: {
    accent: "border-l-sky-400",
    chipBg: "bg-sky-100/70 dark:bg-sky-900/30",
    chipText: "text-sky-900 dark:text-sky-200",
    dot: "bg-sky-400",
  },
  陸奥新報: {
    accent: "border-l-indigo-400",
    chipBg: "bg-indigo-100/70 dark:bg-indigo-900/30",
    chipText: "text-indigo-900 dark:text-indigo-200",
    dot: "bg-indigo-400",
  },
  秋田魁新報: {
    accent: "border-l-cyan-500",
    chipBg: "bg-cyan-100/70 dark:bg-cyan-900/30",
    chipText: "text-cyan-900 dark:text-cyan-200",
    dot: "bg-cyan-500",
  },
  山形新聞: {
    accent: "border-l-blue-400",
    chipBg: "bg-blue-100/70 dark:bg-blue-900/30",
    chipText: "text-blue-900 dark:text-blue-200",
    dot: "bg-blue-400",
  },
  岩手日日新聞: {
    accent: "border-l-teal-400",
    chipBg: "bg-teal-100/70 dark:bg-teal-900/30",
    chipText: "text-teal-900 dark:text-teal-200",
    dot: "bg-teal-400",
  },
  福島民報: {
    accent: "border-l-indigo-500",
    chipBg: "bg-indigo-100/70 dark:bg-indigo-900/30",
    chipText: "text-indigo-900 dark:text-indigo-200",
    dot: "bg-indigo-500",
  },
  いわき日報: {
    accent: "border-l-sky-500",
    chipBg: "bg-sky-100/70 dark:bg-sky-900/30",
    chipText: "text-sky-900 dark:text-sky-200",
    dot: "bg-sky-500",
  },

  // --- 関東 ---
  茨城新聞: {
    accent: "border-l-amber-400",
    chipBg: "bg-amber-100/70 dark:bg-amber-900/30",
    chipText: "text-amber-900 dark:text-amber-200",
    dot: "bg-amber-400",
  },
  上毛新聞: {
    accent: "border-l-lime-500",
    chipBg: "bg-lime-100/70 dark:bg-lime-900/30",
    chipText: "text-lime-900 dark:text-lime-200",
    dot: "bg-lime-500",
  },

  // --- 信越 ---
  新潟日報: {
    accent: "border-l-green-400",
    chipBg: "bg-green-100/70 dark:bg-green-900/30",
    chipText: "text-green-900 dark:text-green-200",
    dot: "bg-green-400",
  },
  長野日報: {
    accent: "border-l-emerald-400",
    chipBg: "bg-emerald-100/70 dark:bg-emerald-900/30",
    chipText: "text-emerald-900 dark:text-emerald-200",
    dot: "bg-emerald-400",
  },
  市民タイムス: {
    accent: "border-l-yellow-500",
    chipBg: "bg-yellow-100/70 dark:bg-yellow-900/30",
    chipText: "text-yellow-900 dark:text-yellow-200",
    dot: "bg-yellow-500",
  },

  // --- 東海・関西 ---
  伊勢新聞: {
    accent: "border-l-orange-400",
    chipBg: "bg-orange-100/70 dark:bg-orange-900/30",
    chipText: "text-orange-900 dark:text-orange-200",
    dot: "bg-orange-400",
  },
  奈良新聞: {
    accent: "border-l-purple-400",
    chipBg: "bg-purple-100/70 dark:bg-purple-900/30",
    chipText: "text-purple-900 dark:text-purple-200",
    dot: "bg-purple-400",
  },

  // --- 中国 ---
  中国新聞: {
    accent: "border-l-violet-400",
    chipBg: "bg-violet-100/70 dark:bg-violet-900/30",
    chipText: "text-violet-900 dark:text-violet-200",
    dot: "bg-violet-400",
  },
  山陰中央新報: {
    accent: "border-l-fuchsia-400",
    chipBg: "bg-fuchsia-100/70 dark:bg-fuchsia-900/30",
    chipText: "text-fuchsia-900 dark:text-fuchsia-200",
    dot: "bg-fuchsia-400",
  },
  山陽新聞: {
    accent: "border-l-red-400",
    chipBg: "bg-red-100/70 dark:bg-red-900/30",
    chipText: "text-red-900 dark:text-red-200",
    dot: "bg-red-400",
  },

  // --- 四国 ---
  高知新聞: {
    accent: "border-l-pink-400",
    chipBg: "bg-pink-100/70 dark:bg-pink-900/30",
    chipText: "text-pink-900 dark:text-pink-200",
    dot: "bg-pink-400",
  },

  // --- 九州・沖縄 ---
  佐賀新聞: {
    accent: "border-l-amber-500",
    chipBg: "bg-amber-100/70 dark:bg-amber-900/30",
    chipText: "text-amber-900 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  八重山毎日新聞: {
    accent: "border-l-cyan-400",
    chipBg: "bg-cyan-100/70 dark:bg-cyan-900/30",
    chipText: "text-cyan-900 dark:text-cyan-200",
    dot: "bg-cyan-400",
  },
  琉球新報: {
    accent: "border-l-rose-500",
    chipBg: "bg-rose-100/70 dark:bg-rose-900/30",
    chipText: "text-rose-900 dark:text-rose-200",
    dot: "bg-rose-500",
  },
};

const FALLBACK: NewspaperStyle = {
  accent: "border-l-stone-400",
  chipBg: "bg-stone-100/70 dark:bg-stone-800/50",
  chipText: "text-stone-800 dark:text-stone-300",
  dot: "bg-stone-400",
};

export function newspaperStyle(name: string): NewspaperStyle {
  return STYLES[name] ?? FALLBACK;
}
