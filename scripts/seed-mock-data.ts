import { MOCK_INVOICES, MOCK_LENDERS, mxnToUSDC } from "../src/lib/mock-data";

console.log("=== Lendable · Mock data seed ===\n");

console.log("Mock invoices:");
for (const inv of MOCK_INVOICES) {
  console.log(
    `  [${inv.id}] ${inv.issuer.name} → ${inv.receiver.name} · ${inv.amount.toLocaleString("es-MX")} ${inv.currency} (${mxnToUSDC(inv.amount).toFixed(2)} USDC)`,
  );
}

console.log("\nMock lenders:");
for (const l of MOCK_LENDERS) {
  console.log(
    `  [${l.id}] ${l.name} · accepts ${l.acceptedBands.join(",")} · ${l.rateAPR}% APR · ${(l.advanceRate * 100).toFixed(0)}% advance`,
  );
}

console.log("\nDone.");
