"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createNewspaper,
  updateNewspaper,
  deleteNewspaper,
  type AdminNewspaper,
} from "@/lib/api";

type Props = {
  initial: AdminNewspaper[];
};

export function NewspaperAdminList({ initial }: Props) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setPending(true);
    setError(null);
    try {
      await createNewspaper(newName.trim());
      setNewName("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  };

  const startEdit = (np: AdminNewspaper) => {
    setEditingId(np.id);
    setEditingName(np.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    setPending(true);
    setError(null);
    try {
      await updateNewspaper(id, editingName.trim());
      cancelEdit();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  };

  const onDelete = async (np: AdminNewspaper) => {
    if (
      !confirm(
        `「${np.name}」を削除します。\n紐づくコラム (${np.columns_count}) と記事もすべて削除されます。よろしいですか？`
      )
    ) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await deleteNewspaper(np.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  };

  const inputClass =
    "rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/40";

  return (
    <div className="space-y-4">
      {/* 新規追加フォーム */}
      <form
        onSubmit={onCreate}
        className="flex gap-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 p-3"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新聞名（例: 北海道新聞）"
          className={`${inputClass} flex-1`}
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !newName.trim()}
          className="rounded bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 px-3 py-1 text-sm font-medium disabled:opacity-50 hover:opacity-85"
        >
          追加
        </button>
      </form>

      {error && (
        <div className="rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* 一覧 */}
      <ul className="divide-y divide-stone-200 dark:divide-stone-800 rounded-lg border border-stone-200 dark:border-stone-800">
        {initial.length === 0 && (
          <li className="p-4 text-center text-stone-500">登録なし</li>
        )}
        {initial.map((np) => (
          <li
            key={np.id}
            className="flex items-center gap-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-900/40"
          >
            {editingId === np.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className={`${inputClass} flex-1`}
                  disabled={pending}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => saveEdit(np.id)}
                  disabled={pending || !editingName.trim()}
                  className="rounded bg-stone-800 dark:bg-stone-200 text-stone-50 dark:text-stone-900 px-3 py-1 text-xs disabled:opacity-50"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={pending}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:underline"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-serif">{np.name}</span>
                <span className="text-xs text-stone-500">
                  コラム {np.columns_count} 件
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(np)}
                  disabled={pending}
                  className="rounded border border-stone-300 dark:border-stone-700 px-2 py-1 text-xs hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(np)}
                  disabled={pending}
                  className="rounded border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
