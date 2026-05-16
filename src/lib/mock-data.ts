import type { Invoice, Lender } from "@/types/invoice";

export interface BuyerTier1 {
  name: string;             // "Walmart México"
  rfc: string;              // "WAL9709244WS"
  sector: string;           // "food retail"
  sectorAdjustment: number; // delta para scoring
}

export interface LenderEntry {
  id: string;
  name: string;             // "Bankaool Pool A"
  bandAllowlist: Array<"A" | "B" | "C" | "D">;
  sectorAllowlist: "all" | string[];
  minAmountMXN: number;
  maxAmountMXN: number;
  aprPct: number;
  advanceRatePct: number;
  speedMinutes: number;
}

export const BUYERS_TIER_1: BuyerTier1[] = [
  { name: "Walmart México", rfc: "WAL9709244WS", sector: "food retail", sectorAdjustment: 5 },
  { name: "Bimbo", rfc: "BIM450316L92", sector: "apparel", sectorAdjustment: 3 },
  { name: "Cemex", rfc: "CEM880101HNB", sector: "construction", sectorAdjustment: -8 },
  { name: "OXXO", rfc: "OXX901016JA1", sector: "retail", sectorAdjustment: 0 },
  // Extended pool — sectorAdjustment based on payment reliability heuristic (anchor buyer tier-1).
  { name: "Soriana", rfc: "SOR810911P49", sector: "food retail", sectorAdjustment: 4 },
  { name: "Coppel", rfc: "COP690513TQ7", sector: "apparel", sectorAdjustment: 2 },
  { name: "Liverpool", rfc: "LIV930721EE0", sector: "apparel", sectorAdjustment: 3 },
  { name: "Holcim", rfc: "HOL850622HX3", sector: "construction", sectorAdjustment: -6 },
  { name: "Home Depot", rfc: "HDM010101AAA", sector: "construction", sectorAdjustment: 1 },
  { name: "PEMEX", rfc: "PEP970716XYZ", sector: "services", sectorAdjustment: -2 },
  { name: "Costco", rfc: "COS911022PD4", sector: "retail", sectorAdjustment: 4 },
  { name: "Sears", rfc: "SEA710204LM8", sector: "apparel", sectorAdjustment: 1 },
  { name: "La Comer", rfc: "LCO150825CC9", sector: "food retail", sectorAdjustment: 2 },
];

export const LENDERS_CATALOG: LenderEntry[] = [
  { id: "lender-bankaool-a", name: "Bankaool Pool A", bandAllowlist: ["A", "B"], sectorAllowlist: "all", minAmountMXN: 10000, maxAmountMXN: 500000, aprPct: 14.0, advanceRatePct: 92, speedMinutes: 45 },
  { id: "lender-arkangeles-i", name: "Arkangeles Fund I", bandAllowlist: ["A", "B", "C"], sectorAllowlist: ["food retail", "apparel", "retail", "services"], minAmountMXN: 5000, maxAmountMXN: 300000, aprPct: 13.0, advanceRatePct: 90, speedMinutes: 30 },
  { id: "lender-bbva-bridge", name: "BBVA SME Bridge", bandAllowlist: ["A"], sectorAllowlist: "all", minAmountMXN: 50000, maxAmountMXN: 2000000, aprPct: 12.5, advanceRatePct: 95, speedMinutes: 60 },
  { id: "lender-konfio", name: "Konfío Express", bandAllowlist: ["B", "C", "D"], sectorAllowlist: "all", minAmountMXN: 1000, maxAmountMXN: 200000, aprPct: 22.0, advanceRatePct: 85, speedMinutes: 15 },
];

// ──────────────────────────────────────────────────────────────────────────────
// Dynamic invoice generation pool (replaces hardcoded MOCK_INVOICES).
// Each persona ships with its semantically-coherent buyer pool so we never
// pair a tortillería with Liverpool.
// ──────────────────────────────────────────────────────────────────────────────

export type InvoiceSector =
  | "food retail"
  | "apparel"
  | "construction"
  | "services"
  | "retail";

export interface PersonaTemplate {
  rfcEmisor: string;
  personaName: string;       // "Lupita · Tortillería La Esperanza"
  businessName: string;      // "Tortillería La Esperanza" (used as issuer.name)
  defaultSector: InvoiceSector;
  defaultBuyerPool: string[]; // matches BUYERS_TIER_1[].name entries
}

export const MOCK_PERSONAS: PersonaTemplate[] = [
  {
    rfcEmisor: "TLE850315ABC",
    personaName: "Lupita · Tortillería La Esperanza",
    businessName: "Tortillería La Esperanza",
    defaultSector: "food retail",
    defaultBuyerPool: ["Walmart México", "OXXO", "Soriana"],
  },
  {
    rfcEmisor: "CNA920514XYZ",
    personaName: "Carmen · Confecciones Nayeli",
    businessName: "Confecciones Nayeli",
    defaultSector: "apparel",
    defaultBuyerPool: ["Bimbo", "Coppel", "Liverpool"],
  },
  {
    rfcEmisor: "CHR770822QRS",
    personaName: "Roberto · Construcciones Hermanos Ruiz",
    businessName: "Construcciones Hermanos Ruiz",
    defaultSector: "construction",
    defaultBuyerPool: ["Cemex", "Holcim"],
  },
  {
    rfcEmisor: "MPC880520DEF",
    personaName: "María · Panadería del Centro",
    businessName: "Panadería del Centro",
    defaultSector: "food retail",
    defaultBuyerPool: ["Walmart México", "Bimbo"],
  },
  {
    rfcEmisor: "JCR760412GHI",
    personaName: "Juan · Carpintería La Roble",
    businessName: "Carpintería La Roble",
    defaultSector: "construction",
    defaultBuyerPool: ["Home Depot", "Cemex"],
  },
  {
    rfcEmisor: "PMA850301JKL",
    personaName: "Pedro · Mecánica Autopro",
    businessName: "Mecánica Autopro",
    defaultSector: "services",
    defaultBuyerPool: ["PEMEX", "Costco"],
  },
  {
    rfcEmisor: "ABE910718MNO",
    personaName: "Ana · Boutique Elegancia",
    businessName: "Boutique Elegancia",
    defaultSector: "apparel",
    defaultBuyerPool: ["Liverpool", "Sears"],
  },
  {
    rfcEmisor: "DCE890605PQR",
    personaName: "Diego · Cafetería La Esquina",
    businessName: "Cafetería La Esquina",
    defaultSector: "food retail",
    defaultBuyerPool: ["Costco", "La Comer"],
  },
];

