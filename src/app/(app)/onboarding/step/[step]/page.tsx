import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { firstIncompleteStep, type ProfileRow } from '@/lib/onboarding/resume';
import { ProgressDots } from '@/components/onboarding/ProgressDots';
import { Step1Form } from '@/components/onboarding/step1-form';
import { Step2Form } from '@/components/onboarding/step2-form';
import { Step3Form } from '@/components/onboarding/step3-form';
import { Step4Form } from '@/components/onboarding/step4-form';
import { Step5Form } from '@/components/onboarding/step5-form';

export default async function OnboardingStepPage({
  params,
}: {
  params: { step: string };
}) {
  const stepNum = Number(params.step);
  if (![1, 2, 3, 4, 5].includes(stepNum)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // DD-O: cobraya_profiles
  const { data: profile } = await supabase
    .from('cobraya_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) redirect('/onboarding/step/1');
  if (profile.onboarding_completed) redirect('/dashboard');

  const allowed = firstIncompleteStep(profile);
  if (stepNum > allowed) redirect(`/onboarding/step/${allowed}`);

  return (
    <div>
      <ProgressDots current={stepNum} total={5} />
      {stepNum === 1 && <Step1Form defaults={profile} />}
      {stepNum === 2 && <Step2Form defaults={profile} />}
      {stepNum === 3 && <Step3Form defaults={profile} />}
      {stepNum === 4 && <Step4Form defaults={profile} />}
      {stepNum === 5 && <Step5Form defaults={profile} />}
    </div>
  );
}
