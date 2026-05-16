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

  it("each tab has min-h-[48px] (CD-23 touch target)", () => {
    pathMock.mockReturnValue("/dashboard");
    render(<BottomTabs />);
    ["Inicio", "Negociar", "Historial", "Perfil"].forEach((label) => {
      const link = screen.getByRole("link", { name: new RegExp(label, "i") });
      expect(link.className).toContain("min-h-[48px]");
    });
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
