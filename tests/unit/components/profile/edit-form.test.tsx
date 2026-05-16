import { describe, it, expect, vi } from "vitest";

vi.mock("@/actions/profile", () => ({
  updateProfile: vi.fn().mockResolvedValue({}),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { EditForm } from "@/components/profile/edit-form";
import type { ProfileRow } from "@/lib/onboarding/resume";

const defaults: ProfileRow = {
  id: "u1",
  email: "lupita@cobraya.mx",
  rfc: "AAAA010101AAA",
  sector: "Logística",
  anchor_buyers: ["Walmart", "Bimbo"],
  monto_tipico_mxn: 48500,
  mayor_frustracion: "Pago tarda 60 días",
  onboarding_completed: true,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("<EditForm /> — WKH-COBRAYA-DAPP-SHELL W10 (AC-14)", () => {
  it("prefills all PyME fields from defaults", () => {
    render(<EditForm defaults={defaults} />);
    expect(screen.getByLabelText(/^rfc/i)).toHaveValue("AAAA010101AAA");
    expect(screen.getByLabelText(/^sector/i)).toHaveValue("Logística");
    expect(screen.getByLabelText(/compradores ancla/i)).toHaveValue(
      "Walmart, Bimbo",
    );
    expect(screen.getByLabelText(/monto típico/i)).toHaveValue(48500);
    expect(screen.getByLabelText(/mayor frustración/i)).toHaveValue(
      "Pago tarda 60 días",
    );
  });

  it("renders 'Guardar' submit button with primary pill style + min-h-[48px]", () => {
    render(<EditForm defaults={defaults} />);
    const btn = screen.getByRole("button", { name: /guardar/i });
    expect(btn.className).toContain("pill-btn-primary");
    expect(btn.className).toContain("min-h-[48px]");
  });

  it("accepts a null defaults gracefully (new profile path)", () => {
    render(<EditForm defaults={null} />);
    expect(screen.getByLabelText(/^rfc/i)).toHaveValue("");
    expect(screen.getByLabelText(/compradores ancla/i)).toHaveValue("");
  });
});
