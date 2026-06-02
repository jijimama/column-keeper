import Link from "next/link";
import type { ColumnEntryFilters, Pagination as PaginationType } from "@/lib/api";

type Props = {
  pagination: PaginationType;
  filters: ColumnEntryFilters;
};

function buildHref(filters: ColumnEntryFilters, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "page") continue;
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `/?${q}` : "/";
}

export function Pagination({ pagination, filters }: Props) {
  const { page, total_pages, total_count } = pagination;

  if (total_pages <= 1) {
    return (
      <div className="mt-6 text-center text-xs text-stone-500">
        {total_count} 件
      </div>
    );
  }

  const hasPrev = page > 1;
  const hasNext = page < total_pages;

  const linkBase =
    "rounded border border-stone-300 dark:border-stone-700 px-3 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800";
  const disabledBase =
    "rounded border border-stone-200 dark:border-stone-800 px-3 py-1.5 text-sm text-stone-400 dark:text-stone-600 cursor-not-allowed";

  return (
    <nav
      className="mt-6 flex items-center justify-between gap-3 text-stone-700 dark:text-stone-300"
      aria-label="ページネーション"
    >
      {hasPrev ? (
        <Link href={buildHref(filters, page - 1)} className={linkBase}>
          ← 前へ
        </Link>
      ) : (
        <span className={disabledBase} aria-disabled>
          ← 前へ
        </span>
      )}

      <span className="font-serif text-sm tabular-nums text-stone-600 dark:text-stone-400">
        {page} <span className="text-stone-400">/</span> {total_pages}
        <span className="ml-2 text-xs text-stone-500">（全 {total_count} 件）</span>
      </span>

      {hasNext ? (
        <Link href={buildHref(filters, page + 1)} className={linkBase}>
          次へ →
        </Link>
      ) : (
        <span className={disabledBase} aria-disabled>
          次へ →
        </span>
      )}
    </nav>
  );
}
