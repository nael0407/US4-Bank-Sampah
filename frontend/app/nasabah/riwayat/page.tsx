"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatTanggal, formatBerat } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  TrendingUp,
  ArrowDownRight,
  RotateCcw,
  Receipt,
  Clock,
  Filter,
} from "lucide-react";

interface MutasiItem {
  _id: string;
  tipe: "SETORAN" | "PENARIKAN" | "KOREKSI";
  jumlah: number;
  saldoSebelum: number;
  saldoSetelah: number;
  keterangan?: string;
  referensiId?: string;
  createdAt: string;
}

interface SetoranItem {
  _id: string;
  total: number;
  status: "AKTIF" | "DIBATALKAN";
  alasanBatal?: string;
  items: Array<{
    jenisSampahId: string;
    namaJenis: string;
    berat: number;
    hargaPerKg: number;
    subtotal: number;
  }>;
  createdAt: string;
}

export default function RiwayatPage() {
  const [activeTab, setActiveTab] = useState<"MUTASI" | "SETORAN">("MUTASI");
  const [filterTipe, setFilterTipe] = useState<string>("ALL");
  const [selectedSetoran, setSelectedSetoran] = useState<SetoranItem | null>(null);

  // Fetch Mutasi
  const { data: mutasiResponse, isLoading: loadingMutasi } = useQuery<{
    data: MutasiItem[];
    total: number;
  }>({
    queryKey: ["mutasi-full", filterTipe],
    queryFn: () => {
      const url =
        filterTipe === "ALL"
          ? "/api/saldo/mutasi?limit=50"
          : `/api/saldo/mutasi?tipe=${filterTipe}&limit=50`;
      return apiClient(url);
    },
  });

  // Fetch Setoran List
  const { data: setoranResponse, isLoading: loadingSetoran } = useQuery<{
    data: SetoranItem[];
    total: number;
  }>({
    queryKey: ["setoran-nasabah-list"],
    queryFn: () => apiClient("/api/setoran?limit=50"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat & Mutasi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit lengkap mutasi saldo buku besar dan rincian penimbangan sampah.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("MUTASI")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "MUTASI"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Buku Besar Mutasi
          </button>
          <button
            onClick={() => setActiveTab("SETORAN")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "SETORAN"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Slip Rincian Setoran
          </button>
        </div>
      </div>

      {activeTab === "MUTASI" ? (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Filter Tipe:</span>
              <div className="flex gap-1.5">
                {["ALL", "SETORAN", "PENARIKAN", "KOREKSI"].map((tipe) => (
                  <button
                    key={tipe}
                    onClick={() => setFilterTipe(tipe)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                      filterTipe === tipe
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tipe === "ALL" ? "Semua" : tipe}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-400">
              Total {mutasiResponse?.total ?? 0} catatan mutasi
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMutasi ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : !mutasiResponse?.data || mutasiResponse.data.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium">Tidak ada mutasi yang cocok dengan filter</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {mutasiResponse.data.map((mutasi) => {
                  const isPositive = mutasi.jumlah > 0;
                  return (
                    <div
                      key={mutasi._id}
                      className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                            mutasi.tipe === "SETORAN"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : mutasi.tipe === "PENARIKAN"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {mutasi.tipe === "SETORAN" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : mutasi.tipe === "PENARIKAN" ? (
                            <ArrowDownRight className="h-5 w-5" />
                          ) : (
                            <RotateCcw className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">
                              {mutasi.keterangan || mutasi.tipe}
                            </span>
                            <Badge
                              variant={
                                mutasi.tipe === "SETORAN"
                                  ? "success"
                                  : mutasi.tipe === "PENARIKAN"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-[10px]"
                            >
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
                          Saldo Sesudah: {formatRupiah(mutasi.saldoSetelah)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Slip Setoran List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loadingSetoran ? (
            <>
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </>
          ) : !setoranResponse?.data || setoranResponse.data.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium">Belum ada slip setoran</p>
            </div>
          ) : (
            setoranResponse.data.map((setoran) => (
              <Card
                key={setoran._id}
                className="hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedSetoran(setoran)}
              >
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Tanggal Timbang</span>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatTanggal(setoran.createdAt)}
                    </p>
                  </div>
                  <Badge variant={setoran.status === "AKTIF" ? "success" : "destructive"}>
                    {setoran.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="mt-2 text-xs text-slate-500">
                    <span>{setoran.items?.length || 0} jenis sampah ditimbang:</span>
                    <ul className="mt-1 list-disc list-inside text-slate-700">
                      {setoran.items?.slice(0, 2).map((item, i) => (
                        <li key={i}>
                          {item.namaJenis} ({formatBerat(item.berat)})
                        </li>
                      ))}
                      {setoran.items?.length > 2 && (
                        <li className="text-emerald-600 font-medium">
                          +{setoran.items.length - 2} item lainnya...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Nilai</span>
                    <span className="text-base font-bold text-emerald-600">
                      {formatRupiah(setoran.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Slip Setoran Detail Modal */}
      <Dialog
        isOpen={!!selectedSetoran}
        onClose={() => setSelectedSetoran(null)}
        title="Rincian Slip Setoran Sampah"
        description={selectedSetoran ? formatTanggal(selectedSetoran.createdAt) : ""}
      >
        {selectedSetoran && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Status Setoran</span>
              <Badge variant={selectedSetoran.status === "AKTIF" ? "success" : "destructive"}>
                {selectedSetoran.status}
              </Badge>
            </div>

            {selectedSetoran.status === "DIBATALKAN" && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <span className="font-bold">Alasan Pembatalan / Koreksi:</span>
                <p className="mt-0.5">{selectedSetoran.alasanBatal || "Salah timbang/koreksi petugas"}</p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-medium">Jenis Sampah</th>
                    <th className="p-2.5 font-medium text-right">Berat</th>
                    <th className="p-2.5 font-medium text-right">Harga/kg</th>
                    <th className="p-2.5 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {selectedSetoran.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-semibold text-slate-800">{item.namaJenis}</td>
                      <td className="p-2.5 text-right">{formatBerat(item.berat)}</td>
                      <td className="p-2.5 text-right">{formatRupiah(item.hargaPerKg)}</td>
                      <td className="p-2.5 text-right font-medium text-emerald-700">
                        {formatRupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50/50 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colSpan={3} className="p-3 text-right">
                      Total Masuk Saldo:
                    </td>
                    <td className="p-3 text-right text-emerald-700 text-sm">
                      {formatRupiah(selectedSetoran.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedSetoran(null)}
            >
              Tutup Slip
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
