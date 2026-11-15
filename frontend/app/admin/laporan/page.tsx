"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatBerat } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import {
  BarChart3,
  Scale,
  DollarSign,
  Wallet,
  Users,
  Printer,
  Calendar,
  Award,
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
  PieChart,
  Pie,
  Legend,
} from "recharts";

const COLORS = ["#059669", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function AdminLaporanPage() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const queryParams = {
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  };

  const { data: ringkasanRes, isLoading: loadingRingkasan } = useQuery<{ data: any }>({
    queryKey: ["admin-laporan-summary", fromDate, toDate],
    queryFn: () => apiClient("/api/laporan/ringkasan", { params: queryParams }),
  });

  const { data: perJenisRes, isLoading: loadingPerJenis } = useQuery<{ data: { perJenis?: any[] } }>({
    queryKey: ["admin-laporan-per-jenis", fromDate, toDate],
    queryFn: () => apiClient("/api/laporan/per-jenis", { params: queryParams }),
  });

  const ringkasan = ringkasanRes?.data?.ringkasan;
  const listPerJenis = Array.isArray(perJenisRes?.data?.perJenis)
    ? perJenisRes.data.perJenis
    : [];
  const totalBeratJenis = listPerJenis.reduce((sum, item) => sum + (item.totalKg || 0), 0);
  const topNasabah = Array.isArray(ringkasanRes?.data?.nasabahTeraktif)
    ? ringkasanRes.data.nasabahTeraktif
    : [];

  return (
    <div className="space-y-8 print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rekapitulasi Laporan & Audit
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Laporan agregasi timbangan, perputaran saldo, dan nasabah teraktif tingkat RW.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="shadow-sm"
            onClick={() => window.print()}
          >
            <Printer className="mr-1.5 h-4 w-4" /> Cetak / Ekspor PDF
          </Button>
        </div>
      </div>

      {/* Filter Date Bar */}
      <Card className="print:hidden">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Filter Rentang Periode Laporan:</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Dari:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Sampai:</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            {(fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-rose-600"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Berat Terkumpul"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatBerat(ringkasan?.totalKg || 0)
            )
          }
          subtitle={`${ringkasan?.totalTransaksiSetoran || 0} transaksi setoran`}
          icon={Scale}
          colorScheme="emerald"
        />

        <StatCard
          title="Total Nilai Setoran"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              formatRupiah(ringkasan?.totalNilaiSetoran || 0)
            )
          }
          subtitle="Tercatat masuk ke saldo warga"
          icon={TrendingUp}
          colorScheme="emerald"
        />

        <StatCard
          title="Total Pencairan Saldo"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              formatRupiah(ringkasan?.totalPenarikan || 0)
            )
          }
          subtitle={`${ringkasan?.totalTransaksiPenarikan || 0} penarikan disetujui`}
          icon={Wallet}
          colorScheme="rose"
        />

        <StatCard
          title="Saldo Masih Beredar"
          value={
            loadingRingkasan ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              formatRupiah(ringkasan?.saldoBeredar || 0)
            )
          }
          subtitle="Tabungan aktif warga"
          icon={DollarSign}
          colorScheme="amber"
        />
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Kg per Waste Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Akumulasi Berat per Kategori (kg)</CardTitle>
            <CardDescription>Perbandingan volume sampah yang berhasil didaur ulang</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingPerJenis ? (
              <Skeleton className="h-[280px] w-full rounded-xl" />
            ) : listPerJenis.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                Belum ada data setoran untuk periode ini
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listPerJenis} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                      formatter={(val: any) => [`${val} kg`, "Berat Total"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="totalKg" radius={[6, 6, 0, 0]}>
                      {listPerJenis.map((_, index) => (
                        <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart: Monetary Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Komposisi Nilai Rupiah Sampah</CardTitle>
            <CardDescription>Kontribusi jenis sampah terhadap total saldo warga</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingPerJenis ? (
              <Skeleton className="h-[280px] w-full rounded-xl" />
            ) : listPerJenis.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                Belum ada data nilai sampah
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={listPerJenis}
                      dataKey="totalNilai"
                      nameKey="namaJenis"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {listPerJenis.map((_, index) => (
                        <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatRupiah(Number(val)), "Total Nilai"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-Jenis Table Breakdown */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base">Rincian Tabulasi per Jenis Sampah</CardTitle>
          <CardDescription>Volume kilogram dan perolehan nilai rupiah</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3 pl-6">Jenis Sampah</th>
                  <th className="p-3 text-right">Transaksi</th>
                  <th className="p-3 text-right">Total Berat (kg)</th>
                  <th className="p-3 text-right">Persentase</th>
                  <th className="p-3 pr-6 text-right">Total Nilai Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {listPerJenis.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 pl-6 font-semibold text-slate-900">{item.namaJenis}</td>
                    <td className="p-3 text-right text-slate-500">{item.totalTransaksi ?? 0}x</td>
                    <td className="p-3 text-right font-medium">{formatBerat(item.totalKg)}</td>
                    <td className="p-3 text-right text-slate-500">
                      {totalBeratJenis > 0
                        ? `${((item.totalKg / totalBeratJenis) * 100).toFixed(1)}%`
                        : "-"}
                    </td>
                    <td className="p-3 pr-6 text-right font-bold text-emerald-700">
                      {formatRupiah(item.totalNilai)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Nasabah Teraktif Leaderboard */}
      {topNasabah.length > 0 && (
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Nasabah Teraktif (Paling Banyak Menyetor)</span>
            </CardTitle>
            <CardDescription>Apresiasi warga paling peduli lingkungan di RW</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {topNasabah.map((nasabah: any, i: number) => (
                <div key={i} className="p-3.5 px-6 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">
                        {nasabah.nama || "Nasabah Warga"}
                      </span>
                      <p className="text-xs text-slate-400">
                        {nasabah.totalTransaksi} kali setoran sampah
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Nilai Tabungan</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatRupiah(nasabah.totalNilai)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
