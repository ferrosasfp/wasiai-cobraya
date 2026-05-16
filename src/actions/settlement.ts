'use server';
import { createClient } from '@/lib/supabase/server';
import { isValidUuidV4 } from '@/lib/uuid-validator';

export type SettlementInsert = {
  requestId: string;
  uuidCfdi: string;
  amountMxn: number;
  netAmountUsdc: number;
  lenderName: string;
  txHash: `0x${string}`;
  snowtraceUrl?: string;
  blockNumber?: number;
};

export async function recordSettlement(
  input: SettlementInsert,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // CD-33: UUID v4 validation (CRLF / buffer poisoning defense).
  if (!isValidUuidV4(input.requestId)) {
    return { ok: false, error: 'requestId inválido' };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sesión no válida' };

  // R-4 idempotency: ON CONFLICT (request_id) DO NOTHING.
  // DD-O: cobraya_settled_invoices
  const { error } = await supabase.from('cobraya_settled_invoices').upsert(
    {
      user_id: user.id, // CD-32 (RLS enforces this too)
      request_id: input.requestId,
      uuid_cfdi: input.uuidCfdi,
      amount_mxn: input.amountMxn,
      net_amount_usdc: input.netAmountUsdc,
      lender_name: input.lenderName,
      tx_hash: input.txHash,
      snowtrace_url: input.snowtraceUrl ?? null,
      block_number: input.blockNumber ?? null,
    },
    { onConflict: 'request_id', ignoreDuplicates: true },
  );
  if (error) {
    console.warn('[cobraya-action]', {
      action: 'recordSettlement',
      errorCode: error.code,
    });
    return { ok: false, error: 'No se pudo guardar en historial' };
  }
  return { ok: true };
}
