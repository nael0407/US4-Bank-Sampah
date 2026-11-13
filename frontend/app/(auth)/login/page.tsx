"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Recycle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Akun demo dipilih: ${demoEmail}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Selamat datang kembali, ${user.nama}!`);

      if (user.role === "NASABAH") router.push("/nasabah/dashboard");
      else if (user.role === "PETUGAS") router.push("/petugas/dashboard");
      else if (user.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk. Periksa kembali email dan password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Recycle className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Bank Sampah RW</span>
          </Link>
          <p className="text-sm text-slate-500">Masuk untuk mengelola setoran dan saldo Anda</p>
        </div>

        <Card className="shadow-lg border-slate-200/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
            <CardDescription>Masukkan email dan kata sandi yang terdaftar</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Kata Sandi</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Quick Fill Pills */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Isi Otomatis Akun Uji Coba:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoFill("admin@banksampah.id", "admin12345")}
                    className="text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill("petugas@banksampah.id", "petugas12345")}
                    className="text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                  >
                    ⚖️ Petugas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill("nasabah@banksampah.id", "nasabah12345")}
                    className="text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
                  >
                    👤 Nasabah
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    Masuk Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-slate-500">
                Belum punya buku tabungan nasabah?{" "}
                <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
                  Daftar di sini
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
