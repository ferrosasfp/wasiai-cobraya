import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lendable · SmartFactoring agéntico",
  description: "Factoraje de facturas en segundos para PyMEs mexicanas. Settlement USDC en Avalanche.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
