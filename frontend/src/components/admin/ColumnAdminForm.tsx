"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createColumn,
  updateColumn,
  type AdminColumn,
  type AdminColumnInput,
  type AdminNewspaper,
} from "@/lib/api";

type Props = {
  newspapers: AdminNewspaper[];
  initial?: AdminColumn;
  // initial がなければ新規作成モード
};

export function ColumnAdminForm({ newspapers, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [newspaperId, setNewspaperId] = useState<number>(
    initial?.newspaper.id ?? newspapers[0]?.id ?? 0
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");
  const [scrapeEnabled, setScrapeEnabled] = useState(initial?.scrape_enabled ?? false);
  const [baseUrl, setBaseUrl] = useState(initial?.scrape_base_url ?? "");
  const [listSelector, setListSelector] = useState(initial?.scrape_list_selector ?? "");
  const [listIndex, setListIndex] = useState(initial?.scrape_list_index ?? 0);
  const [detailBaseUrl, setDetailBaseUrl] = useState(initial?.scrape_detail_base_url ?? "");
  const [detailSelector, setDetailSelector] = useState(initial?.scrape_detail_selector ?? "");
  const [dateSelector, setDateSelector] = useState(initial?.scrape_date_selector ?? "");
  const [dateRegexp, setDateRegexp] = useState(initial?.scrape_date_regexp ?? "");
  const [replaceRulesJson, setReplaceRulesJson] = useState(
    initial?.scrape_replace_rules && Object.keys(initial.scrape_replace_rules).length > 0
      ? JSON.stringify(initial.scrape_replace_rules, null, 2)
      : ""
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let replaceRules: Record<string, string> = {};
    if (replaceRulesJson.trim()) {
      try {
        const parsed = JSON.parse(replaceRulesJson);
        if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
          throw new Error("オブジェクトを期待 (例: {\"detail\":\"moredetail\"})");
        }
        replaceRules = parsed;
      } catch (e) {
        setError(`replace_rules の JSON が不正: ${e instanceof Error ? e.message : String(e)}`);
        return;
      }
    }

    const input: AdminColumnInput = {
      newspaper_id: newspaperId,
      name: name.trim(),
      source_url: sourceUrl.trim() || null,
      scrape_enabled: scrapeEnabled,
      scrape_base_url: baseUrl.trim() || null,
      scrape_list_selector: listSelector.trim() || null,
      scrape_list_index: Number(listIndex) || 0,
      scrape_detail_base_url: detailBaseUrl.trim() || null,
      scrape_detail_selector: detailSelector.trim() || null,
      scrape_date_selector: dateSelector.trim() || null,
      scrape_date_regexp: dateRegexp || null,
      scrape_replace_rules: replaceRules,
    };

    setPending(true);
    try {
      if (initial) {
        await updateColumn(initial.id, input);
      } else {
        await createColumn(input);
      }
      router.push("/admin/columns");
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
  const fieldsetClass =
    "rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-3";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className={fieldsetClass}>
        <div className="font-medium text-stone-800 dark:text-stone-200">基本情報</div>

        <div>
          <label className={labelClass}>新聞 *</label>
          <select
            value={newspaperId}
            onChange={(e) => setNewspaperId(Number(e.target.value))}
            required
            className={inputClass}
          >
            {newspapers.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>コラム名 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="例: 天声人語"
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
      </div>

      <div className={fieldsetClass}>
        <label className="flex items-center gap-2 text-sm text-stone-800 dark:text-stone-200">
          <input
            type="checkbox"
            checked={scrapeEnabled}
            onChange={(e) => setScrapeEnabled(e.target.checked)}
            className="size-4"
          />
          <span className="font-medium">スクレイピング有効</span>
          <span className="text-xs text-stone-500">
            （以下の設定を使って最新コラムを取得する）
          </span>
        </label>

        <fieldset disabled={!scrapeEnabled} className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
          <div>
            <label className={labelClass}>base_url（一覧 or 詳細ページ）</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com/category/..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>
                list_selector <span className="text-stone-500">（空なら base_url を詳細扱い）</span>
              </label>
              <input
                type="text"
                value={listSelector}
                onChange={(e) => setListSelector(e.target.value)}
                placeholder='ul.articlelist li a'
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>list_index</label>
              <input
                type="number"
                min={0}
                value={listIndex}
                onChange={(e) => setListIndex(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              detail_base_url <span className="text-stone-500">（相対パスの場合の前置URL）</span>
            </label>
            <input
              type="text"
              value={detailBaseUrl}
              onChange={(e) => setDetailBaseUrl(e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>detail_selector（本文）</label>
            <input
              type="text"
              value={detailSelector}
              onChange={(e) => setDetailSelector(e.target.value)}
              placeholder="div.article-body p"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>date_selector（日付）</label>
            <input
              type="text"
              value={dateSelector}
              onChange={(e) => setDateSelector(e.target.value)}
              placeholder="div.pubdate"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              date_regexp <span className="text-stone-500">
                （年月日を $1 $2 $3 でキャプチャ。例: (\d{`{4}`})年(\d{`{1,2}`})月(\d{`{1,2}`})日）
              </span>
            </label>
            <input
              type="text"
              value={dateRegexp}
              onChange={(e) => setDateRegexp(e.target.value)}
              placeholder="(\d{4})/(\d{1,2})/(\d{1,2})"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelClass}>
              replace_rules <span className="text-stone-500">
                （JSON 形式。詳細URLの一部を置換したいとき。例:{" "}
                <code className="text-xs">{`{"detail":"moredetail"}`}</code>）
              </span>
            </label>
            <textarea
              value={replaceRulesJson}
              onChange={(e) => setReplaceRulesJson(e.target.value)}
              rows={3}
              placeholder='{"detail":"moredetail"}'
              className={`${inputClass} font-mono`}
            />
          </div>
        </fieldset>
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
          onClick={() => router.push("/admin/columns")}
          disabled={pending}
          className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
