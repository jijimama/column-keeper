import Link from "next/link";
import { listAdminColumns } from "@/lib/api";
import { EntryAdminForm } from "@/components/admin/EntryAdminForm";

export default async function NewEntryPage() {
  const columns = await listAdminColumns();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <h1 className="font-serif text-2xl tracking-wide">記事 新規作成</h1>
        <Link
          href="/admin/entries"
          className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          ← 一覧
        </Link>
      </header>

      {columns.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-stone-500">
          先に <Link href="/admin/columns" className="underline">コラム</Link> を作成してください
        </p>
      ) : (
        <EntryAdminForm columns={columns} />
      )}
    </div>
  );
}
