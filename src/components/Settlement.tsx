"use client";

import { snowtraceUrl } from "@/lib/facilitator";
import type { SettlementReceipt } from "@/types/invoice";

interface Props {
  receipt: SettlementReceipt | null;
  onSettle: () => void;
  canSettle: boolean;
  isSettling: boolean;
}

export function Settlement({ receipt, onSettle, canSettle, isSettling }: Props) {
  if (receipt) {
    return (
      <div>
        <div className="text-xs mono uppercase tracking-widest text-muted mb-4">04 · Settled onchain</div>
        <div className="border border-green-500 p-6 bg-white">
          <div className="serif text-3xl mb-4">${receipt.amountUSDC.toFixed(2)} USDC enviados</div>
          <div className="space-y-2 text-xs mono">
            <div>
              <span className="text-muted">tx hash · </span>
              <a
                href={snowtraceUrl(receipt.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent"
              >
                {receipt.txHash.slice(0, 10)}...{receipt.txHash.slice(-8)}
              </a>
            </div>
            <div>
              <span className="text-muted">chain · </span>
              {receipt.chainId === 43114 ? "Avalanche mainnet" : "Avalanche Fuji testnet"}
            </div>
            <div>
              <span className="text-muted">block · </span>
              {receipt.blockNumber.toLocaleString()}
            </div>
            <div>
              <span className="text-muted">facilitator · </span>
              {receipt.facilitator}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs mono uppercase tracking-widest text-muted mb-4">03 · Settlement</div>
      <div className="border border-line p-6">
        <p className="text-sm leading-relaxed mb-6 text-muted">
          El inversor firma una autorización EIP-3009 gasless. Nuestro facilitator paga el gas y settle
          en USDC sobre Avalanche. Sin la PyME necesitar wallet con AVAX.
        </p>
        <button
          type="button"
          onClick={onSettle}
          disabled={!canSettle || isSettling}
          className="bg-ink text-paper px-6 py-3 mono text-xs uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSettling ? "Settling..." : "Firmar y settle"}
        </button>
      </div>
    </div>
  );
}
