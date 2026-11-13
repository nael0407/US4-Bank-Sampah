"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatTanggal, formatBerat } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { Scale, Wallet, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function PetugasDashboard() {
  const { user } = useAuth();

  // Pending withdrawals
  const { data: pendingPenarikan, isLoading: loadingPenarikan } = useQuery<{
    data: any[];
    total: number;
  }>({
    queryKey: ["petugas-pending-penarikan"],
    queryFn: () => apiClient("/api/penarikan?status=PENDING"),
  });

  // Recent deposits
  const { data: setoranList, isLoading: loadingSetoran } = useQuery<{
    data: any[];
    total: number;
  }>({
    queryKey: ["petugas-recent-setoran"],
    queryFn: () => apiClient("/api/setoran?limit=5"),
  });

  const pendingCount = pendingPenarikan?.total ?? 0;
  const recentDeposits = setoranList?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Meja Kerja Petugas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Petugas: <span className="font-semibold text-slate-700">{user?.nama}</span> • Pos Penimbangan RW
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/petugas/setoran">
            <Button className="shadow-md shadow-emerald-600/20">
              <Scale className="mr-2 h-4 w-4" /> Buka Kasir Timbangan
            </Button>
          </Link>
          <Link href="/petugas/penarikan">
            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4" /> Antrean Penarikan
              {pendingCount > 0 && (
                <span className="ml-2 bg-amber-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {pendingCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Permintaan Penarikan Menunggu"
          value={loadingPenarikan ? <Skeleton className="h-8 w-16" /> : `${pendingCount} Permintaan`}
          subtitle={pendingCount > 0 ? "Perlu persetujuan atau pembayaran segera" : "Semua antrean tuntas"}
          icon={Wallet}
          colorScheme={pendingCount > 0 ? "amber" : "emerald"}
        />

        <StatCard
          title="Total Transaksi Ditimbang"
          value={loadingSetoran ? <Skeleton className="h-8 w-16" /> : `${setoranList?.total ?? 0} Kali`}
          subtitle="Tercatat dalam sistem"
          icon={Scale}
          colorScheme="emerald"
        />

        <Card className="flex flex-col justify-between p-6 bg-emerald-50 border-emerald-200">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Input Cepat Timbangan</span>
            </div>
            <p className="text-xs text-emerald-900">
              Gunakan formulir kasir untuk memilih nasabah dan menimbang sampah multi-kategori sekaligus.
            </p>
          </div>
          <Link href="/petugas/setoran" className="mt-4">
            <Button size="sm" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
              Catat Setoran Baru <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Deposits Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Setoran Terbaru</CardTitle>
            <p className="text-xs text-slate-500">5 transaksi penimbangan terakhir oleh warga</p>
          </div>
          <Link href="/petugas/setoran">
            <Button variant="ghost" size="sm" className="text-emerald-600 text-xs font-semibold">
              Lihat Kasir & Kelola Setoran <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loadingSetoran ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentDeposits.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm">Belum ada transaksi setoran tercatat</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDeposits.map((item: any) => (
                <div key={item._id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">
                        Nasabah: {item.nasabahId?.nama || item.nasabahId || "Warga"}
                      </span>
                      <Badge variant={item.status === "AKTIF" ? "success" : "destructive"}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatTanggal(item.createdAt)} • {item.items?.length || 0} kategori sampah
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-base">
                      +{formatRupiah(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
