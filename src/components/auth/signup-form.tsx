'use client';
import * as React from 'react';
import { signUp } from '@/actions/auth';
import type { ActionResult } from '@/lib/types/actions';

export function SignupForm() {
  // React 18.3.1 doesn't ship useFormState / useActionState (React 19 API).
  const [state, setState] = React.useState<ActionResult>({});
  const [pending, startTransition] = React.useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signUp(state, data);
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
          autoComplete="new-password"
          minLength={8}
          className="auth-input min-h-[48px] mt-1"
        />
        <span className="block text-xs text-luma-450 mt-1 normal-case tracking-normal font-normal">
          Mínimo 8 caracteres con al menos un número.
        </span>
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
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  );
}
