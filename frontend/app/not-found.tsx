import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Recycle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-600/30">
        <Recycle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        Halaman yang Anda tuju mungkin sudah dipindahkan atau URL yang dimasukkan salah.
      </p>
      <Link href="/">
        <Button className="shadow-sm">Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
