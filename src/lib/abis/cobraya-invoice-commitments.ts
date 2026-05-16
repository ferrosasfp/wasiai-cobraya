// Auto-managed from contracts/out/CobrayaInvoiceCommitments.sol/CobrayaInvoiceCommitments.json
// Only the runtime functions/events the viem client actually invokes.
export const COMMITMENTS_ABI = [
  {
    type: "function",
    name: "commitInvoice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "metadataPointer", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "isCommitted",
    stateMutability: "view",
    inputs: [{ name: "hash", type: "bytes32" }],
    outputs: [
      { name: "active", type: "bool" },
      { name: "ts", type: "uint64" },
      { name: "committer", type: "address" },
    ],
  },
] as const;
