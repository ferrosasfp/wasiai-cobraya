import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterSW } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const metadata: Metadata = {
  title: "Cobraya · Factoraje agéntico para PyMEs",
  description: "Tu factura, líquida en 30 segundos. USDC en Avalanche.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Cobraya" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192" },
      { url: "/icons/icon-512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon-180.png", sizes: "180x180" }],
  },
  // Next.js `appleWebApp.capable: true` emits the deprecated
  // `<meta name="apple-mobile-web-app-capable">`. The W3C-standardized
  // replacement is `mobile-web-app-capable`. Emit both so:
  //   - iOS Safari (Apple-only) keeps recognizing the install affordance, AND
  //   - Chromium/Firefox stop emitting deprecation warnings.
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7A1232",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <RegisterSW />
        <InstallPrompt />
      </body>
    </html>
  );
}
