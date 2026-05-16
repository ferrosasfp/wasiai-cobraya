'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  profileUpdateSchema,
} from '@/lib/validation/profile';
import type { OnboardingStepState, ActionResult } from '@/lib/types/actions';

async function saveStepAndAdvance<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData,
  nextPath: string,
  extraUpdate: Record<string, unknown> = {},
): Promise<OnboardingStepState> {
  const raw: Record<string, unknown> = Object.fromEntries(formData.entries());
  if (typeof raw.anchor_buyers === 'string') {
    try {
      raw.anchor_buyers = JSON.parse(raw.anchor_buyers);
    } catch {
      // leave as-is, schema will reject
    }
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      fieldErrors[i.path.join('.') || '_'] = i.message;
    }
    return { fieldErrors };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión no válida.' };
  // DD-O: cobraya_profiles (prefix)
  const { error } = await supabase
    .from('cobraya_profiles')
    .update({ ...parsed.data, ...extraUpdate })
    .eq('id', user.id);
  if (error) {
    console.warn('[cobraya-action]', {
      action: 'saveStep',
      errorCode: error.code,
    });
    return { error: 'No se pudo guardar.' };
  }
  redirect(nextPath);
}

export async function saveStep1(
  _p: OnboardingStepState,
  fd: FormData,
): Promise<OnboardingStepState> {
  return saveStepAndAdvance(step1Schema, fd, '/onboarding/step/2');
}
export async function saveStep2(
  _p: OnboardingStepState,
  fd: FormData,
): Promise<OnboardingStepState> {
  return saveStepAndAdvance(step2Schema, fd, '/onboarding/step/3');
}
export async function saveStep3(
  _p: OnboardingStepState,
  fd: FormData,
): Promise<OnboardingStepState> {
  return saveStepAndAdvance(step3Schema, fd, '/onboarding/step/4');
}
export async function saveStep4(
  _p: OnboardingStepState,
  fd: FormData,
): Promise<OnboardingStepState> {
  return saveStepAndAdvance(step4Schema, fd, '/onboarding/step/5');
}
export async function saveStep5(
  _p: OnboardingStepState,
  fd: FormData,
): Promise<OnboardingStepState> {
  // DD-L: step 5 atomically marks onboarding_completed=true.
  return saveStepAndAdvance(step5Schema, fd, '/dashboard', {
    onboarding_completed: true,
  });
}

export async function updateProfile(
  _p: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  const raw: Record<string, unknown> = Object.fromEntries(fd.entries());
  if (typeof raw.anchor_buyers === 'string') {
    try {
      raw.anchor_buyers = JSON.parse(raw.anchor_buyers);
    } catch {
      // leave as-is, schema will reject
    }
  }
  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión no válida.' };
  const { error } = await supabase
    .from('cobraya_profiles')
    .upsert({ id: user.id, ...parsed.data })
    .eq('id', user.id);
  if (error) {
    console.warn('[cobraya-action]', {
      action: 'updateProfile',
      errorCode: error.code,
    });
    return { error: 'No se pudo actualizar.' };
  }
  // CR-MNR-1: route groups like `(app)` are NOT in the public URL — pass `/perfil`.
  revalidatePath('/perfil', 'page');
  return {};
}
