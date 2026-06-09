import { listColumns, listNewspapers, type ColumnEntryFilters } from "@/lib/api";

type Props = {
  filters: ColumnEntryFilters;
};

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export async function FilterForm({ filters }: Props) {
  const [newspapers, columns] = await Promise.all([
    listNewspapers(),
    listColumns(),
  ]);

  const fieldClass =
    "rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/40";

  return (
    <form
      method="get"
      action="/"
      className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 p-4"
    >
      <label className="flex flex-col text-sm">
        <span className="mb-1 text-stone-600 dark:text-stone-400">新聞</span>
        <select
          name="newspaper_id"
          defaultValue={filters.newspaper_id ?? ""}
          className={fieldClass}
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
        <span className="mb-1 text-stone-600 dark:text-stone-400">コラム</span>
        <select
          name="column_id"
          defaultValue={filters.column_id ?? ""}
          className={fieldClass}
        >
          <option value="">すべて</option>
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.newspaper.name} / {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col text-sm">
        <span className="mb-1 text-stone-600 dark:text-stone-400">
          月日（年は問わない）
        </span>
        <div className="flex items-center gap-1">
          <select
            name="month"
            defaultValue={filters.month ?? ""}
            aria-label="月"
            className={fieldClass}
          >
            <option value="">--</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
          <select
            name="day"
            defaultValue={filters.day ?? ""}
            aria-label="日"
            className={fieldClass}
          >
            <option value="">--</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}日
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex flex-col text-sm">
        <span className="mb-1 text-stone-600 dark:text-stone-400">本文検索</span>
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="キーワード"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col text-sm">
        <span className="mb-1 text-stone-600 dark:text-stone-400">並び替え</span>
        <select
          name="sort"
          defaultValue={filters.sort ?? ""}
          className={fieldClass}
        >
          <option value="">新しい順</option>
          <option value="views">閲覧数順</option>
          <option value="oldest">古い順</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm pb-1">
        <input
          type="checkbox"
          name="favorited"
          value="true"
          defaultChecked={filters.favorited === "true"}
          className="size-4 accent-amber-500"
        />
        <span className="text-stone-700 dark:text-stone-300">
          お気に入り
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm pb-1">
        <input
          type="checkbox"
          name="unread"
          value="true"
          defaultChecked={filters.unread === "true"}
          className="size-4 accent-blue-500"
        />
        <span className="text-stone-700 dark:text-stone-300">未読のみ</span>
      </label>

      <div className="flex items-center gap-2 ml-auto pb-1">
        <button
          type="submit"
          className="rounded bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 px-3 py-1.5 text-sm font-medium hover:opacity-85 transition-opacity"
        >
          絞り込む
        </button>
        <a
          href="/"
          className="text-sm text-stone-600 dark:text-stone-400 underline-offset-4 hover:underline"
        >
          クリア
        </a>
      </div>
    </form>
  );
}
