import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = { title: 'Iniciar sesión · Cobraya' };

export default function LoginPage() {
  return (
    <div className="auth-card max-w-sm w-full">
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
  );
}
