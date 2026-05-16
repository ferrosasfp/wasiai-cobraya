import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DemoFlow } from "@/components/demo/DemoFlow";

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

function setFetchMock(
  responder: (url: string, init: RequestInit | undefined) => Response | Promise<Response>,
): FetchCall[] {
  const calls: FetchCall[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      calls.push({ url, init });
      return Promise.resolve(responder(url, init));
    }),
  );
  return calls;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const TX_HASH = "0xdeadbeefcafef00dba5eba11c0ffee0a1234567890abcdef1234567890abcdef";
const COMMIT_HASH = "0xabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabca";

function happyResponder(url: string): Response {
  if (url.endsWith("/api/demo/run")) {
    return jsonResponse({ ok: true, runId: "11111111-1111-4111-8111-111111111111", remainingHour: 4 });
  }
  if (url.endsWith("/cobraya-cfdi-validator/invoke")) {
    return jsonResponse({
      isCompliant: true,
      anchorBuyerTier: 1,
      policyId: "cobraya-tier-1-food retail-2026",
      duplicateCheckInstance: "clean",
      rfcEmisorMasked: "TLE8***",
      sector: "food retail",
      signedAt: new Date().toISOString(),
      agentSigner: "0x1111111111111111111111111111111111111111",
      receipt: null,
    });
  }
  if (url.endsWith("/cobraya-fraud-detector/invoke")) {
    return jsonResponse({
      isUnique: true,
      commitmentHash: COMMIT_HASH,
      agentSigner: "0x2222222222222222222222222222222222222222",
      receipt: null,
    });
  }
  if (url.endsWith("/cobraya-credit-scorer/invoke")) {
    return jsonResponse({
      score: 720,
      band: "A",
      advanceRatePct: 92,
      aprPct: 14,
      rationale: "Lupita tiene buen track record con Walmart.",
      rationaleProvenance: "local-fallback",
      agentSigner: "0x3333333333333333333333333333333333333333",
      receipt: null,
    });
  }
  if (url.endsWith("/cobraya-lender-matcher/invoke")) {
    return jsonResponse({
      auction: [
        {
          lenderId: "lender-bankaool-a",
          lenderName: "Bankaool Pool A",
          aprPct: 14,
          advanceRatePct: 92,
          estimatedSettleMinutes: 45,
          netAmountUSDC: 0.04,
          rank: 1,
          qualifies: true,
        },
      ],
      recommendedLender: "lender-bankaool-a",
      recommendationReason: "best combined APR + speed",
      agentSigner: "0x4444444444444444444444444444444444444444",
      receipt: null,
    });
  }
  if (url.endsWith("/api/settle")) {
    return jsonResponse({
      receipt: {
        txHash: TX_HASH,
        snowtraceUrl: `https://testnet.snowtrace.io/tx/${TX_HASH}`,
        deliveredAmountUSDC: 0.04,
        blockNumber: 12345,
      },
      settlement: {
        authorization: {
          domain: {
            name: "USD Coin",
            version: "2",
            chainId: 43113,
            verifyingContract: "0x5425890298aed601595a70AB815c96711a31Bc65",
          },
          primaryType: "TransferWithAuthorization",
          message: {},
        },
        signature: "0xSIG",
        txHash: TX_HASH,
        blockNumber: 12345,
        snowtraceUrl: `https://testnet.snowtrace.io/tx/${TX_HASH}`,
        deliveredAmountUSDC: 0.04,
        facilitatorUrl: "https://wasiai-facilitator-production.up.railway.app",
      },
    });
  }
  return jsonResponse({});
}

beforeEach(() => {
  vi.unstubAllGlobals();
  // jsdom does not implement URL.createObjectURL / revokeObjectURL.
  // composeAuditTrail → setTrail → useEffect creates a Blob URL.
  if (typeof URL.createObjectURL !== "function") {
    URL.createObjectURL = vi.fn(() => "blob:mock-audit");
  } else {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-audit");
  }
  if (typeof URL.revokeObjectURL !== "function") {
    URL.revokeObjectURL = vi.fn();
  } else {
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  }
  // jsdom doesn't implement requestAnimationFrame consistently.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("DemoFlow — initial state (AC-DEMO-1)", () => {
  it("shows the 'Iniciar demo en vivo' CTA on first render", () => {
    setFetchMock(happyResponder);
    render(<DemoFlow />);
    expect(
      screen.getByRole("button", { name: /iniciar demo en vivo/i }),
    ).toBeInTheDocument();
  });

  it("shows the pre-seeded Lupita persona summary (Walmart + 48,500)", () => {
    setFetchMock(happyResponder);
    render(<DemoFlow />);
    expect(screen.getByText(/lupita · tortillería la esperanza/i)).toBeInTheDocument();
    expect(screen.getByText(/walmart méxico/i)).toBeInTheDocument();
    expect(screen.getByText(/48,500/)).toBeInTheDocument();
  });
});

