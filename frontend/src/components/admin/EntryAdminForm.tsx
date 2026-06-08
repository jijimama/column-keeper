"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createEntry,
  updateEntry,
  type AdminColumn,
  type AdminEntry,
  type AdminEntryInput,
} from "@/lib/api";

type Props = {
  columns: AdminColumn[];
  initial?: AdminEntry;
};

export function EntryAdminForm({ columns, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [columnId, setColumnId] = useState<number>(
    initial?.column.id ?? columns[0]?.id ?? 0
  );
  const [publishedOn, setPublishedOn] = useState(
    initial?.published_on ?? new Date().toISOString().slice(0, 10)
  );
  const [content, setContent] = useState(initial?.content ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("本文は必須です");
      return;
    }

    const input: AdminEntryInput = {
      column_id: columnId,
      published_on: publishedOn,
      content: content,
      source_url: sourceUrl.trim() || null,
    };

    setPending(true);
    try {
      if (initial) {
        await updateEntry(initial.id, input);
      } else {
        await createEntry(input);
      }
      router.push("/admin/entries");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  };

  const inputClass =
    "w-full rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/40";
  const labelClass = "block text-sm text-stone-700 dark:text-stone-300 mb-1";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-3">
        <div>
          <label className={labelClass}>新聞 / コラム *</label>
          <select
            value={columnId}
            onChange={(e) => setColumnId(Number(e.target.value))}
            required
            className={inputClass}
            disabled={!!initial}
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.newspaper.name} / {c.name}
              </option>
            ))}
          </select>
          {initial && (
            <p className="mt-1 text-xs text-stone-500">
              コラムの変更はできません（記事の重複制約のため）
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>掲載日 *</label>
          <input
            type="date"
            value={publishedOn}
            onChange={(e) => setPublishedOn(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            ソース URL <span className="text-stone-500">（任意）</span>
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>本文 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={14}
            className={`${inputClass} font-serif leading-7`}
            placeholder="コラム本文を貼り付け…"
          />
          <p className="mt-1 text-xs text-stone-500">
            {content.length} 文字
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-85"
        >
          {pending ? "保存中…" : initial ? "更新" : "作成"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/entries")}
          disabled={pending}
          className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
