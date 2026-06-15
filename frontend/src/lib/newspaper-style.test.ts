import { describe, it, expect } from "vitest";
import { newspaperStyle } from "./newspaper-style";

describe("newspaperStyle", () => {
  it("既知の新聞は固有のアクセント色を返す", () => {
    expect(newspaperStyle("朝日新聞").accent).toBe("border-l-rose-400");
    expect(newspaperStyle("毎日新聞").accent).toBe("border-l-slate-400");
    expect(newspaperStyle("東京新聞").accent).toBe("border-l-emerald-500");
  });

  it("地方紙にも色が割り当てられる", () => {
    expect(newspaperStyle("東奥日報").accent).toContain("sky");
    expect(newspaperStyle("琉球新報").accent).toContain("rose");
  });

  it("未知の新聞は fallback (stone) を返す", () => {
    const s = newspaperStyle("存在しない新聞");
    expect(s.accent).toBe("border-l-stone-400");
    expect(s.chipBg).toContain("stone");
  });
});
