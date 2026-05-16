'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/types/actions';

function mapError(code?: string): string {
  if (code === 'invalid_credentials') return 'Correo o contraseña incorrectos.';
  if (code === 'user_already_exists') return 'Este correo ya está registrado.';
  return 'No se pudo procesar tu solicitud.';
}

export async function signUp(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }
  const supabase = createClient();
  // DD-O: metadata.app='cobraya' guards the trigger that creates cobraya_profiles.
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { app: 'cobraya' },
    },
  });
  if (error) {
    console.warn('[cobraya-action]', { action: 'signUp', errorCode: error.code });
    return { error: mapError(error.code) };
  }
  redirect('/onboarding/step/1');
}

export async function signIn(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    console.warn('[cobraya-action]', { action: 'signIn', errorCode: error.code });
    return { error: mapError(error.code) };
  }
  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
