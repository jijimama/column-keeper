import Link from "next/link";
import {
  listAdminEntries,
  listAdminNewspapers,
  listAdminColumns,
  type AdminEntryFilters,
} from "@/lib/api";
import { EntryAdminList } from "@/components/admin/EntryAdminList";
import { Pagination } from "@/components/Pagination";

type Props = {
  searchParams: Promise<{
    newspaper_id?: string;
    column_id?: string;
    page?: string;
  }>;
};

export default async function EntriesAdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters: AdminEntryFilters = {
    newspaper_id: sp.newspaper_id,
    column_id: sp.column_id,
    page: sp.page,
  };

  const [{ entries, pagination }, newspapers, columns] = await Promise.all([
    listAdminEntries(filters),
    listAdminNewspapers(),
    listAdminColumns(),
  ]);

  const selectClass =
    "rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/40";

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">記事</h1>
          <p className="mt-1 text-xs text-stone-500">
            {pagination.total_count} 件
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/admin/entries/new"
            className="rounded bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 px-3 py-1.5 hover:opacity-85"
          >
            + 新規
          </Link>
          <Link
            href="/admin"
            className="text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
          >
            ← 管理トップ
          </Link>
        </div>
      </header>

      <form
        method="get"
        action="/admin/entries"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 p-3"
      >
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-stone-600 dark:text-stone-400">新聞</span>
          <select
            name="newspaper_id"
            defaultValue={filters.newspaper_id ?? ""}
            className={selectClass}
          >
            <option value="">すべて</option>
            {newspapers.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-stone-600 dark:text-stone-400">
            コラム
          </span>
          <select
            name="column_id"
            defaultValue={filters.column_id ?? ""}
            className={selectClass}
          >
            <option value="">すべて</option>
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.newspaper.name} / {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 px-3 py-1.5 text-sm hover:opacity-85"
        >
          絞り込む
        </button>
        <a
          href="/admin/entries"
          className="text-sm text-stone-600 dark:text-stone-400 underline-offset-4 hover:underline"
        >
          クリア
        </a>
      </form>

      <EntryAdminList initial={entries} />

      <Pagination pagination={pagination} filters={filters} />
    </div>
  );
}
