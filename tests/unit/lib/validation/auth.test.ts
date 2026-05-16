import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validation/auth";

describe("loginSchema — WKH-COBRAYA-DAPP-SHELL W3", () => {
  it("accepts valid email + non-empty password", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "x" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email (ES-MX message)", () => {
    const r = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe("Correo inválido");
    }
  });

  it("rejects empty password (ES-MX message)", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toBe("Ingresa tu contraseña");
    }
  });
});

describe("signupSchema — WKH-COBRAYA-DAPP-SHELL W3", () => {
  it("accepts 8-char password with digit", () => {
    const r = signupSchema.safeParse({ email: "a@b.com", password: "abc12345" });
    expect(r.success).toBe(true);
  });

  it("rejects password < 8 chars", () => {
    const r = signupSchema.safeParse({ email: "a@b.com", password: "abc12" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toContain("al menos 8 caracteres");
    }
  });

  it("rejects password without digit", () => {
    const r = signupSchema.safeParse({ email: "a@b.com", password: "abcdefgh" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toContain("al menos un número");
    }
  });
});
