'use client';
import * as React from 'react';
import { signIn } from '@/actions/auth';
import type { ActionResult } from '@/lib/types/actions';

export function LoginForm() {
  // React 18.3.1 doesn't ship useFormState / useActionState (React 19 API).
  // Hand-rolled equivalent: capture ActionResult into local state, let the
  // Server Action own the redirect via NEXT_REDIRECT (throws success-path).
  const [state, setState] = React.useState<ActionResult>({});
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn(state, data);
      setState(result ?? {});
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="auth-label">
        Correo
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="auth-input min-h-[48px] mt-1"
        />
      </label>
      <label className="auth-label">
        Contraseña
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="auth-input min-h-[48px] mt-1"
        />
      </label>
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
        {pending ? 'Entrando…' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
