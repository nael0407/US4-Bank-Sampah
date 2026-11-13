import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Bank Sampah RW — Pencatatan Setoran & Saldo Otomatis",
  description: "Sistem digital pencatatan setoran, penimbangan sampah, buku besar, dan penarikan saldo nasabah tingkat RW.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
