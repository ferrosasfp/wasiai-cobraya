import { describe, it, expect, vi } from "vitest";

// next/link → plain anchor (vitest can't resolve next/link's transitive deps
// in this jsdom env without the runtime). Mirrors what the negociar/pitch
// tests do implicitly via vi.stubGlobal("fetch", ...).
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DemoPage from "@/app/demo/page";

describe("DemoPage — public live demo", () => {
  it("AC-DEMO-1: renders the public-demo banner", () => {
    render(<DemoPage />);
    expect(
      screen.getByText(/demo público · datos sintéticos · tx real en avalanche fuji/i),
    ).toBeInTheDocument();
  });

  it("AC-DEMO-1: renders the initial CTA 'Iniciar demo en vivo'", () => {
    render(<DemoPage />);
    expect(
      screen.getByRole("button", { name: /iniciar demo en vivo/i }),
    ).toBeInTheDocument();
  });

  it("renders the 'Volver al pitch' link pointing to /pitch", () => {
    render(<DemoPage />);
    const link = screen.getByRole("link", { name: /volver al pitch/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/pitch");
  });

  it("renders the pre-seeded Lupita persona summary (Walmart + 48,500)", () => {
    render(<DemoPage />);
    expect(
      screen.getByText(/lupita · tortillería la esperanza/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/walmart méxico/i)).toBeInTheDocument();
    expect(screen.getByText(/48,500/)).toBeInTheDocument();
  });
});
