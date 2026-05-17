import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { BrandMark, Wordmark } from '@/components/BrandIcon';

export const metadata = { title: 'Iniciar sesión · Cobraya' };

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-4">
      {/* Judge bypass banner — let evaluators reach the demo without logging in */}
      <Link
        href="/demo"
        className="w-full bg-luma-100 border-2 border-luma-600 rounded-2xl p-4 hover:bg-luma-200 transition-colors no-underline"
      >
        <div className="mono text-[10px] uppercase tracking-widest text-luma-600 mb-1">
          ★ ¿Sos juez del hackathon?
        </div>
        <div className="text-sm text-luma-700 font-medium leading-snug">
          Andá directo al demo público — no necesitás logearte para evaluar
          el proyecto.
        </div>
        <div className="mono text-xs text-luma-600 mt-2">
          Probar demo →
        </div>
      </Link>

      <div className="auth-card w-full">
        <div className="flex flex-col items-center mb-6">
          <BrandMark className="w-14 h-14 text-luma-600 mb-3" />
          <Wordmark className="text-3xl text-luma-700" />
        </div>
        <h1 className="h1-serif text-luma-700 mb-2">Bienvenida de vuelta</h1>
        <p className="text-sm text-luma-450 mb-6">
          Ingresa para seguir negociando tus facturas.
        </p>
        <LoginForm />
        <p className="text-sm text-luma-450 mt-6 text-center">
          ¿Sin cuenta?{' '}
          <Link href="/signup" className="text-luma-600 underline underline-offset-2">
            Crear una
          </Link>
        </p>
      </div>
    </div>
  );
}
