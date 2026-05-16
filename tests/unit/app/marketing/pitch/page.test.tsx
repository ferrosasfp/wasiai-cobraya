// tests/unit/app/marketing/pitch/page.test.tsx — Pitch landing v3 (2026-05-16)
//
// 10 tests covering the 11-section design adapted from
// doc/_design-source-cobraya-pitch.html.
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PitchPage from "@/app/(marketing)/pitch/page";

describe("PitchPage (v3 — design-source aligned)", () => {
  it("renders the hero headline 'Tu factura'", () => {
    render(<PitchPage />);
    // The H1 is broken across three lines, so we match the first chunk.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeDefined();
    expect(h1.textContent).toContain("Tu factura,");
    expect(h1.textContent).toContain("líquida en");
    expect(h1.textContent).toContain("30 segundos.");
  });

  it("renders the nav with the 5 anchor links", () => {
    const { container } = render(<PitchPage />);
    const anchors = ["#problema", "#flujo", "#agentes", "#comparativa", "#prueba"];
    for (const href of anchors) {
      const link = container.querySelector(`nav.nav-links a[href="${href}"]`);
      expect(link, `expected nav link to ${href}`).not.toBeNull();
    }
  });

  it("renders the 4 agent names in the agents grid", () => {
    render(<PitchPage />);
    expect(screen.getAllByText(/CFDI Validator/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fraud Detector/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Credit Scorer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lender Matcher/).length).toBeGreaterThan(0);
  });

  it("renders the 'Cómo funciona' pipeline with 4 numbered phases", () => {
    render(<PitchPage />);
    expect(screen.getByText(/01 · Subir/)).toBeDefined();
    expect(screen.getByText(/02 · Procesar/)).toBeDefined();
    expect(screen.getByText(/03 · Subastar/)).toBeDefined();
    expect(screen.getByText(/04 · Recibir/)).toBeDefined();
  });

  it("renders the comparison table with all 6 attribute rows", () => {
    render(<PitchPage />);
    expect(screen.getByText("Tiempo")).toBeDefined();
    expect(screen.getByText("Papeleo")).toBeDefined();
    expect(screen.getByText("Quién decide")).toBeDefined();
    expect(screen.getByText("Costo total")).toBeDefined();
    expect(screen.getByText("Transparencia")).toBeDefined();
    expect(screen.getByText("Disponibilidad")).toBeDefined();
  });

  it("renders the stack grid with at least 9 cards", () => {
    const { container } = render(<PitchPage />);
    const cards = container.querySelectorAll(".stack-grid .scard");
    expect(cards.length).toBeGreaterThanOrEqual(9);
  });

  it("'Probar Cobraya' final CTA points to '/'", () => {
    render(<PitchPage />);
    const cta = screen.getByRole("link", { name: /Probar Cobraya/ });
    expect(cta.getAttribute("href")).toBe("/");
  });

  it("has at least 3 ProofBadge links with target=_blank + noopener", () => {
    const { container } = render(<PitchPage />);
    // Proof cards specifically — narrow to the .proof-grid scope.
    const externalProofs = container.querySelectorAll(
      '.proof-grid a.proof-card[target="_blank"][rel*="noopener"]',
    );
    expect(externalProofs.length).toBeGreaterThanOrEqual(3);

    // Snowtrace must be one of them.
    const snowtrace = container.querySelector(
      '.proof-grid a[href^="https://testnet.snowtrace.io/address/"]',
    );
    expect(snowtrace).not.toBeNull();
    expect(snowtrace?.getAttribute("target")).toBe("_blank");
    expect(snowtrace?.getAttribute("rel")).toContain("noopener");

    // A2A GitHub repo must be one of them too.
    const a2a = container.querySelector(
      '.proof-grid a[href="https://github.com/ferrosasfp/wasiai-a2a"]',
    );
    expect(a2a).not.toBeNull();
    expect(a2a?.getAttribute("target")).toBe("_blank");
    expect(a2a?.getAttribute("rel")).toContain("noopener");
  });

  it("renders the quote 'Es turno de los agentes'", () => {
    render(<PitchPage />);
    const block = screen.getByText(/Es turno de los/i);
    expect(block).toBeDefined();
    expect(block.textContent).toContain("agentes");
  });

  it("renders the Cobraya logo SVG inside the nav brand-mark", () => {
    const { container } = render(<PitchPage />);
    // The nav <a.brand> wraps a .brand-mark span which should now contain
    // a real Cobraya SVG (role=img + aria-label="Cobraya"), not the letter "C".
    const navBrandMark = container.querySelector(
      'header.nav a.brand .brand-mark svg[aria-label="Cobraya"]',
    );
    expect(navBrandMark, "expected Cobraya logo SVG in nav brand-mark").not.toBeNull();
    expect(navBrandMark?.getAttribute("role")).toBe("img");
  });

  it("renders at least 4 distinct brand logos in the stack-grid .ico slots", () => {
    const { container } = render(<PitchPage />);
    // Each scard now has an inline <svg> inside .ico. Collect the aria-labels
    // and verify diversity — at least 4 different brand marks are present.
    const icoSvgs = container.querySelectorAll(".stack-grid .scard .ico svg[aria-label]");
    expect(icoSvgs.length).toBeGreaterThanOrEqual(4);
    const labels = new Set<string>();
    icoSvgs.forEach((el) => {
      const label = el.getAttribute("aria-label");
      if (label) labels.add(label);
    });
    expect(labels.size).toBeGreaterThanOrEqual(4);
  });

  it("footer has 4 columns (brand + producto + stack + hackathon)", () => {
    const { container } = render(<PitchPage />);
    const footGrid = container.querySelector("footer.footer .foot-grid");
    expect(footGrid).not.toBeNull();
    // The grid has 4 direct child <div>s — the brand block + 3 link columns.
    const cols = footGrid?.querySelectorAll(":scope > div");
    expect(cols?.length).toBe(4);

    // Headings inside columns 2..4
    expect(screen.getByText("Producto")).toBeDefined();
    expect(screen.getByText("Stack")).toBeDefined();
    expect(screen.getByText("Hackathon")).toBeDefined();
  });
});
