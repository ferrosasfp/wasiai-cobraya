// DD-D: onboarding has its own layout WITHOUT TopNav/BottomTabs.
// The user cannot navigate freely until onboarding_completed=true.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--luma-hero-radial)' }}
    >
      <div className="auth-card max-w-md w-full">{children}</div>
    </main>
  );
}
