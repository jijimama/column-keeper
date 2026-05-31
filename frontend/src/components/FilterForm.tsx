import { listColumns, listNewspapers, type ColumnEntryFilters } from "@/lib/api";

type Props = {
  filters: ColumnEntryFilters;
};

export async function FilterForm({ filters }: Props) {
  const [newspapers, columns] = await Promise.all([
    listNewspapers(),
    listColumns(),
  ]);

  const selectClass =
    "rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm";

  return (
    <form
      method="get"
      action="/"
      className="flex flex-wrap items-end gap-3 rounded bg-zinc-100 dark:bg-zinc-900 p-4"
    >
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-zinc-600 dark:text-zinc-400">新聞</span>
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
        <span className="mb-1 text-zinc-600 dark:text-zinc-400">コラム</span>
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

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="favorited"
          value="true"
          defaultChecked={filters.favorited === "true"}
        />
        お気に入りのみ
      </label>

      <button
        type="submit"
        className="rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-3 py-1.5 text-sm hover:opacity-80"
      >
        絞り込む
      </button>
      <a
        href="/"
        className="text-sm text-zinc-600 dark:text-zinc-400 underline hover:opacity-80"
      >
        クリア
      </a>
    </form>
  );
}
