-- WKH-COBRAYA-DAPP-SHELL — cobraya_settled_invoices (append-only history).
-- DD-O: prefix `cobraya_` to coexist with other apps on shared Supabase project.

CREATE TABLE IF NOT EXISTS public.cobraya_settled_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL UNIQUE,
  uuid_cfdi TEXT NOT NULL,
  amount_mxn NUMERIC(12,2) NOT NULL,
  net_amount_usdc NUMERIC(20,6) NOT NULL,
  lender_name TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  snowtrace_url TEXT,
  block_number BIGINT,
  settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cobraya_settled_invoices_user_settled
  ON public.cobraya_settled_invoices (user_id, settled_at DESC);

-- RLS — CD-21 + CD-32
ALTER TABLE public.cobraya_settled_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cobraya users can read own settled invoices"
  ON public.cobraya_settled_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Cobraya users can insert own settled invoices"
  ON public.cobraya_settled_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- No UPDATE / DELETE policies: settled invoices are append-only.
