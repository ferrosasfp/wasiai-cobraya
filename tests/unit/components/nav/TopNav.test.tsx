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
});
