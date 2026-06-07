import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
        <h1 className="font-serif text-2xl tracking-wide">管理画面</h1>
        <p className="mt-1 text-xs text-stone-500">
          新聞・コラム・記事を直接編集する
        </p>
      </header>

      <ul className="space-y-2">
        <li>
          <Link
            href="/admin/newspapers"
            className="block rounded border border-stone-300 dark:border-stone-700 p-4 hover:bg-stone-50 dark:hover:bg-stone-900"
          >
            <div className="font-medium">新聞</div>
            <div className="text-xs text-stone-500 mt-1">
              新聞名の追加・編集・削除
            </div>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/columns"
            className="block rounded border border-stone-300 dark:border-stone-700 p-4 hover:bg-stone-50 dark:hover:bg-stone-900"
          >
            <div className="font-medium">コラム</div>
            <div className="text-xs text-stone-500 mt-1">
              コラム名・スクレイピング設定の追加・編集
            </div>
          </Link>
        </li>
      </ul>

      <p className="mt-6 text-sm">
        <Link
          href="/"
          className="text-stone-600 dark:text-stone-400 hover:underline underline-offset-4"
        >
          ← 一覧に戻る
        </Link>
      </p>
    </div>
  );
}
