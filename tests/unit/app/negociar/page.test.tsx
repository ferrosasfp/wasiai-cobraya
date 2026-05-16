import { describe, it, expect, vi } from "vitest";

// Engine fetches are unchanged; we never exercise them in this smoke test.
// Stub global fetch defensively in case any auto-mounted effect tries it.
vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import NegociarPage from "@/app/(app)/negociar/page";

describe("NegociarPage — WKH-COBRAYA-DAPP-SHELL W8 (AC-10)", () => {
  it("renders the scan section header 'Escaneá tu factura'", () => {
    render(<NegociarPage />);
    expect(
      screen.getByRole("heading", { name: /escaneá tu factura/i }),
    ).toBeInTheDocument();
  });

  it("uses the burgundy palette: outer chrome includes 'Avalanche Fuji' badge in luma-450", () => {
    const { container } = render(<NegociarPage />);
    const badge = Array.from(
      container.querySelectorAll("span"),
    ).find((s) => /avalanche fuji/i.test(s.textContent ?? ""));
    expect(badge).toBeDefined();
    expect(badge?.className).toContain("text-luma-450");
  });
});
