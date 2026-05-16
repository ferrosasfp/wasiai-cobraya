import { describe, it, expect, vi } from "vitest";

vi.mock("@/actions/auth", () => ({
  signUp: vi.fn().mockResolvedValue({}),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SignupForm } from "@/components/auth/signup-form";

describe("<SignupForm /> — WKH-COBRAYA-DAPP-SHELL W3", () => {
  it("renders password hint (ES-MX) and submit CTA", () => {
    render(<SignupForm />);
    expect(screen.getByText(/mínimo 8 caracteres con al menos un número/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it("password input has minlength=8 (HTML hint) + new-password autocomplete", () => {
    const { container } = render(<SignupForm />);
    const pwd = container.querySelector("input[name='password']") as HTMLInputElement;
    expect(pwd.getAttribute("minlength")).toBe("8");
    expect(pwd.getAttribute("autocomplete")).toBe("new-password");
  });
});
