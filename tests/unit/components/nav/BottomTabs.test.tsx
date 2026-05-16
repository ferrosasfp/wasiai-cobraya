import { describe, it, expect, vi } from "vitest";

const pathMock = vi.fn(() => "/dashboard");
vi.mock("next/navigation", () => ({
  usePathname: () => pathMock(),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BottomTabs } from "@/components/nav/BottomTabs";

describe("<BottomTabs /> — WKH-COBRAYA-DAPP-SHELL W5 (AC-15)", () => {
  it("renders 4 tabs with active state on /dashboard", () => {
    pathMock.mockReturnValue("/dashboard");
    const { container } = render(<BottomTabs />);
    expect(container.querySelector("nav")).not.toBeNull();
    expect(screen.getByRole("link", { name: /inicio/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    ["Negociar", "Historial", "Perfil"].forEach((label) => {
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });
      expect(link).not.toHaveAttribute("aria-current");
    });
  });

  it("CD-23 touch targets: 3 regular tabs have min-h-[48px], FAB has w-14/h-14 (56px)", () => {
    // After the FAB-central rewrite, "Negociar" became a raised circle FAB
    // (Cash App / Mercado Pago pattern). The FAB's hit area is the inner
    // 56×56 disc (w-14 h-14), not min-h-[48px] on the <Link> wrapper. We
    // assert the three regular tabs keep the 48px floor and the FAB keeps a
    // ≥48px disc — both satisfy CD-23.
    pathMock.mockReturnValue("/dashboard");
    render(<BottomTabs />);
    ["Inicio", "Historial", "Perfil"].forEach((label) => {
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });
      expect(link.className).toContain("min-h-[48px]");
    });
    const fab = screen.getByRole("link", { name: /negociar.*acci[oó]n principal/i });
    // FAB's button-shaped child carries the size class; ensure it exists.
    const disc = fab.querySelector("div");
    expect(disc).not.toBeNull();
    expect(disc!.className).toContain("w-14");
    expect(disc!.className).toContain("h-14");
  });

  it("self-hides on /", () => {
    pathMock.mockReturnValue("/");
    const { container } = render(<BottomTabs />);
    expect(container.firstChild).toBeNull();
  });

  it("self-hides on /login", () => {
    pathMock.mockReturnValue("/login");
    const { container } = render(<BottomTabs />);
    expect(container.firstChild).toBeNull();
  });

  it("self-hides on /onboarding/step/1", () => {
    pathMock.mockReturnValue("/onboarding/step/1");
    const { container } = render(<BottomTabs />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the nav fixed at the bottom with z-40 (mobile floating chrome)", () => {
    // jsdom strips env(safe-area-inset-bottom) from inline styles. We assert
    // the structural classes that pair with it; the actual safe-area padding
    // is verified in the manual W12 smoke (CD-23).
    pathMock.mockReturnValue("/dashboard");
    const { container } = render(<BottomTabs />);
    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav.className).toContain("fixed");
    expect(nav.className).toContain("bottom-0");
    expect(nav.className).toContain("z-40");
  });

  it("is hidden on md+ screens via md:hidden class", () => {
    pathMock.mockReturnValue("/dashboard");
    const { container } = render(<BottomTabs />);
    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav.className).toContain("md:hidden");
  });
});
