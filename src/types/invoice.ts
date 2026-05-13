export type InvoiceStatus =
  | "pending"
  | "validating"
  | "scoring"
  | "matching"
  | "ready"
  | "settled"
  | "rejected";

export interface Invoice {
  id: string;
  uuid: string;
  issuer: {
    rfc: string;
    name: string;
  };
  receiver: {
    rfc: string;
    name: string;
  };
  amount: number;
  currency: "MXN" | "USD";
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

export interface ValidatorResult {
  isValid: boolean;
  cfdiUuid: string;
  satMatch: boolean;
  duplicateCheck: "clean" | "duplicate";
  reason?: string;
}

export interface ScoreResult {
  score: number;
  band: "A" | "B" | "C" | "D";
  rationale: string;
  oraclePromptId: string;
}

export interface LenderMatch {
  lenderId: string;
  lenderName: string;
  advanceRate: number;
  rateAPR: number;
  estimatedSettlement: {
    grossUSDC: number;
    feeUSDC: number;
    netUSDC: number;
  };
}

export interface SettlementReceipt {
  txHash: `0x${string}`;
  chainId: number;
  blockNumber: number;
  from: `0x${string}`;
  to: `0x${string}`;
  amountUSDC: number;
  facilitator: string;
}

export interface Lender {
  id: string;
  name: string;
  acceptedBands: Array<"A" | "B" | "C" | "D">;
  minAmountUSDC: number;
  maxAmountUSDC: number;
  rateAPR: number;
  advanceRate: number;
  wallet: `0x${string}`;
}
