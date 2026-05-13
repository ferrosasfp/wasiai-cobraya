import type { Invoice, Lender } from "@/types/invoice";

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    uuid: "A1B2C3D4-E5F6-7890-1234-567890ABCDEF",
    issuer: {
      rfc: "PYM920304ABC",
      name: "Tortillería La Esperanza SA de CV",
    },
    receiver: {
      rfc: "WAL850101XYZ",
      name: "Walmart de México",
    },
    amount: 48500,
    currency: "MXN",
    issueDate: "2026-04-15",
    dueDate: "2026-06-14",
    status: "pending",
  },
  {
    id: "inv-002",
    uuid: "B2C3D4E5-F6A7-8901-2345-67890ABCDEF1",
    issuer: {
      rfc: "PNM880712QRS",
      name: "Panadería Don Memo SA de CV",
    },
    receiver: {
      rfc: "OXX950215ZZZ",
      name: "Cadena Comercial OXXO",
    },
    amount: 124300,
    currency: "MXN",
    issueDate: "2026-04-20",
    dueDate: "2026-07-19",
    status: "pending",
  },
  {
    id: "inv-003",
    uuid: "C3D4E5F6-A7B8-9012-3456-7890ABCDEF12",
    issuer: {
      rfc: "TXM910625DEF",
      name: "Textiles Mérida SA de CV",
    },
    receiver: {
      rfc: "LIV900804UVW",
      name: "El Palacio de Hierro",
    },
    amount: 282700,
    currency: "MXN",
    issueDate: "2026-05-01",
    dueDate: "2026-07-30",
    status: "pending",
  },
];

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
  {
    id: "lnd-bankaool-sme",
    name: "Bankaool SME Pool",
    acceptedBands: ["A", "B", "C"],
    minAmountUSDC: 1000,
    maxAmountUSDC: 50000,
    rateAPR: 18.0,
    advanceRate: 0.88,
    wallet: "0xB2345678901234567890123456789012345678Bc",
  },
  {
    id: "lnd-latam-yield-dao",
    name: "LATAM Yield DAO",
    acceptedBands: ["B", "C", "D"],
    minAmountUSDC: 200,
    maxAmountUSDC: 10000,
    rateAPR: 24.0,
    advanceRate: 0.80,
    wallet: "0xC3456789012345678901234567890123456789Cd",
  },
];

export const USDC_MXN_RATE = 19.85;

export function mxnToUSDC(mxn: number): number {
  return Math.round((mxn / USDC_MXN_RATE) * 100) / 100;
}
