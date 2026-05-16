import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signIn, signUp, signOut } from "@/actions/auth";

type SupaStubOpts = {
  signUpError?: { code: string } | null;
  signInError?: { code: string } | null;
};

function buildSupabaseStub(opts: SupaStubOpts = {}) {
  return {
    auth: {
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ error: opts.signInError ?? null }),
      signUp: vi.fn().mockResolvedValue({
        data: { session: { access_token: "t" } },
        error: opts.signUpError ?? null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  };
}

function fd(obj: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signUp — WKH-COBRAYA-DAPP-SHELL W3 (AC-4)", () => {
  it("redirects to /onboarding/step/1 on success and injects DD-O metadata", async () => {
    const stub = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    await expect(
      signUp({}, fd({ email: "a@b.com", password: "abc12345" })),
    ).rejects.toThrow("REDIRECT:/onboarding/step/1");
    expect(redirect).toHaveBeenCalledWith("/onboarding/step/1");
    expect(stub.auth.signUp).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "abc12345",
      options: { data: { app: "cobraya" } },
    });
  });

  it("returns Zod validation error when password fails policy", async () => {
    const stub = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const result = await signUp({}, fd({ email: "a@b.com", password: "weak" }));
    expect(result.error).toContain("al menos 8 caracteres");
    expect(stub.auth.signUp).not.toHaveBeenCalled();
  });

  it("maps user_already_exists to ES-MX copy and logs CD-31-safe", async () => {
    const stub = buildSupabaseStub({
      signUpError: { code: "user_already_exists" },
    });
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await signUp({}, fd({ email: "a@b.com", password: "abc12345" }));
    expect(result.error).toBe("Este correo ya está registrado.");
    expect(warn).toHaveBeenCalledWith("[cobraya-action]", {
      action: "signUp",
      errorCode: "user_already_exists",
    });
    warn.mockRestore();
  });
});

describe("signIn — WKH-COBRAYA-DAPP-SHELL W3", () => {
  it("redirects to /dashboard on success", async () => {
    const stub = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    await expect(
      signIn({}, fd({ email: "a@b.com", password: "x" })),
    ).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("maps invalid_credentials to ES-MX copy", async () => {
    const stub = buildSupabaseStub({ signInError: { code: "invalid_credentials" } });
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await signIn({}, fd({ email: "a@b.com", password: "x" }));
    expect(result.error).toBe("Correo o contraseña incorrectos.");
    warn.mockRestore();
  });
});

describe("signOut — WKH-COBRAYA-DAPP-SHELL W3 (AC-5)", () => {
  it("calls supabase.auth.signOut and redirects /login", async () => {
    const stub = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    await expect(signOut()).rejects.toThrow("REDIRECT:/login");
    expect(stub.auth.signOut).toHaveBeenCalled();
  });
});
