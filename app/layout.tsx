import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "SPUN Factura - Facturación para Construcción",
    template: "%s | SPUN Factura",
  },
  description:
    "Facturación electrónica Verifactu para profesionales de la construcción. Cumple con la normativa AEAT de forma sencilla.",
  keywords: [
    "facturación electrónica",
    "verifactu",
    "construcción",
    "autónomos",
    "AEAT",
    "facturas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
