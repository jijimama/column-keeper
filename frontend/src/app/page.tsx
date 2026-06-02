import Link from "next/link";
import { listColumnEntries, type ColumnEntryFilters } from "@/lib/api";
import { FilterForm } from "@/components/FilterForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Pagination } from "@/components/Pagination";
import { newspaperStyle } from "@/lib/newspaper-style";

type Props = {
  searchParams: Promise<{
    newspaper_id?: string;
    column_id?: string;
    favorited?: string;
    month?: string;
    day?: string;
    page?: string;
  }>;
};

export default async function ListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters: ColumnEntryFilters = {
    newspaper_id: sp.newspaper_id,
    column_id: sp.column_id,
    favorited: sp.favorited,
    month: sp.month,
    day: sp.day,
    page: sp.page,
  };
  const { entries, pagination } = await listColumnEntries(filters);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-3xl tracking-wide text-stone-900 dark:text-stone-100">
            column-keeper
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            新聞コラムを集めて読む
          </p>
        </div>
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {pagination.total_count} 件
        </span>
      </header>

      <FilterForm filters={filters} />

      <ul className="mt-6 space-y-3">
        {entries.length === 0 && (
          <li className="rounded-lg border border-dashed border-stone-300 dark:border-stone-700 p-8 text-center text-stone-500">
            該当する記事がありません
          </li>
        )}
        {entries.map((entry) => {
          const style = newspaperStyle(entry.column.newspaper.name);
          return (
            <li
              key={entry.id}
              className={`flex items-stretch rounded-lg border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 border-l-4 ${style.accent} transition-shadow hover:shadow-sm`}
            >
              <div className="flex items-center px-3">
                <FavoriteButton
                  entryId={entry.id}
                  initial={entry.is_favorited}
                />
              </div>
              <Link
                href={`/entries/${entry.id}`}
                className="flex-1 p-4 pl-2 rounded-r-lg hover:bg-stone-50 dark:hover:bg-stone-900/60"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ${style.chipBg} ${style.chipText}`}
                  >
                    <span className={`size-1.5 rounded-full ${style.dot}`} />
                    {entry.column.newspaper.name} / {entry.column.name}
                  </span>
                  <time className="text-stone-600 dark:text-stone-400 font-serif">
                    {entry.published_on}
                  </time>
                  {entry.is_unread ? (
                    <span className="ml-auto inline-flex items-center rounded-full bg-amber-100/80 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:text-amber-200">
                      未読
                    </span>
                  ) : (
                    <span className="ml-auto text-[10px] text-stone-500">
                      閲覧 {entry.view_count}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-serif text-base leading-7 text-stone-800 dark:text-stone-200">
                  {entry.content_snippet}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <Pagination pagination={pagination} filters={filters} />
    </div>
  );
}
