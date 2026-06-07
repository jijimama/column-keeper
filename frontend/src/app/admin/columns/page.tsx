import Link from "next/link";
import { listAdminColumns } from "@/lib/api";
import { ColumnAdminList } from "@/components/admin/ColumnAdminList";

export default async function ColumnsAdminPage() {
  const columns = await listAdminColumns();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">コラム</h1>
          <p className="mt-1 text-xs text-stone-500">{columns.length} 件</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/admin/columns/new"
            className="rounded bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 px-3 py-1.5 hover:opacity-85"
          >
            + 新規
          </Link>
          <Link
            href="/admin"
            className="text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
          >
            ← 管理トップ
          </Link>
        </div>
      </header>

      <ColumnAdminList initial={columns} />
    </div>
  );
}
