import Link from "next/link";
import { getAdminColumn, listAdminNewspapers } from "@/lib/api";
import { ColumnAdminForm } from "@/components/admin/ColumnAdminForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditColumnPage({ params }: Props) {
  const { id } = await params;
  const [column, newspapers] = await Promise.all([
    getAdminColumn(Number(id)),
    listAdminNewspapers(),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">コラム編集</h1>
          <p className="mt-1 text-xs text-stone-500">
            {column.newspaper.name} / {column.name}
          </p>
        </div>
        <Link
          href="/admin/columns"
          className="text-sm text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          ← 一覧
        </Link>
      </header>

      <ColumnAdminForm newspapers={newspapers} initial={column} />
    </div>
  );
}
