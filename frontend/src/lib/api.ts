export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type Newspaper = {
  id: number;
  name: string;
};

export type ColumnRef = {
  id: number;
  name: string;
  newspaper: Newspaper;
};

export type ColumnEntry = {
  id: number;
  published_on: string;
  content_snippet: string;
  view_count: number;
  last_viewed_at: string | null;
  is_unread: boolean;
  is_favorited: boolean;
  column: ColumnRef;
};

export type ColumnEntryDetail = ColumnEntry & {
  content: string;
  source_url: string | null;
};

export type ColumnEntryFilters = {
  newspaper_id?: string;
  column_id?: string;
  favorited?: string;
};

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function listColumnEntries(
  filters?: ColumnEntryFilters
): Promise<ColumnEntry[]> {
  const res = await fetch(buildUrl("/api/column_entries", filters), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch column entries: ${res.status}`);
  return res.json();
}

export async function getColumnEntry(
  id: string | number
): Promise<ColumnEntryDetail> {
  const res = await fetch(buildUrl(`/api/column_entries/${id}`), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch column entry: ${res.status}`);
  return res.json();
}

export async function favoriteEntry(id: string | number): Promise<void> {
  const res = await fetch(buildUrl(`/api/column_entries/${id}/favorite`), {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to favorite: ${res.status}`);
}

export async function unfavoriteEntry(id: string | number): Promise<void> {
  const res = await fetch(buildUrl(`/api/column_entries/${id}/favorite`), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to unfavorite: ${res.status}`);
}

export async function listNewspapers(): Promise<Newspaper[]> {
  const res = await fetch(buildUrl("/api/newspapers"), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch newspapers: ${res.status}`);
  return res.json();
}

export async function listColumns(
  newspaperId?: string
): Promise<ColumnRef[]> {
  const res = await fetch(
    buildUrl("/api/columns", { newspaper_id: newspaperId }),
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to fetch columns: ${res.status}`);
  return res.json();
}
