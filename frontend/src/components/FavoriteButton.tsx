"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { favoriteEntry, unfavoriteEntry } from "@/lib/api";

type Props = {
  entryId: number;
  initial: boolean;
};

export function FavoriteButton({ entryId, initial }: Props) {
  const [favorited, setFavorited] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = async () => {
    const next = !favorited;
    setFavorited(next);

    try {
      if (next) await favoriteEntry(entryId);
      else await unfavoriteEntry(entryId);
      startTransition(() => router.refresh());
    } catch (e) {
      setFavorited(!next);
      console.error(e);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "お気に入りを解除" : "お気に入りに登録"}
      className={`text-2xl leading-none transition-opacity ${
        pending ? "opacity-50" : "hover:opacity-70"
      } ${favorited ? "text-yellow-500" : "text-zinc-400"}`}
    >
      {favorited ? "★" : "☆"}
    </button>
  );
}
