import { describe, it, expect, vi } from "vitest";

const pathMock = vi.fn(() => "/dashboard");
vi.mock("next/navigation", () => ({
  usePathname: () => pathMock(),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TopNav } from "@/components/nav/TopNav";

describe("<TopNav /> — WKH-COBRAYA-DAPP-SHELL W5", () => {
  it("renders the 'Cobraya' wordmark linking to /dashboard", () => {
    pathMock.mockReturnValue("/dashboard");
    render(<TopNav />);
    const link = screen.getByRole("link", { name: /cobraya/i });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("marks active desktop tab with aria-current='page'", () => {
    pathMock.mockReturnValue("/negociar");
    render(<TopNav />);
    expect(
      screen.getByRole("link", { name: /negociar/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  // AR-BLQ-BAJO-1: self-hide on routes where TopNav doesn't belong (DD-D + Story §10).
  it.each([
    ["/", "splash"],
    ["/login", "auth login"],
    ["/signup", "auth signup"],
    ["/onboarding/step/1", "onboarding step 1"],
    ["/onboarding/step/5", "onboarding step 5"],
    ["/~offline", "offline"],
  ])("hides TopNav on %s (%s)", (path) => {
    pathMock.mockReturnValue(path);
    const { container } = render(<TopNav />);
    expect(container.firstChild).toBeNull();
  });

  it("renders TopNav on app routes (/dashboard, /historial, /perfil)", () => {
    for (const path of ["/dashboard", "/historial", "/perfil", "/negociar"]) {
      pathMock.mockReturnValue(path);
      const { container, unmount } = render(<TopNav />);
      expect(container.firstChild).not.toBeNull();
      unmount();
    }
  });
});
