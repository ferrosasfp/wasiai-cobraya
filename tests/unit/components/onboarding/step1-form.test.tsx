import { describe, it, expect, vi } from "vitest";

vi.mock("@/actions/profile", () => ({
  saveStep1: vi.fn().mockResolvedValue({}),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Step1Form } from "@/components/onboarding/step1-form";

describe("<Step1Form /> — WKH-COBRAYA-DAPP-SHELL W6", () => {
  it("renders RFC input with maxLength=13 and 'Siguiente' submit", () => {
    render(<Step1Form defaults={null} />);
    const input = screen.getByLabelText(/rfc/i) as HTMLInputElement;
    expect(input.maxLength).toBe(13);
    expect(input.minLength).toBe(12);
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
  });

  it("prefills RFC from defaults", () => {
    render(
      <Step1Form
        defaults={{
          id: "u1",
          email: "a@b.com",
          rfc: "AAAA010101AAA",
          sector: null,
          anchor_buyers: null,
          monto_tipico_mxn: null,
          mayor_frustracion: null,
          onboarding_completed: false,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        }}
      />,
    );
    const input = screen.getByLabelText(/rfc/i) as HTMLInputElement;
    expect(input.value).toBe("AAAA010101AAA");
  });
});
