import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

import { createClient } from "@/lib/supabase/server";
import OnboardingStepPage from "@/app/(app)/onboarding/step/[step]/page";

function profileStub(profile: unknown) {
  return {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "u1", email: "a@b.com" } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("OnboardingStepPage — WKH-COBRAYA-DAPP-SHELL W6 (AC-7 anti-bypass)", () => {
  it("redirects to /onboarding/step/2 when user is on step 4 but firstIncomplete=2", async () => {
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      profileStub({
        id: "u1",
        email: "a@b.com",
        rfc: "AAAA010101AAA",
        sector: null,
        anchor_buyers: null,
        monto_tipico_mxn: null,
        mayor_frustracion: null,
        onboarding_completed: false,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      }),
    );
    await expect(
      OnboardingStepPage({ params: { step: "4" } }),
    ).rejects.toThrow("REDIRECT:/onboarding/step/2");
  });

  it("redirects to /dashboard if onboarding_completed=true", async () => {
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      profileStub({
        id: "u1",
        email: "a@b.com",
        rfc: "AAAA010101AAA",
        sector: "X",
        anchor_buyers: ["Y"],
        monto_tipico_mxn: 100,
        mayor_frustracion: "Z",
        onboarding_completed: true,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      }),
    );
    await expect(
      OnboardingStepPage({ params: { step: "3" } }),
    ).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("notFound() when step is not in 1..5", async () => {
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      profileStub(null),
    );
    await expect(
      OnboardingStepPage({ params: { step: "99" } }),
    ).rejects.toThrow("NOT_FOUND");
  });
});
