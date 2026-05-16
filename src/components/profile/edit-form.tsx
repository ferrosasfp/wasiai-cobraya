'use client';
import * as React from 'react';
import { updateProfile } from '@/actions/profile';
import type { ProfileRow } from '@/lib/onboarding/resume';
import type { ActionResult } from '@/lib/types/actions';

export function EditForm({ defaults }: { defaults: ProfileRow | null }) {
  // React 18.3.1 — useTransition pattern (see auto-blindaje for useActionState rationale).
  const [state, setState] = React.useState<ActionResult>({});
  const [pending, startTransition] = React.useTransition();
  const initialBuyers = (defaults?.anchor_buyers ?? []).join(', ');
  const [buyersCsv, setBuyersCsv] = React.useState(initialBuyers);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // Convert the user-facing comma-separated list into the JSON array the
    // Server Action expects under `anchor_buyers`.
    const arr = buyersCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    data.set('anchor_buyers', JSON.stringify(arr));
    startTransition(async () => {
      const result = await updateProfile(state, data);
      setState(result ?? {});
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="auth-label">
        RFC
        <input
          name="rfc"
          defaultValue={defaults?.rfc ?? ''}
          minLength={12}
          maxLength={13}
          className="auth-input min-h-[48px] mt-1 uppercase"
          autoComplete="off"
        />
      </label>
      <label className="auth-label">
        Sector
        <input
          name="sector"
          defaultValue={defaults?.sector ?? ''}
          className="auth-input min-h-[48px] mt-1"
          autoComplete="off"
        />
      </label>
      <label className="auth-label">
        Compradores ancla (separados por coma)
        <input
          name="anchor_buyers_csv"
          value={buyersCsv}
          onChange={(e) => setBuyersCsv(e.target.value)}
          className="auth-input min-h-[48px] mt-1"
          placeholder="Walmart, Bimbo"
        />
      </label>
      <label className="auth-label">
        Monto típico (MXN)
        <input
          type="number"
          name="monto_tipico_mxn"
          inputMode="numeric"
          defaultValue={defaults?.monto_tipico_mxn ?? ''}
          className="auth-input min-h-[48px] mt-1"
        />
      </label>
      <label className="auth-label">
        Mayor frustración cobrando
        <textarea
          name="mayor_frustracion"
          maxLength={500}
          rows={4}
          defaultValue={defaults?.mayor_frustracion ?? ''}
          className="auth-input mt-1"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-red-700 text-sm">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="pill-btn pill-btn-primary min-h-[48px]"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}
