import Link from "next/link";
import { getColumnEntry } from "@/lib/api";
import { FavoriteButton } from "@/components/FavoriteButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  const entry = await getColumnEntry(id);

  return (
    <article className="mx-auto max-w-3xl p-6">
      <Link
        href="/"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← 一覧に戻る
      </Link>

      <header className="mb-6 mt-4 flex items-start gap-3">
        <FavoriteButton entryId={entry.id} initial={entry.is_favorited} />
        <div className="flex-1">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {entry.column.newspaper.name} / {entry.column.name}
          </div>
          <div className="mt-1 text-lg font-semibold">{entry.published_on}</div>
        </div>
      </header>

      <div className="whitespace-pre-wrap leading-7">{entry.content}</div>

      {entry.source_url && (
        <p className="mt-6 text-sm">
          <a
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            原典を開く →
          </a>
        </p>
      )}

      <p className="mt-8 text-xs text-zinc-500">
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