const PAYMENT_TERMS: ReadonlyArray<30 | 45 | 60 | 90> = [30, 45, 60, 90];
const AMOUNT_MIN_MXN = 15000;
const AMOUNT_MAX_MXN = 200000;
const AMOUNT_STEP_MXN = 100; // round to nearest 100 for realism.

function pickRandom<T>(arr: ReadonlyArray<T>): T {
  if (arr.length === 0) throw new Error("pickRandom: empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmountMXN(): number {
  const span = AMOUNT_MAX_MXN - AMOUNT_MIN_MXN;
  const raw = AMOUNT_MIN_MXN + Math.floor(Math.random() * span);
  return Math.round(raw / AMOUNT_STEP_MXN) * AMOUNT_STEP_MXN;
}

function isoDateOffset(days: number, base: Date = new Date()): string {
  const d = new Date(base.getTime() + days * 86400_000);
  return d.toISOString().slice(0, 10);
}

export interface GenerateOptions {
  /** Persona to use; defaults to random pick from MOCK_PERSONAS. */
  persona?: PersonaTemplate;
  /** Buyer to use; must be ∈ persona.defaultBuyerPool. Defaults to random pick from that pool. */
  anchorBuyer?: string;
  /** Amount override (MXN). Defaults to random ∈ [15K, 200K]. */
  amountMXN?: number;
  /** Payment terms override. Defaults to random ∈ {30, 45, 60, 90}. */
  paymentTermsDays?: 30 | 45 | 60 | 90;
}

/**
 * Generate a fresh Invoice with a unique UUID v4. Persona-buyer pairing is
 * guaranteed semantically coherent: the buyer is always picked from the
 * persona's `defaultBuyerPool`, so a boutique never invoices Cemex.
 *
 * The generated id is `inv-<uuid>` (stable for the lifetime of the invoice)
 * and the uuid/uuidSat fields are the same v4 string (mirrors CFDI 4.0 SAT
 * folio fiscal semantics for the demo).
 */
export function generateRandomInvoice(opts: GenerateOptions = {}): Invoice {
  const persona = opts.persona ?? pickRandom(MOCK_PERSONAS);
  const anchorBuyer = opts.anchorBuyer ?? pickRandom(persona.defaultBuyerPool);
  if (!persona.defaultBuyerPool.includes(anchorBuyer)) {
    throw new Error(
      `generateRandomInvoice: anchorBuyer "${anchorBuyer}" not in persona "${persona.businessName}" pool`,
    );
  }
  const buyer = BUYERS_TIER_1.find((b) => b.name === anchorBuyer);
  if (!buyer) {
    throw new Error(
      `generateRandomInvoice: anchorBuyer "${anchorBuyer}" missing from BUYERS_TIER_1 catalog`,
    );
  }
  const amount = opts.amountMXN ?? randomAmountMXN();
  const paymentTermsDays = opts.paymentTermsDays ?? pickRandom(PAYMENT_TERMS);
  const uuid = crypto.randomUUID();
  const issueDate = isoDateOffset(0);
  const dueDate = isoDateOffset(paymentTermsDays);

  return {
    id: `inv-${uuid}`,
    uuid,
    uuidSat: uuid,
    issuer: { name: persona.businessName, rfc: persona.rfcEmisor },
    receiver: { name: buyer.name, rfc: buyer.rfc },
    amount,
    currency: "MXN",
    issueDate,
    dueDate,
    anchorBuyer: buyer.name,
    paymentTermsDays,
    sector: persona.defaultSector,
    status: "issued",
  };
}

// Backwards compat — `MOCK_INVOICES` is materialized at module load from the
// dynamic generator so the `npm run seed` dev script keeps working. New
// runtime code paths MUST use `generateRandomInvoice()` so each scan emits a
// fresh UUID (no onchain "INVOICE_ALREADY_COMMITTED" collisions during demos).
// @deprecated use generateRandomInvoice()
export const MOCK_INVOICES: Invoice[] = MOCK_PERSONAS.slice(0, 3).map(
  (persona) =>
    generateRandomInvoice({
      persona,
      anchorBuyer: persona.defaultBuyerPool[0],
    }),
);

// Backwards compat — preserved for any consumer still using the legacy demo Lender shape.
// @deprecated use LENDERS_CATALOG.
export const MOCK_LENDERS: Lender[] = [
  {
    id: "lnd-arkangeles-fund-i",
    name: "Arkangeles Fund I",
    acceptedBands: ["A", "B"],
    minAmountUSDC: 500,
    maxAmountUSDC: 25000,
    rateAPR: 14.5,
    advanceRate: 0.92,
    wallet: "0xA1234567890123456789012345678901234567Ab",
  },
];
