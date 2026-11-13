"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatBerat, formatTanggal } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fireCelebrationConfetti } from "@/lib/confetti";
import {
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Receipt,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

interface JenisSampah {
  _id: string;
  nama: string;
  kategori: string;
  hargaPerKg: number;
  aktif: boolean;
}

interface UserNasabah {
  _id: string;
  id?: string;
  nama: string;
  email: string;
  noHp?: string;
  alamat?: string;
  saldo: number;
}

interface SetoranRow {
  jenisSampahId: string;
  berat: number | "";
}

interface SetoranRecord {
  _id: string;
  nasabahId: any;
  petugasId: any;
  items: Array<{
    jenisSampahId: string;
    namaJenis: string;
    berat: number;
    hargaPerKg: number;
    subtotal: number;
  }>;
  total: number;
  status: "AKTIF" | "DIBATALKAN";
  alasanBatal?: string;
  createdAt: string;
}

export default function SetoranKasirPage() {
  const queryClient = useQueryClient();
  const { user: currentOfficer } = useAuth();

  const [selectedNasabahId, setSelectedNasabahId] = useState<string>("");
  const [rows, setRows] = useState<SetoranRow[]>([{ jenisSampahId: "", berat: "" }]);

  // Receipt modal state
  const [lastCreatedSetoran, setLastCreatedSetoran] = useState<any | null>(null);

  // Cancellation modal state
  const [cancelModalItem, setCancelModalItem] = useState<SetoranRecord | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");

  // 1. Fetch Nasabah Users
  const { data: nasabahList } = useQuery<UserNasabah[]>({
    queryKey: ["users-nasabah-list"],
    queryFn: async () => {
      const res = await apiClient<{ data: UserNasabah[] }>("/api/users?role=NASABAH&limit=100");
      return res.data || [];
    },
  });

  // 2. Fetch Waste Categories
  const { data: jenisSampahList } = useQuery<JenisSampah[]>({
    queryKey: ["jenis-sampah-active"],
    queryFn: async () => {
      const res = await apiClient<{ data: JenisSampah[] }>("/api/jenis-sampah");
      return (res.data || []).filter((j) => j.aktif);
    },
  });

  // 3. Fetch Recent Setoran Records
  const { data: setoranRecords, isLoading: loadingRecords } = useQuery<{
    data: SetoranRecord[];
    total: number;
  }>({
    queryKey: ["petugas-all-setoran"],
    queryFn: () => apiClient("/api/setoran?limit=30"),
  });

  // Calculate live row values
  const jenisMap = new Map((jenisSampahList || []).map((j) => [j._id, j]));

  const calculateRowSubtotal = (row: SetoranRow) => {
    if (!row.jenisSampahId || !row.berat) return 0;
    const jenis = jenisMap.get(row.jenisSampahId);
    if (!jenis) return 0;
    return Math.round(Number(row.berat) * jenis.hargaPerKg);
  };

  const totalBerat = rows.reduce((sum, r) => sum + (Number(r.berat) || 0), 0);
  const grandTotal = rows.reduce((sum, r) => sum + calculateRowSubtotal(r), 0);

  const addRow = () => {
    setRows((prev) => [...prev, { jenisSampahId: "", berat: "" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof SetoranRow, value: any) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const quickAddWeight = (index: number, delta: number) => {
    const current = Number(rows[index].berat) || 0;
    const nextVal = Math.round((current + delta) * 100) / 100;
    updateRow(index, "berat", nextVal);
  };

  // Submit Setoran Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const validItems = rows
        .filter((r) => r.jenisSampahId && Number(r.berat) > 0)
        .map((r) => ({
          jenisSampahId: r.jenisSampahId,
          berat: Number(r.berat),
        }));

      if (validItems.length === 0) {
        throw new Error("Paling sedikit harus ada 1 baris sampah dengan berat > 0");
      }

      return apiClient<{ message: string; setoran: any; saldoNasabah: number }>("/api/setoran", {
        method: "POST",
        body: JSON.stringify({
          nasabahId: selectedNasabahId,
          items: validItems,
        }),
      });
    },
    onSuccess: (data) => {
      fireCelebrationConfetti();
      toast.success("Setoran berhasil dicatat & saldo nasabah telah bertambah!");
      setLastCreatedSetoran(data.setoran);
      setRows([{ jenisSampahId: "", berat: "" }]);
      queryClient.invalidateQueries({ queryKey: ["petugas-all-setoran"] });
      queryClient.invalidateQueries({ queryKey: ["petugas-recent-setoran"] });
      queryClient.invalidateQueries({ queryKey: ["users-nasabah-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mencatat setoran.");
    },
  });

  // Cancel Setoran Mutation (Koreksi)
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!cancelModalItem) return;
      return apiClient(`/api/setoran/${cancelModalItem._id}/batal`, {
        method: "PATCH",
        body: JSON.stringify({ alasan: cancelReason || "Salah timbang / koreksi petugas" }),
      });
    },
    onSuccess: () => {
      toast.success("Setoran berhasil dibatalkan dan entri koreksi telah dicatat!");
      setCancelModalItem(null);
      setCancelReason("");
      queryClient.invalidateQueries({ queryKey: ["petugas-all-setoran"] });
      queryClient.invalidateQueries({ queryKey: ["petugas-recent-setoran"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal membatalkan setoran.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabahId) {
      toast.error("Silakan pilih nasabah terlebih dahulu");
      return;
    }
    createMutation.mutate();
  };

  const selectedNasabah = (nasabahList || []).find(
    (n) => (n._id || n.id) === selectedNasabahId
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kasir Timbangan (POS Setoran)</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Timbang sampah nasabah, hitung otomatis saldo dengan shortcut cepat, dan cetak bukti transaksi.
        </p>
      </div>

      {/* POS Weigh-in Form Card */}
      <Card className="border-emerald-200/80 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 pb-4 border-b border-emerald-100/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse-glow">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base text-emerald-950">Meja Penimbangan Sampah RW</CardTitle>
                <CardDescription className="text-emerald-800">
                  Harga di-snapshot otomatis secara real-time
                </CardDescription>
              </div>
            </div>
            {selectedNasabah && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 border border-emerald-200 text-xs shadow-xs animate-in zoom-in-95">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">{selectedNasabah.nama}</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-bold">
                  Saldo: {formatRupiah(selectedNasabah.saldo)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Nasabah Selector */}
            <div className="space-y-2">
              <Label htmlFor="nasabah" className="text-sm font-semibold">
                Pilih Nasabah (Warga) *
              </Label>
              <select
                id="nasabah"
                value={selectedNasabahId}
                onChange={(e) => setSelectedNasabahId(e.target.value)}
                className="w-full h-11 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                required
              >
                <option value="">-- Pilih Buku Tabungan Nasabah --</option>
                {nasabahList?.map((n) => (
                  <option key={n._id || n.id} value={n._id || n.id}>
                    {n.nama} ({n.email}) {n.noHp ? `• ${n.noHp}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Waste Items Repeater with Quick Shortcut Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Rincian Timbangan Sampah</Label>
                <span className="text-xs text-slate-400">Gunakan tombol shortcut cepat</span>
              </div>

              <div className="space-y-3">
                {rows.map((row, index) => {
                  const jenis = jenisMap.get(row.jenisSampahId);
                  const subtotal = calculateRowSubtotal(row);

                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-2xl border-2 border-slate-200/80 bg-slate-50/60 space-y-2.5 transition-all hover:border-emerald-300 hover:bg-white"
                    >
                      <div className="grid grid-cols-12 gap-2.5 items-center">
                        {/* Jenis Sampah Selector */}
                        <div className="col-span-12 sm:col-span-5">
                          <select
                            value={row.jenisSampahId}
                            onChange={(e) => updateRow(index, "jenisSampahId", e.target.value)}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          >
                            <option value="">-- Pilih Jenis Sampah --</option>
                            {jenisSampahList?.map((j) => (
                              <option key={j._id} value={j._id}>
                                {j.nama} ({j.kategori}) — {formatRupiah(j.hargaPerKg)}/kg
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Weight Input */}
                        <div className="col-span-6 sm:col-span-3">
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.05"
                              placeholder="0.00"
                              value={row.berat}
                              onChange={(e) =>
                                updateRow(
                                  index,
                                  "berat",
                                  e.target.value === "" ? "" : Number(e.target.value)
                                )
                              }
                              className="h-10 text-sm font-bold pr-8 rounded-xl"
                              min="0.01"
                              required
                            />
                            <span className="absolute right-2.5 top-2.5 text-[11px] font-bold text-slate-400">
                              kg
                            </span>
                          </div>
                        </div>

                        {/* Subtotal Display */}
                        <div className="col-span-4 sm:col-span-3 text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Subtotal
                          </span>
                          <span className="text-sm font-extrabold text-emerald-700">
                            {formatRupiah(subtotal)}
                          </span>
                        </div>

                        {/* Delete Row Button */}
                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(index)}
                            disabled={rows.length === 1}
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg active:scale-95"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Interactive Quick Add Chips for Officer */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 text-xs">
                        <span className="text-[11px] text-slate-400 mr-1 font-medium">Tambah:</span>
                        {[0.5, 1, 2, 5, 10].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() => quickAddWeight(index, delta)}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-600 font-semibold text-[11px] transition-all active:scale-90"
                          >
                            +{delta} kg
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                className="mt-2 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 active:scale-95"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Baris Sampah
              </Button>
            </div>

            {/* Total Footer Calculation with High Contrast */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                  Ringkasan Hasil Timbang:
                </span>
                <p className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  <span>{formatBerat(totalBerat)}</span>
                  <span className="text-emerald-400">•</span>
                  <span>{rows.filter((r) => r.jenisSampahId).length} Kategori Sampah</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-300 block">Total Masuk Saldo Nasabah</span>
                <span className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="eco"
              className="w-full h-14 text-base font-bold shadow-xl shadow-emerald-600/30 active:scale-95 text-lg"
              disabled={createMutation.isPending || !selectedNasabahId || grandTotal <= 0}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan & Memperbarui Buku Besar...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Simpan Setoran & Tambahkan Saldo Warga 🎉
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Recorded Deposits Table (with Koreksi/Batal action) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Daftar Transaksi Setoran</CardTitle>
            <p className="text-xs text-slate-500">
              Riwayat setoran. Setoran salah dapat dibatalkan untuk menerbitkan entri koreksi saldo otomatis.
            </p>
          </div>
          <Badge variant="outline">{setoranRecords?.total ?? 0} total transaksi</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loadingRecords ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !setoranRecords?.data || setoranRecords.data.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm">Belum ada catatan setoran</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-6">Tanggal & Waktu</th>
                    <th className="p-3">Nasabah</th>
                    <th className="p-3">Rincian Item</th>
                    <th className="p-3 text-right">Total Nilai</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {setoranRecords.data.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 pl-6 font-medium text-slate-800">
                        {formatTanggal(item.createdAt)}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {item.nasabahId?.nama || "Warga"}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.items?.map((it) => `${it.namaJenis} (${it.berat}kg)`).join(", ")}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700">
                        {formatRupiah(item.total)}
                      </td>
                      <td className="p-3">
                        <Badge variant={item.status === "AKTIF" ? "success" : "destructive"}>
                          {item.status}
                        </Badge>
                        {item.status === "DIBATALKAN" && item.alasanBatal && (
                          <span className="block text-[10px] text-rose-600 mt-0.5">
                            {item.alasanBatal}
                          </span>
                        )}
                      </td>
                      <td className="p-3 pr-6 text-right">
                        {item.status === "AKTIF" ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs font-semibold active:scale-95"
                            onClick={() => {
                              setCancelModalItem(item);
                              setCancelReason("");
                            }}
                          >
                            <RotateCcw className="mr-1 h-3 w-3" /> Batalkan
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sudah dikoreksi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slip Setoran Success Receipt Modal */}
      <Dialog
        isOpen={!!lastCreatedSetoran}
        onClose={() => setLastCreatedSetoran(null)}
        title="Struk Bukti Setoran Sampah"
        description="Transaksi berhasil disimpan ke basis data & saldo nasabah telah diperbarui."
      >
        {lastCreatedSetoran && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span className="font-semibold">{formatTanggal(lastCreatedSetoran.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Petugas Penerima:</span>
                <span className="font-semibold">{currentOfficer?.nama}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-right">Berat</th>
                    <th className="p-2.5 text-right">Harga/kg</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lastCreatedSetoran.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2.5 font-medium">{item.namaJenis}</td>
                      <td className="p-2.5 text-right">{formatBerat(item.berat)}</td>
                      <td className="p-2.5 text-right">{formatRupiah(item.hargaPerKg)}</td>
                      <td className="p-2.5 text-right font-semibold text-emerald-700">
                        {formatRupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="p-3 text-right">
                      Total Saldo Ditambahkan:
                    </td>
                    <td className="p-3 text-right text-emerald-800 text-sm">
                      {formatRupiah(lastCreatedSetoran.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 active:scale-95"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="mr-1.5 h-4 w-4" /> Cetak Bukti Struk
              </Button>
              <Button
                variant="eco"
                className="flex-1 active:scale-95"
                onClick={() => setLastCreatedSetoran(null)}
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Cancellation / Correction Modal */}
      <Dialog
        isOpen={!!cancelModalItem}
        onClose={() => setCancelModalItem(null)}
        title="Konfirmasi Pembatalan & Koreksi Setoran"
        description="Tindakan ini tidak menghapus data, melainkan mencatat mutasi KOREKSI negatif pada saldo nasabah."
      >
        {cancelModalItem && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <p>
                Saldo nasabah akan dikurangi kembali sebesar{" "}
                <span className="font-bold">{formatRupiah(cancelModalItem.total)}</span> sesuai nilai
                setoran awal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alasan" className="text-xs">
                Alasan Pembatalan *
              </Label>
              <Input
                id="alasan"
                placeholder="Contoh: Salah timbang berat botol atau dobel input"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 active:scale-95"
                onClick={() => setCancelModalItem(null)}
              >
                Kembali
              </Button>
              <Button
                variant="destructive"
                className="flex-1 active:scale-95"
                disabled={cancelMutation.isPending || !cancelReason.trim()}
                onClick={() => cancelMutation.mutate()}
              >
                {cancelMutation.isPending ? "Memproses..." : "Ya, Batalkan & Koreksi"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
