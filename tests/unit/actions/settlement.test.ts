import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { recordSettlement } from "@/actions/settlement";

type Captured = {
  table?: string;
  upsertArgs?: [Record<string, unknown>, { onConflict?: string; ignoreDuplicates?: boolean }];
};

function buildSupabaseStub(opts: {
  user?: { id: string } | null;
  upsertError?: { code: string } | null;
} = {}) {
  const captured: Captured = {};
  const stub = {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: opts.user === undefined ? { id: "u1" } : opts.user } }),
    },
    from: vi.fn((table: string) => {
      captured.table = table;
      return {
        upsert(
          payload: Record<string, unknown>,
          options: { onConflict?: string; ignoreDuplicates?: boolean },
        ) {
          captured.upsertArgs = [payload, options];
          return Promise.resolve({ error: opts.upsertError ?? null });
        },
      };
    }),
  };
  return { stub, captured };
}

const VALID_UUID = "abcdef12-3456-4789-89ab-cdef12345678";

const baseInput = {
  requestId: VALID_UUID,
  uuidCfdi: "CFDI-001",
  amountMxn: 48500,
  netAmountUsdc: 2274.96,
  lenderName: "Banamex SmartFactor",
  txHash: "0x1234567890abcdef1234567890abcdef12345678" as `0x${string}`,
  snowtraceUrl: "https://testnet.snowtrace.io/tx/0xabc",
  blockNumber: 99,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("recordSettlement — WKH-COBRAYA-DAPP-SHELL W9 (AC-11)", () => {
  it("rejects CRLF-poisoned requestId (CD-33 uuid v4 strict)", async () => {
    const { stub } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const res = await recordSettlement({
      ...baseInput,
      requestId: "abcdef12-3456-4789-89ab-cdef12345678\r\nSet-Cookie:bad",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("requestId");
    expect(stub.from).not.toHaveBeenCalled();
  });

  it("returns ok:false when no authenticated user", async () => {
    const { stub } = buildSupabaseStub({ user: null });
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const res = await recordSettlement(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("Sesión");
  });

  it("upserts on cobraya_settled_invoices with user_id + onConflict request_id (R-4, DD-O, CD-32)", async () => {
    const { stub, captured } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const res = await recordSettlement(baseInput);
    expect(res).toEqual({ ok: true });
    expect(captured.table).toBe("cobraya_settled_invoices");
    const [payload, options] = captured.upsertArgs!;
    expect(payload).toMatchObject({
      user_id: "u1",
      request_id: VALID_UUID,
      uuid_cfdi: "CFDI-001",
      lender_name: "Banamex SmartFactor",
      tx_hash: baseInput.txHash,
      snowtrace_url: baseInput.snowtraceUrl,
      block_number: 99,
    });
    expect(options.onConflict).toBe("request_id");
    expect(options.ignoreDuplicates).toBe(true);
  });

  it("logs CD-31-safe console.warn on Supabase error and surfaces ES-MX error", async () => {
    const { stub } = buildSupabaseStub({ upsertError: { code: "23505" } });
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await recordSettlement(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("historial");
    expect(warn).toHaveBeenCalledWith("[cobraya-action]", {
      action: "recordSettlement",
      errorCode: "23505",
    });
    warn.mockRestore();
  });

  it("substitutes null for missing snowtraceUrl/blockNumber", async () => {
    const { stub, captured } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const { snowtraceUrl: _u, blockNumber: _b, ...minimal } = baseInput;
    void _u;
    void _b;
    await recordSettlement(minimal);
    const [payload] = captured.upsertArgs!;
    expect(payload.snowtrace_url).toBeNull();
    expect(payload.block_number).toBeNull();
  });
});
