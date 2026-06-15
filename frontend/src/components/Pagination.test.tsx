import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pagination } from "./Pagination";

// next/link は普通の <a> として扱えれば OK
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Pagination", () => {
  it("total_pages=1 ならリンクを出さず件数だけ表示", () => {
    render(
      <Pagination
        pagination={{ page: 1, per_page: 20, total_count: 5, total_pages: 1 }}
        filters={{}}
      />
    );
    expect(screen.getByText("5 件")).toBeInTheDocument();
    expect(screen.queryByText(/前へ/)).not.toBeInTheDocument();
    expect(screen.queryByText(/次へ/)).not.toBeInTheDocument();
  });

  it("中間ページなら 前へ・次へ 両方がリンク", () => {
    render(
      <Pagination
        pagination={{ page: 2, per_page: 20, total_count: 100, total_pages: 5 }}
        filters={{}}
      />
    );
    const prev = screen.getByText("← 前へ").closest("a");
    const next = screen.getByText("次へ →").closest("a");
    expect(prev).toHaveAttribute("href", "/");
    expect(next).toHaveAttribute("href", "/?page=3");
  });

  it("1ページめは「前へ」が無効、最終ページは「次へ」が無効", () => {
    const { rerender } = render(
      <Pagination
        pagination={{ page: 1, per_page: 20, total_count: 100, total_pages: 5 }}
        filters={{}}
      />
    );
    expect(screen.getByText("← 前へ").closest("a")).toBeNull();
    expect(screen.getByText("次へ →").closest("a")).not.toBeNull();

    rerender(
      <Pagination
        pagination={{ page: 5, per_page: 20, total_count: 100, total_pages: 5 }}
        filters={{}}
      />
    );
    expect(screen.getByText("← 前へ").closest("a")).not.toBeNull();
    expect(screen.getByText("次へ →").closest("a")).toBeNull();
  });

  it("既存フィルタをリンクに引き継ぐ", () => {
    render(
      <Pagination
        pagination={{ page: 2, per_page: 20, total_count: 100, total_pages: 5 }}
        filters={{ newspaper_id: "1", favorited: "true" }}
      />
    );
    const next = screen.getByText("次へ →").closest("a");
    const url = new URL(next!.getAttribute("href")!, "http://localhost");
    expect(url.searchParams.get("newspaper_id")).toBe("1");
    expect(url.searchParams.get("favorited")).toBe("true");
    expect(url.searchParams.get("page")).toBe("3");
  });
});
