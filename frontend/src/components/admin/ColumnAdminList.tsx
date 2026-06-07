"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteColumn, type AdminColumn } from "@/lib/api";

type Props = {
  initial: AdminColumn[];
};

export function ColumnAdminList({ initial }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async (col: AdminColumn) => {
    if (
      !confirm(
        `「${col.newspaper.name} / ${col.name}」を削除します。\n紐づく記事 (${col.entries_count}) もすべて削除されます。よろしいですか？`
      )
    ) {
      return;
    }
    setPending(col.id);
    setError(null);
    try {
      await deleteColumn(col.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(null);
    }
  };

  // 新聞ごとにグルーピング
  const grouped = initial.reduce<Record<string, AdminColumn[]>>((acc, c) => {
    const key = c.newspaper.name;
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {Object.entries(grouped).map(([newspaperName, cols]) => (
        <section key={newspaperName}>
          <h2 className="font-serif text-lg mb-2 text-stone-800 dark:text-stone-200">
            {newspaperName}
          </h2>
          <ul className="divide-y divide-stone-200 dark:divide-stone-800 rounded-lg border border-stone-200 dark:border-stone-800">
            {cols.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-900/40"
              >
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    記事 {c.entries_count} 件
                    {c.scrape_enabled && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-emerald-800 dark:text-emerald-200">
                        scrape
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/columns/${c.id}`}
                  className="rounded border border-stone-300 dark:border-stone-700 px-2 py-1 text-xs hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  disabled={pending === c.id}
                  className="rounded border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
