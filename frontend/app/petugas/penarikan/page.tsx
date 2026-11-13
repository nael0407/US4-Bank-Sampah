"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Smartphone,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface PenarikanQueueItem {
  id: string;
  nasabahId: any;
  petugasId?: any;
  jumlah: number;
  metode: "TUNAI" | "E_WALLET";
  status: "PENDING" | "DISETUJUI" | "DITOLAK";
  ewallet?: {
    provider: string;
    nomor: string;
  };
  catatanPetugas?: string;
  createdAt: string;
}

export default function PetugasPenarikanPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");

  // Approval / Rejection modal state
  const [actionItem, setActionItem] = useState<{
    item: PenarikanQueueItem;
    type: "SETUJUI" | "TOLAK";
  } | null>(null);
  const [catatan, setCatatan] = useState<string>("");

  const { data: response, isLoading } = useQuery<{
    data: PenarikanQueueItem[];
    total: number;
  }>({
    queryKey: ["petugas-penarikan-queue", filterStatus],
    queryFn: () => {
      const url =
        filterStatus === "ALL"
          ? "/api/penarikan?limit=50"
          : `/api/penarikan?status=${filterStatus}&limit=50`;
      return apiClient(url);
    },
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, catatan }: { id: string; catatan?: string }) => {
      return apiClient(`/api/penarikan/${id}/setujui`, {
        method: "PATCH",
        body: JSON.stringify({ catatan: catatan || "Penarikan telah disetujui & diserahkan" }),
      });
    },
    onSuccess: () => {
      toast.success("Penarikan disetujui! Saldo nasabah telah didebit & email notifikasi terkirim.");
      setActionItem(null);
      setCatatan("");
      queryClient.invalidateQueries({ queryKey: ["petugas-penarikan-queue"] });
      queryClient.invalidateQueries({ queryKey: ["petugas-pending-penarikan"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menyetujui penarikan.");
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, catatan }: { id: string; catatan: string }) => {
      return apiClient(`/api/penarikan/${id}/tolak`, {
        method: "PATCH",
        body: JSON.stringify({ catatan }),
      });
    },
    onSuccess: () => {
      toast.info("Penarikan ditolak. Email pemberitahuan telah dikirim ke nasabah.");
      setActionItem(null);
      setCatatan("");
      queryClient.invalidateQueries({ queryKey: ["petugas-penarikan-queue"] });
      queryClient.invalidateQueries({ queryKey: ["petugas-pending-penarikan"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menolak penarikan.");
    },
  });

  const handleConfirmAction = () => {
    if (!actionItem) return;
    if (actionItem.type === "SETUJUI") {
      approveMutation.mutate({ id: actionItem.item.id, catatan });
    } else {
      if (!catatan.trim()) {
        toast.error("Alasan penolakan wajib diisi");
        return;
      }
      rejectMutation.mutate({ id: actionItem.item.id, catatan });
    }
  };

  const list = response?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Antrean Persetujuan Penarikan Saldo
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verifikasi dan proses pencairan dana saldo warga (uang tunai atau e-wallet).
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
          {["PENDING", "DISETUJUI", "DITOLAK", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === st
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st === "ALL" ? "Semua" : st}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <span>Daftar Permintaan Penarikan</span>
          </CardTitle>
          <span className="text-xs text-slate-400">Total {response?.total ?? 0} permohonan</span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm">Tidak ada permintaan dengan status {filterStatus}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-6">Tanggal Pengajuan</th>
                    <th className="p-3">Nasabah</th>
                    <th className="p-3">Metode & Tujuan</th>
                    <th className="p-3 text-right">Nominal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-6 text-right">Tindakan Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {list.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 pl-6 font-medium text-slate-800">
                        {formatTanggal(item.createdAt)}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">
                          {item.nasabahId?.nama || "Nasabah"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.nasabahId?.email || ""}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-medium">
                          {item.metode === "TUNAI" ? (
                            <>
                              <Banknote className="h-4 w-4 text-emerald-600" />
                              <span>Uang Tunai (Meja Pos)</span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="h-4 w-4 text-blue-600" />
                              <span>
                                {item.ewallet?.provider}: <b>{item.ewallet?.nomor}</b>
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-sm text-slate-900">
                        {formatRupiah(item.jumlah)}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            item.status === "DISETUJUI"
                              ? "success"
                              : item.status === "PENDING"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                        {item.catatanPetugas && (
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            {item.catatanPetugas}
                          </span>
                        )}
                      </td>
                      <td className="p-3 pr-6 text-right">
                        {item.status === "PENDING" ? (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
                              onClick={() => {
                                setActionItem({ item, type: "SETUJUI" });
                                setCatatan("");
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold"
                              onClick={() => {
                                setActionItem({ item, type: "TOLAK" });
                                setCatatan("");
                              }}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sudah diproses</span>
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

      {/* Action Confirmation Modal */}
      <Dialog
        isOpen={!!actionItem}
        onClose={() => setActionItem(null)}
        title={
          actionItem?.type === "SETUJUI"
            ? "Persetujuan Penarikan Dana"
            : "Tolak Pengajuan Penarikan"
        }
        description={
          actionItem?.type === "SETUJUI"
            ? `Konfirmasi bahwa uang sebesar ${formatRupiah(
                actionItem.item.jumlah
              )} telah diserahkan atau ditransfer ke nasabah.`
            : "Nasabah akan menerima pemberitahuan email mengenai alasan penolakan ini."
        }
      >
        {actionItem && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nasabah:</span>
                <span className="font-semibold">{actionItem.item.nasabahId?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Penarikan:</span>
                <span className="font-bold text-emerald-700">
                  {formatRupiah(actionItem.item.jumlah)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tujuan:</span>
                <span className="font-medium">
                  {actionItem.item.metode === "TUNAI"
                    ? "Uang Tunai"
                    : `${actionItem.item.ewallet?.provider} (${actionItem.item.ewallet?.nomor})`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan" className="text-xs">
                {actionItem.type === "SETUJUI"
                  ? "Catatan Serah Terima (Opsional)"
                  : "Alasan Penolakan *"}
              </Label>
              <Input
                id="catatan"
                placeholder={
                  actionItem.type === "SETUJUI"
                    ? "Contoh: Tunai diterima langsung / Ref transfer #8921"
                    : "Contoh: Nomor e-wallet tidak aktif / belum diverifikasi"
                }
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                required={actionItem.type === "TOLAK"}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActionItem(null)}
              >
                Batal
              </Button>
              <Button
                className={`flex-1 ${
                  actionItem.type === "SETUJUI"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
                disabled={
                  approveMutation.isPending ||
                  rejectMutation.isPending ||
                  (actionItem.type === "TOLAK" && !catatan.trim())
                }
                onClick={handleConfirmAction}
              >
                {approveMutation.isPending || rejectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : actionItem.type === "SETUJUI" ? (
                  "Konfirmasi Setujui"
                ) : (
                  "Konfirmasi Tolak"
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
