import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ProgressDots } from "@/components/onboarding/ProgressDots";

describe("<ProgressDots /> — WKH-COBRAYA-DAPP-SHELL W6 (AC-8)", () => {
  it("renders 5 dots and marks current step via ARIA progressbar", () => {
    const { container } = render(<ProgressDots current={3} total={5} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemin", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(container.querySelectorAll("[data-state]").length).toBe(5);
  });

  it("uses 'current' / 'done' / 'pending' data-states", () => {
    const { container } = render(<ProgressDots current={3} total={5} />);
    const states = Array.from(container.querySelectorAll("[data-state]")).map(
      (el) => el.getAttribute("data-state"),
    );
    expect(states).toEqual(["done", "done", "current", "pending", "pending"]);
  });
});
