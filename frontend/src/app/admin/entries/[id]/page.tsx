import Link from "next/link";
import { getAdminEntry, listAdminColumns } from "@/lib/api";
import { EntryAdminForm } from "@/components/admin/EntryAdminForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEntryPage({ params }: Props) {
  const { id } = await params;
  const [entry, columns] = await Promise.all([
    getAdminEntry(Number(id)),
    listAdminColumns(),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">記事 編集</h1>
          <p className="mt-1 text-xs text-stone-500">
            {entry.newspaper.name} / {entry.column.name} / {entry.published_on}
          </p>
        </div>
        <Link
          href="/admin/entries"
          className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          ← 一覧
        </Link>
      </header>

      <EntryAdminForm columns={columns} initial={entry} />
    </div>
  );
}
