import Link from "next/link";
import { listAdminNewspapers } from "@/lib/api";
import { ColumnAdminForm } from "@/components/admin/ColumnAdminForm";

export default async function NewColumnPage() {
  const newspapers = await listAdminNewspapers();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <h1 className="font-serif text-2xl tracking-wide">コラム新規作成</h1>
        <Link
          href="/admin/columns"
          className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          ← 一覧
        </Link>
      </header>

      {newspapers.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-stone-500">
          先に <Link href="/admin/newspapers" className="underline">新聞</Link> を作成してください
        </p>
      ) : (
        <ColumnAdminForm newspapers={newspapers} />
      )}
    </div>
  );
}
