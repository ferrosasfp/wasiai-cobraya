'use client';
import { StepFormShell } from './step-form-shell';
import { saveStep2 } from '@/actions/profile';
import type { ProfileRow } from '@/lib/onboarding/resume';

export function Step2Form({ defaults }: { defaults: ProfileRow | null }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="h1-serif text-luma-700 text-2xl mb-1">¿En qué sector estás?</h2>
        <p className="text-sm text-luma-450">
          Esto ayuda a los lenders a entender tu negocio.
        </p>
      </header>
      <StepFormShell action={saveStep2}>
        {(state) => (
          <label className="auth-label">
            Sector
            <input
              name="sector"
              required
              minLength={2}
              maxLength={100}
              defaultValue={defaults?.sector ?? ''}
              placeholder="Ej. Logística, Manufactura, Consultoría"
              className="auth-input min-h-[48px] mt-1"
              autoComplete="off"
              aria-invalid={state.fieldErrors?.sector ? true : undefined}
            />
            {state.fieldErrors?.sector && (
              <span className="block text-red-700 text-sm mt-1 normal-case tracking-normal font-normal">
                {state.fieldErrors.sector}
              </span>
            )}
          </label>
        )}
      </StepFormShell>
    </div>
  );
}
