#!/usr/bin/env node
// Usage: node scripts/verify-audit-trail.js <audit.json>
// CD-13: standalone — solo viem + node:crypto. NADA importado de Cobraya.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { recoverTypedDataAddress } = require("viem");

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/verify-audit-trail.js <audit.json>");
    process.exit(1);
  }
  const trail = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));

  let failures = 0;

  // 1) Recompute sha256 (excluding trailHashSHA256)
  const { trailHashSHA256: hashFromFile, ...rest } = trail;
  const recomputed =
    "0x" +
    createHash("sha256").update(JSON.stringify({ ...rest, trailHashSHA256: "" })).digest("hex");
  if (recomputed !== hashFromFile) {
    console.error(
      `FAIL trailHashSHA256 mismatch\n  expected: ${recomputed}\n  got:      ${hashFromFile}`,
    );
    failures++;
  } else {
    console.log(`OK trailHashSHA256 matches ${hashFromFile.slice(0, 18)}…`);
  }

  // 2) Recover EIP-712 signer per step
  for (const step of trail.steps) {
    // BLQ-BAJO-3 (post-AR fix-pack): handle `receipt: null` gracefully instead
    // of throwing TypeError. A null receipt means the agent route caught a
    // signer failure (hot key missing / RPC blip) and degraded the step
    // without crashing the response. Surface a clean FAIL with the cause.
    if (step.receipt === null || step.receipt === undefined) {
      console.error(
        `FAIL step ${step.stepIndex} ${step.agentSlug}: missing receipt (signer failed at write time — see server warn logs)`,
      );
      failures++;
      continue;
    }
    try {
      const r = step.receipt;
      const message = {
        agentSlug: r.message.agentSlug,
        stepIndex: BigInt(r.message.stepIndex),
        inputHash: r.message.inputHash,
        outputHash: r.message.outputHash,
        startedAt: BigInt(r.message.startedAt),
        priceUsdc: BigInt(r.message.priceUsdc),
      };
      const recovered = await recoverTypedDataAddress({
        domain: r.domain,
        types: {
          Receipt: [
            { name: "agentSlug", type: "string" },
            { name: "stepIndex", type: "uint256" },
            { name: "inputHash", type: "bytes32" },
            { name: "outputHash", type: "bytes32" },
            { name: "startedAt", type: "uint256" },
            { name: "priceUsdc", type: "uint256" },
          ],
        },
        primaryType: "Receipt",
        message,
        signature: r.signature,
      });
      if (recovered.toLowerCase() !== step.agentSigner.toLowerCase()) {
        console.error(
          `FAIL step ${step.stepIndex} ${step.agentSlug}: signer mismatch ${recovered} vs ${step.agentSigner}`,
        );
        failures++;
      } else {
        console.log(
          `OK step ${step.stepIndex} ${step.agentSlug}: signer ${recovered.slice(0, 10)}…`,
        );
      }
    } catch (err) {
      console.error(`FAIL step ${step.stepIndex}: ${err.message}`);
      failures++;
    }
  }

  if (failures === 0) console.log("\nALL CHECKS PASSED");
  else {
    console.error(`\n${failures} CHECKS FAILED`);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(3);
});
