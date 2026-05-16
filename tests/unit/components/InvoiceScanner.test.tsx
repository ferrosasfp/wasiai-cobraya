// tests/unit/components/InvoiceScanner.test.tsx
// T-INVOICE-SCANNER-1 — initial idle render exposes the scan CTA so the demo
// flow always has a discoverable entry point.
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { InvoiceScanner } from "@/components/InvoiceScanner";

describe("InvoiceScanner", () => {
  it("T-INVOICE-SCANNER-1 renders the idle scan CTA on mount", () => {
    const { container } = render(<InvoiceScanner onConfirm={vi.fn()} />);
    const btn = container.querySelector(
      'button[data-stage="idle"]',
    ) as HTMLButtonElement | null;
    expect(btn).not.toBeNull();
    expect(btn?.textContent ?? "").toContain("Escanear factura");
    // Mobile-first: ≥48px touch target enforced via min-h-[56px] utility.
    expect(btn?.className ?? "").toContain("min-h-[56px]");
    expect(btn?.className ?? "").toContain("w-full");
  });

  it("renders a custom CTA label when provided", () => {
    const { container } = render(
      <InvoiceScanner onConfirm={vi.fn()} ctaLabel="Escanear otra factura" />,
    );
    const btn = container.querySelector('button[data-stage="idle"]');
    expect(btn?.textContent ?? "").toContain("Escanear otra factura");
  });
});
