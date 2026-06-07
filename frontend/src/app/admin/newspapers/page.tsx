import Link from "next/link";
import { listAdminNewspapers } from "@/lib/api";
import { NewspaperAdminList } from "@/components/admin/NewspaperAdminList";

export default async function NewspapersAdminPage() {
  const newspapers = await listAdminNewspapers();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">新聞</h1>
          <p className="mt-1 text-xs text-stone-500">{newspapers.length} 件</p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          ← 管理トップ
        </Link>
      </header>

      <NewspaperAdminList initial={newspapers} />
    </div>
  );
}
