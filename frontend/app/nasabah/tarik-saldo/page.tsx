"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fireCelebrationConfetti } from "@/lib/confetti";
import {
  Wallet,
  Banknote,
  Smartphone,
  ArrowRight,
  Clock,
  Loader2,
  Info,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

interface PenarikanItem {
  _id: string;
  id?: string;
  jumlah: number;
  metode: "TUNAI" | "E_WALLET";
  status: "PENDING" | "DISETUJUI" | "DITOLAK";
  ewallet?: {
    provider: string;
    nomor: string;
  };
  catatan?: string;
  catatanPetugas?: string;
  createdAt: string;
}

export default function TarikSaldoPage() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [jumlah, setJumlah] = useState<number | "">("");
  const [metode, setMetode] = useState<"TUNAI" | "E_WALLET">("TUNAI");
  const [provider, setProvider] = useState<string>("GOPAY");
  const [nomorHp, setNomorHp] = useState<string>("");

  // Get current balance
  const { data: saldoData, isLoading: loadingSaldo } = useQuery<{ saldo: number }>({
    queryKey: ["saldo-nasabah"],
    queryFn: () => apiClient("/api/saldo"),
  });

  // Get withdrawal history
  const { data: penarikanData, isLoading: loadingPenarikan } = useQuery<{
    data: PenarikanItem[];
    total: number;
  }>({
    queryKey: ["penarikan-nasabah-list"],
    queryFn: () => apiClient("/api/penarikan?limit=20"),
  });

  const saldo = saldoData?.saldo ?? 0;

  // Submit withdrawal mutation
  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        jumlah: Number(jumlah),
        metode,
      };

      if (metode === "E_WALLET") {
        payload.ewallet = {
          provider,
          nomor: nomorHp,
        };
      }

      return apiClient("/api/penarikan", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      fireCelebrationConfetti();
      toast.success("Pengajuan penarikan berhasil dikirim ke meja petugas!");
      setJumlah("");
      setNomorHp("");
      queryClient.invalidateQueries({ queryKey: ["saldo-nasabah"] });
      queryClient.invalidateQueries({ queryKey: ["penarikan-nasabah-list"] });
      refreshUser();
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengajukan penarikan.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(jumlah);
    if (!num || num <= 0) {
      toast.error("Masukkan nominal penarikan yang valid");
      return;
    }
    if (num > saldo) {
      toast.error("Nominal penarikan melebihi saldo aktif Anda");
      return;
    }
    if (metode === "E_WALLET" && (!nomorHp || nomorHp.length < 9)) {
      toast.error("Masukkan nomor akun e-wallet yang valid");
      return;
    }

    mutation.mutate();
  };

  const setNominal = (val: number) => {
    setJumlah(Math.min(val, saldo));
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tarik Saldo</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Cairkan saldo hasil tabungan sampah ke uang tunai atau dompet digital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200/80 shadow-md">
            <CardHeader className="pb-4 bg-emerald-50/40 rounded-t-2xl border-b border-emerald-100/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Formulir Pencairan</CardTitle>
                  <CardDescription>Pilih metode dan tentukan jumlah penarikan</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Saldo Anda</span>
                  {loadingSaldo ? (
                    <Skeleton className="h-5 w-20" />
                  ) : (
                    <span className="text-sm font-bold text-emerald-700">{formatRupiah(saldo)}</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-5">
                {/* Method Selection with Tactile Animation */}
                <div className="space-y-2">
                  <Label>Metode Pencairan</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMetode("TUNAI")}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                        metode === "TUNAI"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Banknote className="h-4 w-4" /> Uang Tunai
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetode("E_WALLET")}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                        metode === "E_WALLET"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Smartphone className="h-4 w-4" /> E-Wallet
                    </button>
                  </div>
                </div>

                {/* E-wallet Details */}
                {metode === "E_WALLET" && (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Pilih Provider E-Wallet</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {["GOPAY", "OVO", "DANA", "SHOPEEPAY"].map((prov) => (
                          <button
                            key={prov}
                            type="button"
                            onClick={() => setProvider(prov)}
                            className={`py-2 px-1 text-xs font-bold rounded-lg border-2 transition-all active:scale-95 ${
                              provider === prov
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="nomorHp" className="text-xs">
                        Nomor HP Terdaftar ({provider})
                      </Label>
                      <Input
                        id="nomorHp"
                        placeholder="081234567890"
                        value={nomorHp}
                        onChange={(e) => setNomorHp(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="jumlah">Nominal Penarikan (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">
                      Rp
                    </span>
                    <Input
                      id="jumlah"
                      type="number"
                      placeholder="Contoh: 50000"
                      className="pl-10 text-base font-semibold"
                      value={jumlah}
                      onChange={(e) => setJumlah(e.target.value === "" ? "" : Number(e.target.value))}
                      max={saldo}
                      min={1000}
                      required
                    />
                  </div>

                  {/* Interactive Quick Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[10000, 20000, 50000, 100000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNominal(val)}
                        disabled={val > saldo}
                        className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 active:scale-95 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                      >
                        {formatRupiah(val)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setJumlah(saldo)}
                      disabled={saldo <= 0}
                      className="text-xs font-bold py-1.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      Tarik Semua ({formatRupiah(saldo)})
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
                  <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                  <p>
                    {metode === "TUNAI"
                      ? "Penarikan tunai dapat diambil langsung ke meja petugas bank sampah setelah status pengajuan disetujui."
                      : "Untuk penarikan e-wallet, petugas akan mentransfer ke nomor akun dompet digital yang Anda isi setelah diverifikasi."}
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="eco"
                  className="w-full h-12 text-base font-bold shadow-md shadow-emerald-600/30 active:scale-95"
                  disabled={mutation.isPending || saldo <= 0}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim Pengajuan...
                    </>
                  ) : (
                    <>
                      Kirim Pengajuan Penarikan <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>

        {/* Info & Status Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base">Pengajuan Terakhir</CardTitle>
              <CardDescription>Status persetujuan oleh petugas</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {loadingPenarikan ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : !penarikanData?.data || penarikanData.data.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Clock className="mx-auto h-6 w-6 text-slate-300 mb-1" />
                  <p className="text-xs">Belum ada pengajuan penarikan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {penarikanData.data.slice(0, 5).map((p) => (
                    <div
                      key={p._id || p.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{formatRupiah(p.jumlah)}</span>
                        <Badge
                          variant={
                            p.status === "DISETUJUI"
                              ? "success"
                              : p.status === "PENDING"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>
                          {p.metode === "TUNAI"
                            ? "Tunai"
                            : `${p.ewallet?.provider || "E-Wallet"} (${p.ewallet?.nomor})`}
                        </span>
                        <span>{formatTanggal(p.createdAt)}</span>
                      </div>
                      {(p.catatan || p.catatanPetugas) && (
                        <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200/60 mt-1">
                          Catatan: {p.catatan || p.catatanPetugas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
