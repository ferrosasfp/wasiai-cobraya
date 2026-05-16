'use client';
import * as React from 'react';
import { StepFormShell } from './step-form-shell';
import { saveStep3 } from '@/actions/profile';
import type { ProfileRow } from '@/lib/onboarding/resume';

export function Step3Form({ defaults }: { defaults: ProfileRow | null }) {
  const initial: string[] = defaults?.anchor_buyers ?? [];
  const [buyers, setBuyers] = React.useState<string[]>(initial);
  const [draft, setDraft] = React.useState('');

  function addBuyer() {
    const v = draft.trim();
    if (!v) return;
    if (buyers.includes(v)) return;
    setBuyers([...buyers, v]);
    setDraft('');
  }

  function removeBuyer(name: string) {
    setBuyers(buyers.filter((b) => b !== name));
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="h1-serif text-luma-700 text-2xl mb-1">¿A quién le facturas?</h2>
        <p className="text-sm text-luma-450">
          Tus clientes habituales. Agregá al menos uno (las cadenas grandes
          ayudan a que te ofrezcamos mejor precio).
        </p>
      </header>
      <StepFormShell action={saveStep3}>
        {(state) => (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBuyer();
                  }
                }}
                placeholder="Ej. Walmart, Bimbo"
                className="auth-input min-h-[48px] flex-1"
                aria-label="Nuevo comprador"
              />
              <button
                type="button"
                onClick={addBuyer}
                className="pill-btn min-h-[48px] px-4 text-sm"
              >
                Agregar
              </button>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Compradores agregados">
              {buyers.map((b) => (
                <li
                  key={b}
                  className="inline-flex items-center gap-2 bg-luma-100 text-luma-700 rounded-full px-3 py-1 text-sm"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() => removeBuyer(b)}
                    aria-label={`Quitar ${b}`}
                    className="text-luma-600 font-bold"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="hidden"
              name="anchor_buyers"
              value={JSON.stringify(buyers)}
              readOnly
            />
            {state.fieldErrors?.anchor_buyers && (
              <span className="block text-red-700 text-sm">
                {state.fieldErrors.anchor_buyers}
              </span>
            )}
          </>
        )}
      </StepFormShell>
    </div>
  );
}
