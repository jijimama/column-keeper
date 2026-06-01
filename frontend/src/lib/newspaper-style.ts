// 新聞ごとに薄いアクセント色を割り当てる。彩度を抑えたパステル系で「カラフルかつ落ち着いた」を狙う。
// 大きな色面は使わず、左ボーダーと小さなチップでだけ色を見せる。

export type NewspaperStyle = {
  accent: string; // 左ボーダーの色
  chipBg: string; // チップ背景
  chipText: string; // チップ文字
  dot: string; // ドット
};

const STYLES: Record<string, NewspaperStyle> = {
  // 朝日 = 朝焼け
  朝日新聞: {
    accent: "border-l-rose-400",
    chipBg: "bg-rose-100/70 dark:bg-rose-900/30",
    chipText: "text-rose-900 dark:text-rose-200",
    dot: "bg-rose-400",
  },
  // 毎日 = 紺青
  毎日新聞: {
    accent: "border-l-slate-400",
    chipBg: "bg-slate-100/70 dark:bg-slate-800/50",
    chipText: "text-slate-900 dark:text-slate-200",
    dot: "bg-slate-400",
  },
  // 東京 = 杉の緑
  東京新聞: {
    accent: "border-l-emerald-500",
    chipBg: "bg-emerald-100/70 dark:bg-emerald-900/30",
    chipText: "text-emerald-900 dark:text-emerald-200",
    dot: "bg-emerald-500",
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
