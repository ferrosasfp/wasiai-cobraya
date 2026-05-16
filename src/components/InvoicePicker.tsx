// src/components/InvoicePicker.tsx — REPLACED
// The old 3-card hardcoded picker is gone: the 3 hardcoded UUIDs were already
// committed onchain by W7 smoke runs, so reusing them broke happy-path demos
// with "INVOICE_ALREADY_COMMITTED". The new UX scans a fresh CFDI every time.
//
// This file now re-exports `InvoiceScanner` under the old name for any
// downstream consumer that still imports `InvoicePicker`. New code MUST import
// `InvoiceScanner` directly.
"use client";

export { InvoiceScanner as InvoicePicker } from "@/components/InvoiceScanner";
