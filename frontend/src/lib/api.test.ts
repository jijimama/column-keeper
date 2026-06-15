import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  listColumnEntries,
  favoriteEntry,
  unfavoriteEntry,
  API_BASE_URL,
} from "./api";

describe("api.ts", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("listColumnEntries", () => {
    it("filters なしの場合、 /api/column_entries にクエリなしで GET", async () => {
      const fakeRes = { entries: [], pagination: { page: 1, per_page: 20, total_count: 0, total_pages: 0 } };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => fakeRes,
      });

      const result = await listColumnEntries();
      expect(result).toEqual(fakeRes);
      expect(fetch).toHaveBeenCalledTimes(1);
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toBe(`${API_BASE_URL}/api/column_entries`);
    });

    it("filters を URL searchParams として渡す", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({ entries: [], pagination: { page: 1, per_page: 20, total_count: 0, total_pages: 0 } }),
      });

      await listColumnEntries({
        newspaper_id: "1",
        favorited: "true",
        q: "test",
        sort: "views",
      });

      const url = new URL((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
      expect(url.searchParams.get("newspaper_id")).toBe("1");
      expect(url.searchParams.get("favorited")).toBe("true");
      expect(url.searchParams.get("q")).toBe("test");
      expect(url.searchParams.get("sort")).toBe("views");
    });

    it("空文字 / undefined の filter キーは付与しない", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({ entries: [], pagination: { page: 1, per_page: 20, total_count: 0, total_pages: 0 } }),
      });

      await listColumnEntries({ newspaper_id: "", q: undefined, sort: "views" });
      const url = new URL((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
      expect(url.searchParams.has("newspaper_id")).toBe(false);
      expect(url.searchParams.has("q")).toBe(false);
      expect(url.searchParams.get("sort")).toBe("views");
    });

    it("レスポンスが非 ok なら throw", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(listColumnEntries()).rejects.toThrow(/500/);
    });
  });

  describe("favoriteEntry / unfavoriteEntry", () => {
    it("favoriteEntry は POST /api/column_entries/:id/favorite", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      await favoriteEntry(42);
      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe(`${API_BASE_URL}/api/column_entries/42/favorite`);
      expect((init as RequestInit).method).toBe("POST");
    });

    it("unfavoriteEntry は DELETE /api/column_entries/:id/favorite", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      await unfavoriteEntry(42);
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect((init as RequestInit).method).toBe("DELETE");
    });

    it("非 ok なら throw", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });
      await expect(favoriteEntry(1)).rejects.toThrow(/500/);
    });
  });
});
