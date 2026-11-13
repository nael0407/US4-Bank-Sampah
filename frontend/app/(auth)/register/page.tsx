"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Recycle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    noHp: "",
    alamat: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.password) {
      toast.error("Nama, email, dan password wajib diisi");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        noHp: formData.noHp || undefined,
        alamat: formData.alamat || undefined,
      });

      toast.success("Pendaftaran nasabah berhasil! Silakan masuk dengan akun baru Anda.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Pendaftaran gagal. Periksa kembali formulir Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Recycle className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Bank Sampah RW</span>
          </Link>
          <p className="text-sm text-slate-500">Daftarkan akun nasabah baru untuk menabung sampah</p>
        </div>

        <Card className="shadow-lg border-slate-200/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Daftar Akun Nasabah</CardTitle>
            <CardDescription>Buku tabungan sampah digital untuk warga</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  name="nama"
                  placeholder="Budi Santoso"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="budi@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi (Minimal 8 Karakter)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noHp">Nomor WhatsApp / HP</Label>
                <Input
                  id="noHp"
                  name="noHp"
                  placeholder="081234567890"
                  value={formData.noHp}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat / RT / RW</Label>
                <Input
                  id="alamat"
                  name="alamat"
                  placeholder="Jl. Mawar No. 12, RT 02 / RW 04"
                  value={formData.alamat}
                  onChange={handleChange}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...
                  </>
                ) : (
                  <>
                    Buat Akun Nasabah <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-slate-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
                  Masuk di sini
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
