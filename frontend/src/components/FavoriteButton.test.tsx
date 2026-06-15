import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoriteButton } from "./FavoriteButton";

// next/navigation の useRouter をモック (useRouter は jsdom 環境では空っぽ)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("initial=false なら ☆ が描画される", () => {
    render(<FavoriteButton entryId={1} initial={false} />);
    expect(screen.getByRole("button")).toHaveTextContent("☆");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("initial=true なら ★ が描画される", () => {
    render(<FavoriteButton entryId={1} initial={true} />);
    expect(screen.getByRole("button")).toHaveTextContent("★");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("クリックで楽観的に ☆ → ★ に切り替わる、API は POST", async () => {
    const user = userEvent.setup();
    render(<FavoriteButton entryId={42} initial={false} />);
    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("★");
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((init as RequestInit).method).toBe("POST");
  });

  it("API が失敗したら ★ → ☆ に巻き戻る", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<FavoriteButton entryId={1} initial={false} />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("☆");
    });
    consoleErrorSpy.mockRestore();
  });
});
