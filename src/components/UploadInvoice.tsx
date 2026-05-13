"use client";

import { MOCK_INVOICES } from "@/lib/mock-data";
import type { Invoice } from "@/types/invoice";

interface Props {
  onSelect: (invoice: Invoice) => void;
  disabled?: boolean;
}

export function UploadInvoice({ onSelect, disabled }: Props) {
  return (
    <div>
      <div className="text-xs mono uppercase tracking-widest text-muted mb-4">01 · Selecciona una factura</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_INVOICES.map((inv) => (
          <button
            key={inv.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(inv)}
            className="text-left border border-line hover:border-ink p-5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="text-xs mono text-muted mb-2">{inv.uuid.slice(0, 8)}...</div>
            <div className="font-medium text-sm mb-1">{inv.issuer.name}</div>
            <div className="text-xs text-muted mb-3">→ {inv.receiver.name}</div>
            <div className="serif text-2xl">
              ${inv.amount.toLocaleString("es-MX")}{" "}
              <span className="text-xs mono text-muted">{inv.currency}</span>
            </div>
            <div className="text-xs mono text-muted mt-2">vence {inv.dueDate}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
