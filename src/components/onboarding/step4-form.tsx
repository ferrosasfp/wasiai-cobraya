'use client';
import { StepFormShell } from './step-form-shell';
import { saveStep4 } from '@/actions/profile';
import type { ProfileRow } from '@/lib/onboarding/resume';

export function Step4Form({ defaults }: { defaults: ProfileRow | null }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="h1-serif text-luma-700 text-2xl mb-1">¿Cuánto cobras por factura?</h2>
        <p className="text-sm text-luma-450">
          Más o menos. Sirve para mostrarte ofertas relevantes.
        </p>
      </header>
      <StepFormShell action={saveStep4}>
        {(state) => (
          <label className="auth-label">
            Monto (MXN)
            <input
              type="number"
              name="monto_tipico_mxn"
              required
              min="1"
              step="1"
              inputMode="numeric"
              defaultValue={defaults?.monto_tipico_mxn ?? ''}
              placeholder="48500"
              className="auth-input min-h-[48px] mt-1"
              aria-invalid={state.fieldErrors?.monto_tipico_mxn ? true : undefined}
            />
            {state.fieldErrors?.monto_tipico_mxn && (
              <span className="block text-red-700 text-sm mt-1 normal-case tracking-normal font-normal">
                {state.fieldErrors.monto_tipico_mxn}
              </span>
            )}
          </label>
        )}
      </StepFormShell>
    </div>
  );
}
