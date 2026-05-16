// WKH-COBRAYA-DAPP-SHELL — onboarding resume / firstIncompleteStep.
// DD-O: schema mirrors public.cobraya_profiles.

export type ProfileRow = {
  id: string;
  email: string | null;
  rfc: string | null;
  sector: string | null;
  anchor_buyers: string[] | null;
  monto_tipico_mxn: number | null;
  mayor_frustracion: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export function firstIncompleteStep(p: ProfileRow): 1 | 2 | 3 | 4 | 5 {
  if (!p.rfc) return 1;
  if (!p.sector) return 2;
  if (!p.anchor_buyers || p.anchor_buyers.length === 0) return 3;
  if (p.monto_tipico_mxn == null) return 4;
  return 5;
}
