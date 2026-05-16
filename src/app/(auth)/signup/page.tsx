import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata = { title: 'Crear cuenta · Cobraya' };

export default function SignupPage() {
  return (
    <div className="auth-card max-w-sm w-full">
      <h1 className="h1-serif text-luma-700 mb-2">Crea tu cuenta</h1>
      <p className="text-sm text-luma-450 mb-6">
        Tu factura líquida en 30 segundos. Sin trámites.
      </p>
      <SignupForm />
      <p className="text-sm text-luma-450 mt-6 text-center">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-luma-600 underline underline-offset-2">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
