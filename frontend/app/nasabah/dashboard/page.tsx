"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EcoLevelCard } from "@/components/nasabah/eco-level-card";
import { fireEcoConfetti } from "@/lib/confetti";
import {
  Wallet,
  ArrowDownRight,
  History,
  MapPin,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
  TreePine,
  CheckCircle2,
} from "lucide-react";

interface MutasiItem {
  id: string;
  tipe: "SETORAN" | "PENARIKAN" | "KOREKSI";
  jumlah: number;
  saldoSebelum: number;
  saldoSetelah: number;
  keterangan?: string;
  createdAt: string;
}

export default function NasabahDashboard() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const { data: saldoData, isLoading: loadingSaldo } = useQuery<{ saldo: number }>({
    queryKey: ["saldo-nasabah"],
    queryFn: () => apiClient("/api/saldo"),
  });

  const { data: mutasiData, isLoading: loadingMutasi } = useQuery<{ data: MutasiItem[]; total: number }>({
    queryKey: ["mutasi-recent"],
    queryFn: () => apiClient("/api/saldo/mutasi?limit=5"),
  });

  const currentSaldo = saldoData?.saldo ?? user?.saldo ?? 0;
  const setoranMutasiCount = mutasiData?.data?.filter((m) => m.tipe === "SETORAN").length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Balance Hero Banner with Animated Floating Elements */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 md:p-8 text-white shadow-xl shadow-emerald-700/25">
        <div className="absolute top-2 right-12 text-6xl opacity-15 pointer-events-none select-none animate-float">
          🌿
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>Buku Tabungan Nasabah Digital</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Halo, {user?.nama || "Warga"}!
            </h1>
            <p className="text-emerald-100 text-sm max-w-md">
              Saldo otomatis terakumulasi dari setiap timbangan sampah Anda di lingkungan RW.
            </p>
          </div>

          {/* Saldo Display Box with Interactive Toggle */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20 min-w-[260px] hover:border-white/40 transition">
            <div className="flex items-center justify-between text-emerald-100 text-xs mb-1">
              <span>Total Saldo Aktif</span>
              <button
                type="button"
                onClick={() => {
                  setShowBalance(!showBalance);
                  if (!showBalance) fireEcoConfetti();
                }}
                className="hover:text-white transition flex items-center gap-1 text-[11px] bg-white/10 px-2 py-0.5 rounded-md active:scale-95"
              >
                {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showBalance ? "Sembunyikan" : "Tampilkan"}</span>
              </button>
            </div>

            {loadingSaldo ? (
              <Skeleton className="h-10 w-40 bg-white/20 rounded-lg" />
            ) : (
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {showBalance ? formatRupiah(currentSaldo) : "Rp ••••••••"}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Link href="/nasabah/tarik-saldo" className="flex-1">
                <Button
                  size="sm"
                  className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-semibold shadow-none active:scale-95"
                >
                  <ArrowDownRight className="mr-1.5 h-4 w-4" /> Tarik Saldo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Eco Impact & Level Card */}
      <EcoLevelCard
        totalKg={Math.max(12, Math.round(currentSaldo / 3000))}
        totalSetoran={Math.max(3, setoranMutasiCount)}
      />

      {/* Quick Action Navigation Grid with Interactive Hover & Scales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/nasabah/tarik-saldo">
          <Card className="hover:border-emerald-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                  Cairkan Saldo
                </h3>
                <p className="text-xs text-slate-500">Tarik tunai atau e-wallet (GoPay/DANA)</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/nasabah/riwayat">
          <Card className="hover:border-emerald-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                  Riwayat Mutasi
                </h3>
                <p className="text-xs text-slate-500">Daftar setoran & penarikan buku besar</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/nasabah/jadwal-jemput">
          <Card className="hover:border-emerald-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                  Peta Titik Jemput
                </h3>
                <p className="text-xs text-slate-500">Lihat lokasi drop station & jadwal RW</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity / Mutasi List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Mutasi Saldo Terakhir</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Perubahan buku besar tabungan Anda</p>
          </div>
          <Link href="/nasabah/riwayat">
            <Button variant="ghost" size="sm" className="text-emerald-600 text-xs font-semibold hover:bg-emerald-50">
              Lihat Semua <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loadingMutasi ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : !mutasiData?.data || mutasiData.data.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium">Belum ada mutasi tercatat</p>
              <p className="text-xs mt-1">Setorkan sampah pilahan Anda ke petugas bank sampah terdekat.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {mutasiData.data.map((mutasi) => {
                const isPositive = mutasi.jumlah > 0;
                let badgeVariant: "success" | "destructive" | "secondary" = "success";
                if (mutasi.tipe === "PENARIKAN") badgeVariant = "destructive";
                if (mutasi.tipe === "KOREKSI") badgeVariant = "secondary";

                return (
                  <div
                    key={mutasi.id}
                    className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-sm">
                            {mutasi.keterangan || mutasi.tipe}
                          </span>
                          <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                            {mutasi.tipe}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatTanggal(mutasi.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold text-sm ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatRupiah(mutasi.jumlah)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Saldo: {formatRupiah(mutasi.saldoSetelah)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
