import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrapeButton } from "./ScrapeButton";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("ScrapeButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("初期は「最新を取得」、有効状態", () => {
    render(<ScrapeButton />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("最新を取得");
    expect(btn).not.toBeDisabled();
  });

  it("クリックすると POST /api/scrapes が発火する", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ newspaper: "X", column: "Y", status: "created" }],
        summary: { total: 1, created: 1, updated: 0, failed: 0 },
      }),
    });

    const user = userEvent.setup();
    render(<ScrapeButton />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("/api/scrapes");
    expect((init as RequestInit).method).toBe("POST");
  });

  it("成功時にサマリ件数を表示", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { newspaper: "A", column: "a", status: "created" },
          { newspaper: "B", column: "b", status: "updated" },
        ],
        summary: { total: 2, created: 1, updated: 1, failed: 0 },
      }),
    });

    const user = userEvent.setup();
    render(<ScrapeButton />);
    await user.click(screen.getByRole("button"));

    expect(await screen.findByText(/成功 2/)).toBeInTheDocument();
    expect(screen.getByText(/新規 1/)).toBeInTheDocument();
    expect(screen.getByText(/更新 1/)).toBeInTheDocument();
  });

  it("API エラー時はエラー文字列を表示", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });

    const user = userEvent.setup();
    render(<ScrapeButton />);
    await user.click(screen.getByRole("button"));

    expect(await screen.findByText(/エラー/)).toBeInTheDocument();
  });
});
