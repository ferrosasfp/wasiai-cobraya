"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "cobraya:install-dismissed";

// Routes where the install prompt should NOT interrupt — the onboarding wizard
// requires focused single-task flow + the iOS dialog's role="dialog" can cause
// assistive tech to set aria-hidden on the rest of the page (which then conflicts
// with focused inputs inside the wizard, breaking screen-reader semantics).
const HIDE_PREFIXES = ["/onboarding", "/login", "/signup"];

export function InstallPrompt() {
  const pathname = usePathname() ?? "";
  const hidden = HIDE_PREFIXES.some((p) => pathname.startsWith(p));
  const [mounted, setMounted] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    const ua = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream);
    /* eslint-enable react-hooks/set-state-in-effect */

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      localStorage.setItem(DISMISS_KEY, "true");
      setDismissed(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted) return null;
  if (hidden) return null;
  if (isStandalone || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setDeferred(null);
    }
  };

  if (isIOS) {
    return (
      <div
        role="dialog"
        aria-label="Instalar Cobraya en iOS"
        className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-2xl bg-[#0F8B4A] p-5 text-[#FCF7F3] shadow-2xl"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#FCF7F3]/10 text-[#FCF7F3] text-lg leading-none hover:bg-[#FCF7F3]/20"
        >
          ×
        </button>
        <p className="font-serif text-xl pr-8">Instalá Cobraya en tu teléfono</p>
        <p className="mt-1 text-xs text-[#FCF7F3]/70">
          Agregalo a tu pantalla principal — funciona igual que una app nativa.
        </p>

        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FCF7F3]/15 text-xs font-bold">
              1
            </span>
            <span className="flex flex-1 items-center gap-2">
              Tocá el ícono de Compartir en Safari
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FCF7F3]/15 text-xs font-bold">
              2
            </span>
            <span className="flex-1">
              Bajá hasta <strong>Agregar a inicio</strong>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FCF7F3]/15 text-xs font-bold">
              3
            </span>
            <span className="flex-1">
              Tocá <strong>Agregar</strong> arriba a la derecha
            </span>
          </li>
        </ol>

        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full rounded-full bg-[#FCF7F3] py-2.5 text-sm font-semibold text-[#0F8B4A] hover:bg-[#FCF7F3]/90"
        >
          Listo
        </button>
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#0F8B4A] px-4 py-2 text-[#FCF7F3] shadow-2xl">
      <button type="button" onClick={handleInstall} className="font-serif text-base">
        Instalar
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="text-[#FCF7F3]/70 hover:text-[#FCF7F3]"
      >
        ×
      </button>
    </div>
  );
}
