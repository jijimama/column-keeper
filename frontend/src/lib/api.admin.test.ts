import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  listAdminNewspapers,
  createNewspaper,
  updateNewspaper,
  deleteNewspaper,
  listAdminColumns,
  createColumn,
  scrapeLatest,
  API_BASE_URL,
} from "./api";

describe("api.ts admin functions", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Newspaper CRUD", () => {
    it("listAdminNewspapers が一覧 JSON を返す", async () => {
      const fake = [{ id: 1, name: "新聞A", columns_count: 0 }];
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => fake });
      const result = await listAdminNewspapers();
      expect(result).toEqual(fake);
      expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(`${API_BASE_URL}/api/admin/newspapers`);
    });

    it("createNewspaper は POST + JSON body", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, name: "新作", columns_count: 0 }),
      });
      await createNewspaper("新作");
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect((init as RequestInit).method).toBe("POST");
      expect(JSON.parse((init as RequestInit).body as string)).toEqual({
        newspaper: { name: "新作" },
      });
    });

    it("updateNewspaper は PATCH", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({}) });
      await updateNewspaper(42, "改名");
      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toContain("/api/admin/newspapers/42");
      expect((init as RequestInit).method).toBe("PATCH");
    });

    it("deleteNewspaper は DELETE", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
      await deleteNewspaper(42);
      const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toContain("/api/admin/newspapers/42");
      expect((init as RequestInit).method).toBe("DELETE");
    });

    it("バリデーションエラー時は body.errors を整形して throw", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ errors: { name: ["has already been taken"] } }),
      });
      await expect(createNewspaper("重複")).rejects.toThrow(/name/);
    });
  });

  describe("Column", () => {
    it("listAdminColumns が一覧を返す", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => [] });
      await listAdminColumns();
      const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe(`${API_BASE_URL}/api/admin/columns`);
    });

    it("createColumn は scrape 設定もボディに含める", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({}) });
      await createColumn({
        newspaper_id: 1,
        name: "テスト",
        scrape_enabled: true,
        scrape_base_url: "https://example.com",
        scrape_replace_rules: { old: "new" },
      });
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse((init as RequestInit).body as string);
      expect(body.column.scrape_enabled).toBe(true);
      expect(body.column.scrape_replace_rules).toEqual({ old: "new" });
    });
  });

  describe("scrapeLatest", () => {
    it("引数なしなら body は {}", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({ results: [], summary: { total: 0, created: 0, updated: 0, failed: 0 } }),
      });
      await scrapeLatest();
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(JSON.parse((init as RequestInit).body as string)).toEqual({});
    });

    it("newspaper 指定すると body に含まれる", async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({ results: [], summary: { total: 0, created: 0, updated: 0, failed: 0 } }),
      });
      await scrapeLatest("毎日新聞");
      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(JSON.parse((init as RequestInit).body as string)).toEqual({ newspaper: "毎日新聞" });
    });
  });
});
