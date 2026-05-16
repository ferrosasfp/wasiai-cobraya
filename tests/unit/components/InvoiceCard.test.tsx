// tests/unit/components/InvoiceCard.test.tsx
// T-INVOICE-CARD-1 — state morph from pending → negotiating → sold renders
// the expected data-state and content blocks (badge label, lender + USDC,
// Snowtrace tx, audit download).
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { InvoiceCard } from "@/components/InvoiceCard";
import type { ScannedInvoicePayload } from "@/app/api/scan-invoice/route";

const INVOICE: ScannedInvoicePayload = {
  uuidCfdi: "11111111-1111-4111-8111-111111111111",
  rfcEmisor: "TLE850315ABC",
  anchorBuyer: "Walmart México",
  amountMXN: 48500,
  paymentTermsDays: 60,
  sector: "food retail",
  personaName: "Tortillería La Esperanza",
  issueDate: "2026-05-15",
  dueDate: "2026-07-14",
};

describe("InvoiceCard", () => {
  it("T-INVOICE-CARD-1 morphs pending → negotiating → sold", () => {
    // pending
    const pending = render(<InvoiceCard invoice={INVOICE} state="pending" />);
    const pendingArticle = pending.container.querySelector(
      'article[data-state="pending"]',
    );
    expect(pendingArticle).not.toBeNull();
    expect(pendingArticle?.textContent ?? "").toContain("Pendiente");
    expect(pendingArticle?.textContent ?? "").toContain("Tortillería La Esperanza");
    expect(pendingArticle?.textContent ?? "").toContain("48,500");
    pending.unmount();

    // negotiating
    const negotiating = render(
      <InvoiceCard invoice={INVOICE} state="negotiating" />,
    );
    const negotiatingArticle = negotiating.container.querySelector(
      'article[data-state="negotiating"]',
    );
    expect(negotiatingArticle).not.toBeNull();
    expect(negotiatingArticle?.textContent ?? "").toContain("Negociando");
    expect(negotiatingArticle?.textContent ?? "").toContain("Pipeline en curso");
    negotiating.unmount();

    // sold — uses real tx hash + audit trail link.
    const sold = render(
      <InvoiceCard
        invoice={INVOICE}
        state="sold"
        sold={{
          lenderName: "Bankaool Pool A",
          netAmountUSDC: 2.4500,
          txHash: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
          snowtraceUrl:
            "https://testnet.snowtrace.io/tx/0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
          requestId: "abcdef12-3456-4789-89ab-cdef12345678",
        }}
      />,
    );
    const soldArticle = sold.container.querySelector(
      'article[data-state="sold"]',
    );
    expect(soldArticle).not.toBeNull();
    expect(soldArticle?.textContent ?? "").toContain("Vendida");
    expect(soldArticle?.textContent ?? "").toContain("Bankaool Pool A");
    expect(soldArticle?.textContent ?? "").toContain("2.4500");
    const link = sold.container.querySelector(
      'a[href*="snowtrace.io"]',
    ) as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.href ?? "").toContain("0xabcdef");
    const auditLink = sold.container.querySelector(
      'a[href="/api/audit-trail/abcdef12-3456-4789-89ab-cdef12345678"]',
    );
    expect(auditLink).not.toBeNull();
    sold.unmount();
  });

  it("renders failed state with retry button when handler provided", () => {
    const onScanAnother = vi.fn();
    const { container } = render(
      <InvoiceCard
        invoice={INVOICE}
        state="failed"
        errorMessage="Pipeline reventó"
        onScanAnother={onScanAnother}
      />,
    );
    const article = container.querySelector('article[data-state="failed"]');
    expect(article).not.toBeNull();
    expect(article?.textContent ?? "").toContain("Falló");
    expect(article?.textContent ?? "").toContain("Pipeline reventó");
    const retry = container.querySelector("button");
    expect(retry).not.toBeNull();
    expect(retry?.textContent ?? "").toContain("Escanear otra");
  });
});
