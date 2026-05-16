'use client';
import { StepFormShell } from './step-form-shell';
import { saveStep5 } from '@/actions/profile';
import type { ProfileRow } from '@/lib/onboarding/resume';

export function Step5Form({ defaults }: { defaults: ProfileRow | null }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="h1-serif text-luma-700 text-2xl mb-1">
          Tu mayor frustración cobrando
        </h2>
        <p className="text-sm text-luma-450">
          Cuéntanos lo que pasa hoy. Nos ayuda a mejorar Cobraya.
        </p>
      </header>
      <StepFormShell action={saveStep5} submitLabel="Terminar">
        {(state) => (
          <label className="auth-label">
            Lo más complicado de cobrar
            <textarea
              name="mayor_frustracion"
              required
              minLength={5}
              maxLength={500}
              rows={4}
              defaultValue={defaults?.mayor_frustracion ?? ''}
              placeholder="Ej. Tardan 60 días y siempre me piden CFDI corregido."
              className="auth-input mt-1"
              aria-invalid={state.fieldErrors?.mayor_frustracion ? true : undefined}
            />
            {state.fieldErrors?.mayor_frustracion && (
              <span className="block text-red-700 text-sm mt-1 normal-case tracking-normal font-normal">
                {state.fieldErrors.mayor_frustracion}
              </span>
            )}
          </label>
        )}
      </StepFormShell>
    </div>
  );
}
