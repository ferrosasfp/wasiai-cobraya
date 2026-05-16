import Link from "next/link";
import { BrandMark, Wordmark } from "@/components/BrandIcon";

export default function SplashPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8 relative"
      style={{ background: "var(--luma-hero-radial)" }}
    >
      <BrandMark className="w-20 h-20 text-luma-50 mb-6" title="Cobraya" />
      <Wordmark className="text-5xl text-luma-50 mb-4 px-6 text-center" />
      <p className="text-sm text-luma-200 text-center mb-12 max-w-sm leading-relaxed italic">
        Tu factura, líquida en 30 segundos. USDC en Avalanche.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/signup"
          className="pill-btn pill-btn-primary w-full text-center min-h-[48px] flex items-center justify-center"
        >
          Comenzar
        </Link>
        <Link
          href="/login"
          className="text-luma-100 text-sm text-center underline underline-offset-2 min-h-[44px] flex items-center justify-center"
        >
          Ya tengo cuenta
        </Link>
      </div>
    </main>
  );
}
