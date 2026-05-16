import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() — class name helper (WKH-COBRAYA-DAPP-SHELL W1)", () => {
  it("concatenates strings ignoring falsy entries", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
    expect(cn("a", null, undefined, "b")).toBe("a b");
  });

  it("resolves Tailwind conflicts (twMerge)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-luma-700", "text-luma-50")).toBe("text-luma-50");
  });

  it("accepts arrays / objects (clsx semantics)", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });
});
