// tests/unit/app/marketing/pitch/page.test.tsx — Pitch landing v2 (8 sections)
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PitchPage from "@/app/(marketing)/pitch/page";

describe("PitchPage (v2 — 8 sections)", () => {
  it("renders the hero headline", () => {
    render(<PitchPage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Tu factura, líquida en 30 segundos\./,
      }),
    ).toBeDefined();
  });

  it("renders the 4 agent names", () => {
    render(<PitchPage />);
    expect(screen.getAllByText(/CFDI Validator/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fraud Detector/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Credit Scorer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lender Matcher/).length).toBeGreaterThan(0);
  });

  it("renders the 'Cómo funciona' section with 4 numbered steps", () => {
    render(<PitchPage />);
    expect(
      screen.getByRole("heading", { name: /Cómo funciona, en 4 pasos\./ }),
    ).toBeDefined();
    // Step ordinals 01..04 are rendered as visible markers on each step card.
    expect(screen.getByText("01")).toBeDefined();
    expect(screen.getByText("02")).toBeDefined();
    expect(screen.getByText("03")).toBeDefined();
    expect(screen.getByText("04")).toBeDefined();
  });

  it("renders the comparison table with the 6 known rows", () => {
    render(<PitchPage />);
    // Row labels (left column, mono uppercase).
    expect(screen.getByText("Tiempo")).toBeDefined();
    expect(screen.getByText("Papeleo")).toBeDefined();
    expect(screen.getByText("Quién decide")).toBeDefined();
    expect(screen.getByText("Costo total")).toBeDefined();
    expect(screen.getByText("Transparencia")).toBeDefined();
    expect(screen.getByText("Disponibilidad")).toBeDefined();
  });

  it("renders the stack section with at least 6 technologies", () => {
    render(<PitchPage />);
    expect(
      screen.getByRole("heading", {
        name: /Stack de producción, no de hackathon\./,
      }),
    ).toBeDefined();
    expect(screen.getAllByText(/Avalanche$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/USDC$/).length).toBeGreaterThan(0);
    // "Foundry + OpenZeppelin" appears in both the stack card and the footer
    // stack list, so we assert >= 1 match instead of a single-element get.
    expect(screen.getAllByText(/Foundry \+ OpenZeppelin/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Anthropic Claude/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/wasiai-a2a/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/wasiai-facilitator/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Next\.js 14 \+ PWA/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Supabase/).length).toBeGreaterThan(0);
  });

  it('"Probá Cobraya" CTA points to "/"', () => {
    render(<PitchPage />);
    const cta = screen.getByRole("link", { name: /Probá Cobraya/ });
    expect(cta.getAttribute("href")).toBe("/");
  });

  it("has at least 3 external proof badges (target=_blank + noopener)", () => {
    const { container } = render(<PitchPage />);
    const externalLinks = container.querySelectorAll(
      'a[target="_blank"][rel*="noopener"]',
    );
    expect(externalLinks.length).toBeGreaterThanOrEqual(3);

    // Snowtrace must be present.
    const snowtrace = container.querySelector(
      'a[href^="https://testnet.snowtrace.io/address/"]',
    );
    expect(snowtrace).not.toBeNull();
    expect(snowtrace?.getAttribute("target")).toBe("_blank");
    expect(snowtrace?.getAttribute("rel")).toContain("noopener");

    // A2A GitHub repo must be present.
    const a2aRepo = container.querySelector(
      'a[href="https://github.com/ferrosasfp/wasiai-a2a"]',
    );
    expect(a2aRepo).not.toBeNull();
    expect(a2aRepo?.getAttribute("target")).toBe("_blank");
    expect(a2aRepo?.getAttribute("rel")).toContain("noopener");
  });

  it("renders the manifesto closing line 'Es turno de los agentes.'", () => {
    render(<PitchPage />);
    // The blockquote contains both lines with a <br/> between them, so we use
    // a substring match across the rendered text.
    const block = screen.getByText(/Es turno de los agentes/i);
    expect(block).toBeDefined();
  });
});
