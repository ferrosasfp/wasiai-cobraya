// tests/unit/components/InvoicePicker.test.tsx
// `InvoicePicker` is now a thin re-export of `InvoiceScanner`. This test only
// guards the back-compat alias so any downstream consumer importing
// `InvoicePicker` still finds a renderable component.
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { InvoicePicker } from "@/components/InvoicePicker";

describe("InvoicePicker (compat alias)", () => {
  it("renders the idle scan CTA via the InvoiceScanner re-export", () => {
    const { container } = render(<InvoicePicker onConfirm={vi.fn()} />);
    const button = container.querySelector('button[data-stage="idle"]');
    expect(button).not.toBeNull();
    expect(button?.textContent ?? "").toContain("Escanear factura");
  });
});
