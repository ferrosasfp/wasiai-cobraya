'use client';
import * as React from 'react';
import type { OnboardingStepState } from '@/lib/types/actions';

export type StepAction = (
  prev: OnboardingStepState,
  fd: FormData,
) => Promise<OnboardingStepState>;

/**
 * Shared shell for each onboarding step form (React 18.3.1 — no useActionState).
 * Children render the input fields; the shell owns the submit button + error state.
 */
export function StepFormShell({
  action,
  submitLabel = 'Siguiente',
  pendingLabel = 'Guardando…',
  children,
}: {
  action: StepAction;
  submitLabel?: string;
  pendingLabel?: string;
  children: (state: OnboardingStepState) => React.ReactNode;
}) {
  const [state, setState] = React.useState<OnboardingStepState>({});
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(state, data);
      setState(result ?? {});
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {children(state)}
      {state.error && (
        <p role="alert" className="text-red-700 text-sm">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        className="pill-btn pill-btn-primary w-full min-h-[48px]"
        disabled={pending}
        aria-disabled={pending}
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
