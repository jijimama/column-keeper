import Link from "next/link";
import { getColumnEntry } from "@/lib/api";
import { FavoriteButton } from "@/components/FavoriteButton";
import { newspaperStyle } from "@/lib/newspaper-style";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  const entry = await getColumnEntry(id);
  const style = newspaperStyle(entry.column.newspaper.name);

  return (
    <article className="mx-auto max-w-3xl p-6">
      <Link
        href="/"
        className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
      >
        ← 一覧に戻る
      </Link>

      <header
        className={`mt-4 mb-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 border-l-4 ${style.accent} p-5`}
      >
        <div className="flex items-start gap-3">
          <FavoriteButton entryId={entry.id} initial={entry.is_favorited} />
          <div className="flex-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${style.chipBg} ${style.chipText}`}
            >
              <span className={`size-1.5 rounded-full ${style.dot}`} />
              {entry.column.newspaper.name} / {entry.column.name}
            </span>
            <div className="mt-2 font-serif text-2xl tracking-wide text-stone-900 dark:text-stone-100">
              {entry.published_on}
            </div>
          </div>
        </div>
      </header>

      <div className="font-serif whitespace-pre-wrap leading-8 text-[17px] text-stone-800 dark:text-stone-200">
        {entry.content}
      </div>

      {entry.source_url && (
        <p className="mt-8 text-sm">
          <a
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-700 dark:text-stone-300 underline underline-offset-4 hover:opacity-80"
          >
            原典を開く →
          </a>
        </p>
      )}

      <p className="mt-10 border-t border-stone-200 dark:border-stone-800 pt-4 text-xs text-stone-500">
        閲覧数 {entry.view_count} 回
        {entry.last_viewed_at && (
          <span>
            {" "}
            / 最終閲覧 {new Date(entry.last_viewed_at).toLocaleString("ja-JP")}
          </span>
        )}
      </p>
    </article>
  );
}
