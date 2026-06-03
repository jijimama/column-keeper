"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scrapeLatest, type ScrapeResult } from "@/lib/api";

export function ScrapeButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await scrapeLatest();
      setResult(r);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const summaryText = result
    ? `成功 ${result.summary.created + result.summary.updated} (新規 ${result.summary.created} / 更新 ${result.summary.updated})` +
      (result.summary.failed > 0 ? ` / 失敗 ${result.summary.failed}` : "")
    : null;

  const hasFailures = result?.results.some((r) => r.status === "error");

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`rounded border border-stone-400 dark:border-stone-600 px-3 py-1.5 text-sm transition-colors ${
          loading
            ? "bg-stone-200 dark:bg-stone-800 text-stone-500 cursor-wait"
            : "bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
        }`}
      >
        {loading ? "取得中…" : "最新を取得"}
      </button>

      {summaryText && (
        <span
          className={`text-xs ${
            hasFailures
              ? "text-amber-700 dark:text-amber-400"
              : "text-stone-600 dark:text-stone-400"
          }`}
          title={
            hasFailures
              ? result!.results
                  .filter((r) => r.status === "error")
                  .map((r) => `${r.newspaper}/${r.column}: ${r.error}`)
                  .join("\n")
              : undefined
          }
        >
          {summaryText}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">
          エラー: {error}
        </span>
      )}
    </div>
  );
}