describe("DemoFlow — rate limit (AC-DEMO-5)", () => {
  it("renders cooldown copy when /api/demo/run returns 429 cooldown", async () => {
    setFetchMock((url) => {
      if (url.endsWith("/api/demo/run")) {
        return new Response(
          JSON.stringify({ ok: false, reason: "cooldown", retryAfterSec: 42, remainingHour: 4 }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        );
      }
      return jsonResponse({});
    });
    render(<DemoFlow />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar demo en vivo/i }));
    await waitFor(() => {
      expect(screen.getByTestId("demo-rate-limit")).toHaveTextContent(/42s/);
    });
  });

  it("renders quota copy when /api/demo/run returns 429 quota", async () => {
    setFetchMock((url) => {
      if (url.endsWith("/api/demo/run")) {
        return new Response(
          JSON.stringify({ ok: false, reason: "quota", retryAfterSec: 1800, remainingHour: 0 }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        );
      }
      return jsonResponse({});
    });
    render(<DemoFlow />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar demo en vivo/i }));
    await waitFor(() => {
      expect(screen.getByTestId("demo-rate-limit")).toHaveTextContent(/máximo de 5 corridas por hora/i);
    });
  });
});

describe("DemoFlow — end-to-end happy path (AC-DEMO-2, AC-DEMO-3, AC-DEMO-4, AC-DEMO-7)", () => {
  it("runs the full pipeline, settles on-chain, and exposes the reset CTA + audit download", async () => {
    const calls = setFetchMock(happyResponder);
    render(<DemoFlow />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar demo en vivo/i }));

    // Auction lands → auto-selects the recommended lender → Settlement CTA visible.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /firmar y cobrar/i })).toBeInTheDocument(),
      { timeout: 5000 },
    );

    fireEvent.click(screen.getByRole("button", { name: /firmar y cobrar/i }));

    // Final state: reset CTA visible + audit download anchor pointing to blob URL.
    await waitFor(() =>
      expect(screen.getByTestId("demo-reset")).toBeInTheDocument(),
      { timeout: 5000 },
    );
    const downloadLinks = screen
      .getAllByRole("link")
      .filter((a) => (a.getAttribute("download") ?? "").includes("cobraya"));
    expect(downloadLinks.length).toBeGreaterThan(0);
    expect(downloadLinks[0]).toHaveAttribute("href", "blob:mock-audit");

    // AC-DEMO-7: no Server Action or supabase call. We verify by URL — only the
    // 4 agent endpoints, /api/demo/run, and /api/settle should have been hit.
    const urls = calls.map((c) => c.url);
    expect(urls.some((u) => u.includes("supabase") || u.includes("recordSettlement"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/api/demo/run"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/api/settle"))).toBe(true);
  });

  it("AC-DEMO-3: reset CTA clears the settled state and shows the start CTA again", async () => {
    setFetchMock(happyResponder);
    render(<DemoFlow />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar demo en vivo/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /firmar y cobrar/i })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole("button", { name: /firmar y cobrar/i }));
    await waitFor(() => expect(screen.getByTestId("demo-reset")).toBeInTheDocument(), {
      timeout: 5000,
    });

    fireEvent.click(screen.getByTestId("demo-reset"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /iniciar demo en vivo/i })).toBeInTheDocument(),
    );
  });
});

describe("DemoFlow — per-step retry (AC-DEMO-6)", () => {
  it("shows the retry CTA when the validator fails and lets the user retry without restart", async () => {
    let validatorCalls = 0;
    setFetchMock((url) => {
      if (url.endsWith("/api/demo/run")) {
        return jsonResponse({ ok: true, runId: "11111111-1111-4111-8111-111111111111", remainingHour: 4 });
      }
      if (url.endsWith("/cobraya-cfdi-validator/invoke")) {
        validatorCalls += 1;
        if (validatorCalls === 1) {
          return new Response("boom", { status: 500 });
        }
        // Second call succeeds → pipeline keeps going.
        return jsonResponse({
          isCompliant: true,
          anchorBuyerTier: 1,
          policyId: "cobraya-tier-1-food retail-2026",
          duplicateCheckInstance: "clean",
          rfcEmisorMasked: "TLE8***",
          sector: "food retail",
          signedAt: new Date().toISOString(),
          agentSigner: "0x1111111111111111111111111111111111111111",
          receipt: null,
        });
      }
      return happyResponder(url);
    });

    render(<DemoFlow />);
    fireEvent.click(screen.getByRole("button", { name: /iniciar demo en vivo/i }));

    await waitFor(() => expect(screen.getByTestId("demo-retry")).toBeInTheDocument(), {
      timeout: 5000,
    });

    fireEvent.click(screen.getByRole("button", { name: /reintentar paso/i }));

    // After the retry the pipeline should complete → Settlement CTA appears.
    await waitFor(
      () => expect(screen.getByRole("button", { name: /firmar y cobrar/i })).toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(validatorCalls).toBe(2);
  });
});
