'use client';
import { StepFormShell } from './step-form-shell';
import { saveStep1 } from '@/actions/profile';
import type { ProfileRow } from '@/lib/onboarding/resume';

export function Step1Form({ defaults }: { defaults: ProfileRow | null }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="h1-serif text-luma-700 text-2xl mb-1">Tu RFC</h2>
        <p className="text-sm text-luma-450">
          Lo necesitamos para emitir CFDIs y mover tus pagos.
        </p>
      </header>
      <StepFormShell action={saveStep1}>
        {(state) => (
          <label className="auth-label">
            RFC
            <input
              name="rfc"
              required
              minLength={12}
              maxLength={13}
              defaultValue={defaults?.rfc ?? ''}
              className="auth-input min-h-[48px] mt-1 uppercase"
              autoComplete="off"
              aria-invalid={state.fieldErrors?.rfc ? true : undefined}
            />
            {state.fieldErrors?.rfc && (
              <span className="block text-red-700 text-sm mt-1 normal-case tracking-normal font-normal">
                {state.fieldErrors.rfc}
              </span>
            )}
          </label>
        )}
      </StepFormShell>
    </div>
  );
}
