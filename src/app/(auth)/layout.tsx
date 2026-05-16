export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--luma-hero-radial)' }}
    >
      {children}
    </main>
  );
}
