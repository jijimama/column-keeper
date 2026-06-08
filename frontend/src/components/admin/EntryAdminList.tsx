"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteEntry, type AdminEntry } from "@/lib/api";

type Props = {
  initial: AdminEntry[];
};

export function EntryAdminList({ initial }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async (entry: AdminEntry) => {
    if (
      !confirm(
        `${entry.newspaper.name} / ${entry.column.name} の ${entry.published_on} の記事を削除します。よろしいですか？`
      )
    ) {
      return;
    }
    setPending(entry.id);
    setError(null);
    try {
      await deleteEntry(entry.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <ul className="divide-y divide-stone-200 dark:divide-stone-800 rounded-lg border border-stone-200 dark:border-stone-800">
        {initial.length === 0 && (
          <li className="p-4 text-center text-stone-500">該当する記事がありません</li>
        )}
        {initial.map((e) => (
          <li
            key={e.id}
            className="flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-900/40"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>{e.newspaper.name}</span>
                <span>/</span>
                <span>{e.column.name}</span>
                <time className="ml-2 font-serif">{e.published_on}</time>
              </div>
              <p className="mt-1 text-sm truncate text-stone-700 dark:text-stone-300">
                {e.content.slice(0, 80)}
                {e.content.length > 80 && "…"}
              </p>
            </div>
            <Link
              href={`/admin/entries/${e.id}`}
              className="rounded border border-stone-300 dark:border-stone-700 px-2 py-1 text-xs hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              編集
            </Link>
            <button
              type="button"
              onClick={() => onDelete(e)}
              disabled={pending === e.id}
              className="rounded border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
