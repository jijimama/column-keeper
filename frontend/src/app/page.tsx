import Link from "next/link";
import { listColumnEntries, type ColumnEntryFilters } from "@/lib/api";
import { FilterForm } from "@/components/FilterForm";
import { FavoriteButton } from "@/components/FavoriteButton";

type Props = {
  searchParams: Promise<{
    newspaper_id?: string;
    column_id?: string;
    favorited?: string;
  }>;
};

export default async function ListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters: ColumnEntryFilters = {
    newspaper_id: sp.newspaper_id,
    column_id: sp.column_id,
    favorited: sp.favorited,
  };
  const entries = await listColumnEntries(filters);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">column-keeper</h1>
        <span className="text-sm text-zinc-500">{entries.length} 件</span>
      </header>

      <FilterForm filters={filters} />

      <ul className="mt-6 space-y-3">
        {entries.length === 0 && (
          <li className="rounded border border-dashed border-zinc-300 p-6 text-center text-zinc-500">
            該当する記事がありません
          </li>
        )}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex gap-3 rounded border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <FavoriteButton entryId={entry.id} initial={entry.is_favorited} />
            <Link
              href={`/entries/${entry.id}`}
              className="-m-4 flex-1 rounded p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center gap-x-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span>{entry.column.newspaper.name}</span>
                <span>/</span>
                <span>{entry.column.name}</span>
                <span>/</span>
                <span>{entry.published_on}</span>
                {entry.is_unread && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    未読
                  </span>
                )}
                {!entry.is_unread && (
                  <span className="ml-auto text-xs text-zinc-500">
                    閲覧 {entry.view_count}
                  </span>
                )}
              </div>
              <p className="mt-2 text-base">{entry.content_snippet}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
