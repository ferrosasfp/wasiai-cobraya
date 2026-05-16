import { describe, it, expect } from "vitest";
import { buildDemoInvoice, DEMO_PERSONA_META } from "@/lib/demo/seed-invoice";

describe("buildDemoInvoice — pre-seeded /demo factura", () => {
  it("uses the canonical Lupita persona + Walmart + $48,500 / 60d", () => {
    const inv = buildDemoInvoice();
    expect(inv.personaName).toBe("Lupita · Tortillería La Esperanza");
    expect(inv.anchorBuyer).toBe("Walmart México");
    expect(inv.amountMXN).toBe(48500);
    expect(inv.paymentTermsDays).toBe(60);
    expect(inv.sector).toBe("food retail");
    expect(inv.rfcEmisor).toBe(DEMO_PERSONA_META.rfcEmisor);
  });

  it("emits a fresh UUID v4-shaped uuidCfdi on each call (anti-fraud-collision)", () => {
    const a = buildDemoInvoice();
    const b = buildDemoInvoice();
    expect(a.uuidCfdi).not.toBe(b.uuidCfdi);
    expect(a.uuidCfdi).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("issueDate is today and dueDate is paymentTermsDays in the future", () => {
    const inv = buildDemoInvoice();
    const issue = new Date(inv.issueDate);
    const due = new Date(inv.dueDate);
    const diffDays = Math.round(
      (due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBe(inv.paymentTermsDays);
  });
});
