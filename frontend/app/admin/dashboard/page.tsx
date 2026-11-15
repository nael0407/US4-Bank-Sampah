"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatBerat } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Scale,
  DollarSign,
  Users,
  Wallet,
  ArrowRight,
  Tags,
  MapPin,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const COLORS = ["#059669", "#10b981", "#34d399", "#0284c7", "#f59e0b", "#6366f1"];

export default function AdminDashboardPage() {
  const { data: ringkasanData, isLoading: loadingRingkasan } = useQuery<{ data: any }>({
    queryKey: ["admin-ringkasan-laporan"],
    queryFn: () => apiClient("/api/laporan/ringkasan"),
  });

  const { data: perJenisData, isLoading: loadingPerJenis } = useQuery<{ data: { perJenis?: any[] } }>({
    queryKey: ["admin-per-jenis-laporan"],
    queryFn: () => apiClient("/api/laporan/per-jenis"),
  });

  const ringkasan = ringkasanData?.data?.ringkasan;
  const chartData = Array.isArray(perJenisData?.data?.perJenis)
    ? perJenisData.data.perJenis
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dasbor Tata Kelola Admin
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ikhtisar perputaran tabungan sampah, berat terkumpul, dan nasabah RW.
          </p>
        </div>

        <Link href="/admin/laporan">
          <Button className="shadow-sm">
            <BarChart3 className="mr-2 h-4 w-4" /> Buka Laporan Lengkap
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sampah Terkumpul"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatBerat(ringkasan?.totalKg || 0)
            )
          }
          subtitle={`${ringkasan?.totalTransaksiSetoran || 0} kali penimbangan`}
          icon={Scale}
          colorScheme="emerald"
        />

        <StatCard
          title="Total Nilai Terkonversi"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              formatRupiah(ringkasan?.totalNilaiSetoran || 0)
            )
          }
          subtitle="Nilai rupiah sampah warga"
          icon={TrendingUp}
          colorScheme="emerald"
        />

        <StatCard
          title="Saldo Beredar di Warga"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              formatRupiah(ringkasan?.saldoBeredar || 0)
            )
          }
          subtitle="Kewajiban kas bank sampah"
          icon={Wallet}
          colorScheme="amber"
        />

        <StatCard
          title="Nasabah RW Aktif"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              `${ringkasan?.totalNasabahAktif || 0} Jiwa`
            )
          }
          subtitle="Warga terdaftar menabung"
          icon={Users}
          colorScheme="blue"
        />
      </div>

      {/* Main Charts & Quick Management Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribusi Berat per Kategori Sampah</CardTitle>
            <CardDescription>Akumulasi kilogram per jenis sampah yang disetor warga</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingPerJenis ? (
              <Skeleton className="h-[280px] w-full rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                Belum ada data setoran untuk ditampilkan dalam grafik
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="namaJenis"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="kg" />
                    <Tooltip
                      formatter={(val: any) => [`${val} kg`, "Berat Terkumpul"]}
                      labelStyle={{ fontWeight: "bold", color: "#0f172a" }}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="totalKg" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Management Shortcuts */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pusat Konfigurasi RW</CardTitle>
              <CardDescription>Kelola parameter operasional sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/jenis-sampah" className="block">
                <div className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Tags className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                        Jenis & Harga Sampah
                      </p>
                      <p className="text-[11px] text-slate-500">Update harga beli resmi per kg</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                </div>
              </Link>

              <Link href="/admin/pengguna" className="block">
                <div className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-800">
                        Kelola Akun Pengguna
                      </p>
                      <p className="text-[11px] text-slate-500">Tambah petugas & atur aktivasi nasabah</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                </div>
              </Link>

              <Link href="/admin/titik-jemput" className="block">
                <div className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-amber-800">
                        Titik & Jadwal Jemput
                      </p>
                      <p className="text-[11px] text-slate-500">Atur pos penampungan peta Leaflet</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
