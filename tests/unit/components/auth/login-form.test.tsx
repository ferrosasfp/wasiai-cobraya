import { describe, it, expect, vi } from "vitest";

vi.mock("@/actions/auth", () => ({
  signIn: vi.fn().mockResolvedValue({}),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LoginForm } from "@/components/auth/login-form";

describe("<LoginForm /> — WKH-COBRAYA-DAPP-SHELL W3", () => {
  it("renders email + password inputs and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByText("Correo")).toBeInTheDocument();
    expect(screen.getByText("Contraseña")).toBeInTheDocument();
  });

  it("inputs declare autoComplete + min-h-[48px] touch target (CD-23)", () => {
    const { container } = render(<LoginForm />);
    const email = container.querySelector("input[name='email']") as HTMLInputElement;
    const pwd = container.querySelector("input[name='password']") as HTMLInputElement;
    expect(email.getAttribute("autocomplete")).toBe("email");
    expect(pwd.getAttribute("autocomplete")).toBe("current-password");
    expect(email.className).toContain("min-h-[48px]");
    expect(pwd.className).toContain("min-h-[48px]");
  });
});
