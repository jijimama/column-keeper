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
  unread?: string;
  q?: string;
  sort?: string;
  month?: string;
  day?: string;
  page?: string;
};

export type Pagination = {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
};

export type ColumnEntryListResult = {
  entries: ColumnEntry[];
  pagination: Pagination;
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
): Promise<ColumnEntryListResult> {
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

export type ScrapeResultItem = {
  newspaper: string;
  column: string;
  status: "created" | "updated" | "error";
  error?: string;
};

export type ScrapeResult = {
  results: ScrapeResultItem[];
  summary: {
    total: number;
    created: number;
    updated: number;
    failed: number;
  };
};

export async function scrapeLatest(newspaper?: string): Promise<ScrapeResult> {
  const res = await fetch(buildUrl("/api/scrapes"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newspaper ? { newspaper } : {}),
  });
  if (!res.ok) throw new Error(`Failed to scrape: ${res.status}`);
  return res.json();
}

// ===== Admin: Newspaper =====

export type AdminNewspaper = {
  id: number;
  name: string;
  columns_count: number;
};

export type AdminError = {
  errors?: Record<string, string[]>;
  message?: string;
};

async function adminFetch(
  path: string,
  init: RequestInit
): Promise<Response> {
  const res = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  return res;
}

async function readErrorBody(res: Response): Promise<AdminError> {
  try {
    return (await res.json()) as AdminError;
  } catch {
    return { message: `HTTP ${res.status}` };
  }
}

export async function listAdminNewspapers(): Promise<AdminNewspaper[]> {
  const res = await fetch(buildUrl("/api/admin/newspapers"), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to list newspapers: ${res.status}`);
  return res.json();
}

export async function createNewspaper(name: string): Promise<AdminNewspaper> {
  const res = await adminFetch("/api/admin/newspapers", {
    method: "POST",
    body: JSON.stringify({ newspaper: { name } }),
  });
  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(formatErrors(body) || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateNewspaper(
  id: number,
  name: string
): Promise<AdminNewspaper> {
  const res = await adminFetch(`/api/admin/newspapers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ newspaper: { name } }),
  });
  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(formatErrors(body) || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteNewspaper(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/newspapers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete newspaper: ${res.status}`);
}

function formatErrors(body: AdminError): string {
  if (body.message) return body.message;
  if (!body.errors) return "";
  return Object.entries(body.errors)
    .map(([k, v]) => `${k}: ${v.join(", ")}`)
    .join("; ");
}

// ===== Admin: Column =====

export type AdminColumn = {
  id: number;
  name: string;
  source_url: string | null;
  newspaper: { id: number; name: string };
  scrape_enabled: boolean;
  scrape_base_url: string | null;
  scrape_list_selector: string | null;
  scrape_list_index: number;
  scrape_detail_base_url: string | null;
  scrape_detail_selector: string | null;
  scrape_date_selector: string | null;
  scrape_date_regexp: string | null;
  scrape_replace_rules: Record<string, string>;
  entries_count: number;
};

export type AdminColumnInput = {
  newspaper_id: number;
  name: string;
  source_url?: string | null;
  scrape_enabled?: boolean;
  scrape_base_url?: string | null;
  scrape_list_selector?: string | null;
  scrape_list_index?: number;
  scrape_detail_base_url?: string | null;
  scrape_detail_selector?: string | null;
  scrape_date_selector?: string | null;
  scrape_date_regexp?: string | null;
  scrape_replace_rules?: Record<string, string>;
};

export async function listAdminColumns(): Promise<AdminColumn[]> {
  const res = await fetch(buildUrl("/api/admin/columns"), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to list columns: ${res.status}`);
  return res.json();
}

export async function getAdminColumn(id: number): Promise<AdminColumn> {
  const res = await fetch(buildUrl(`/api/admin/columns/${id}`), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch column: ${res.status}`);
  return res.json();
}

export async function createColumn(
  input: AdminColumnInput
): Promise<AdminColumn> {
  const res = await adminFetch("/api/admin/columns", {
    method: "POST",
    body: JSON.stringify({ column: input }),
  });
  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(formatErrors(body) || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateColumn(
  id: number,
  input: AdminColumnInput
): Promise<AdminColumn> {
  const res = await adminFetch(`/api/admin/columns/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ column: input }),
  });
  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(formatErrors(body) || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteColumn(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/columns/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete column: ${res.status}`);
}

// ===== Admin: Entry =====

export type AdminEntry = {
  id: number;
  published_on: string;
  content: string;
  source_url: string | null;
  view_count: number;
  last_viewed_at: string | null;
  column: { id: number; name: string };
  newspaper: { id: number; name: string };
};

export type AdminEntryListResult = {
  entries: AdminEntry[];
  pagination: Pagination;
};

export type AdminEntryInput = {
  column_id: number;
  published_on: string;
  content: string;
  source_url?: string | null;
};

export type AdminEntryFilters = {
  newspaper_id?: string;
  column_id?: string;
  page?: string;
};

export async function listAdminEntries(
  filters?: AdminEntryFilters
): Promise<AdminEntryListResult> {
  const res = await fetch(buildUrl("/api/admin/entries", filters), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to list entries: ${res.status}`);
  return res.json();
}

export async function getAdminEntry(id: number): Promise<AdminEntry> {
  const res = await fetch(buildUrl(`/api/admin/entries/${id}`), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch entry: ${res.status}`);
  return res.json();
}

export async function createEntry(
  input: AdminEntryInput
): Promise<AdminEntry> {
  const res = await adminFetch("/api/admin/entries", {
    method: "POST",
    body: JSON.stringify({ entry: input }),
  });
  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(formatErrors(body) || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateEntry(
  id: number,
  input: AdminEntryInput
): Promise<AdminEntry> {
  const res = await adminFetch(`/api/admin/entries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ entry: input }),
  });
  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(formatErrors(body) || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/entries/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete entry: ${res.status}`);
}
