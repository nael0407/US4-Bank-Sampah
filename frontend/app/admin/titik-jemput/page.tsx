"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Trash2, Clock, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MapPoint } from "@/components/shared/leaflet-map";
import { HARI, Hari } from "@bank-sampah/shared";

const LeafletMap = dynamic(() => import("@/components/shared/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full rounded-2xl" />,
});

interface TitikJemputItem {
  id: string;
  _id?: string;
  nama: string;
  alamat: string;
  lokasi: {
    lat?: number;
    lng?: number;
    type?: string;
    coordinates?: [number, number]; // fallback [lng, lat]
  };
  jadwal: Array<{
    hari: string;
    jamMulai: string;
    jamSelesai: string;
  }>;
}

export default function AdminTitikJemputPage() {
  const queryClient = useQueryClient();

  // Form states
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [lat, setLat] = useState<number | "">(-7.7713);
  const [lng, setLng] = useState<number | "">(110.3776);
  const [jadwalList, setJadwalList] = useState<Array<{ hari: Hari; jamMulai: string; jamSelesai: string }>>([
    { hari: "MINGGU", jamMulai: "08:00", jamSelesai: "11:00" },
  ]);

  const { data: response, isLoading } = useQuery<{ data: TitikJemputItem[] }>({
    queryKey: ["admin-titik-jemput-list"],
    queryFn: () => apiClient("/api/titik-jemput"),
  });

  const list = response?.data || [];

  const mapPoints: MapPoint[] = list.map((item) => ({
    id: item.id || item._id || "",
    nama: item.nama,
    alamat: item.alamat,
    lat: item.lokasi?.lat ?? item.lokasi?.coordinates?.[1] ?? 0,
    lng: item.lokasi?.lng ?? item.lokasi?.coordinates?.[0] ?? 0,
    jadwal: item.jadwal,
  }));

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!lat || !lng) throw new Error("Koordinat lokasi wajib ditentukan");

      return apiClient("/api/titik-jemput", {
        method: "POST",
        body: JSON.stringify({
          nama,
          alamat,
          lokasi: {
            lat: Number(lat),
            lng: Number(lng),
          },
          jadwal: jadwalList,
        }),
      });
    },
    onSuccess: () => {
      toast.success("Titik jemput pos timbang berhasil ditambahkan!");
      setNama("");
      setAlamat("");
      queryClient.invalidateQueries({ queryKey: ["admin-titik-jemput-list"] });
      queryClient.invalidateQueries({ queryKey: ["titik-jemput-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menambahkan titik jemput.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient(`/api/titik-jemput/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Titik jemput berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["admin-titik-jemput-list"] });
      queryClient.invalidateQueries({ queryKey: ["titik-jemput-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menghapus titik jemput.");
    },
  });

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setLat(Math.round(coords.lat * 1000000) / 1000000);
    setLng(Math.round(coords.lng * 1000000) / 1000000);
    toast.info(`Koordinat dipilih: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
  };

  const addJadwalRow = () => {
    setJadwalList((prev) => [
      ...prev,
      { hari: "MINGGU", jamMulai: "08:00", jamSelesai: "11:00" },
    ]);
  };

  const removeJadwalRow = (index: number) => {
    if (jadwalList.length === 1) return;
    setJadwalList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Titik Jemput & Pos Timbang RW
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Atur lokasi penampungan di peta dan jadwal operasional timbang keliling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map on Left */}
        <div className="lg:col-span-7 space-y-2">
          <LeafletMap
            points={mapPoints}
            height="460px"
            onMapClick={handleMapClick}
            selectedCoord={lat && lng ? { lat: Number(lat), lng: Number(lng) } : null}
          />
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Navigation className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <b>Tip:</b> Klik langsung di peta untuk memilih koordinat latitude & longitude lokasi pos baru. Pin merah menandai titik yang dipilih.
            </span>
          </div>
        </div>

        {/* Add Form on Right */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Tambah Pos Jemput Baru</span>
              </CardTitle>
              <CardDescription>Input nama lokasi, koordinat, dan waktu buka</CardDescription>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!nama || !alamat) {
                  toast.error("Nama pos dan alamat wajib diisi");
                  return;
                }
                createMutation.mutate();
              }}
            >
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nama" className="text-xs">
                    Nama Pos Timbang / Drop Point *
                  </Label>
                  <Input
                    id="nama"
                    placeholder="Contoh: Balai RW 04 / Lapangan Voli"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="alamat" className="text-xs">
                    Alamat Lengkap *
                  </Label>
                  <Input
                    id="alamat"
                    placeholder="Contoh: Jl. Kenanga RT 02 / RW 04"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="lat" className="text-xs">
                      Latitude
                    </Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.000001"
                      value={lat}
                      onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lng" className="text-xs">
                      Longitude
                    </Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.000001"
                      value={lng}
                      onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Jadwal Repeater */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Jadwal Operasional</Label>
                    <button
                      type="button"
                      onClick={addJadwalRow}
                      className="text-[11px] font-semibold text-emerald-600 hover:underline"
                    >
                      + Tambah Hari
                    </button>
                  </div>

                  {jadwalList.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs">
                      <select
                        value={row.hari}
                        onChange={(e) => {
                          const updated = [...jadwalList];
                          updated[idx].hari = e.target.value as Hari;
                          setJadwalList(updated);
                        }}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium"
                      >
                        {HARI.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>

                      <Input
                        type="time"
                        value={row.jamMulai}
                        onChange={(e) => {
                          const updated = [...jadwalList];
                          updated[idx].jamMulai = e.target.value;
                          setJadwalList(updated);
                        }}
                        className="h-9 text-xs px-1.5"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={row.jamSelesai}
                        onChange={(e) => {
                          const updated = [...jadwalList];
                          updated[idx].jamSelesai = e.target.value;
                          setJadwalList(updated);
                        }}
                        className="h-9 text-xs px-1.5"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                        disabled={jadwalList.length === 1}
                        onClick={() => removeJadwalRow(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 mt-2 font-semibold"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Tambahkan Pos ke Peta"
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>

      {/* List of existing pickup points */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base">Daftar Titik Penjemputan Aktif</CardTitle>
          <CardDescription>Semua lokasi yang tampil di aplikasi nasabah</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Belum ada titik penjemputan terdaftar
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {list.map((item) => {
                const itemId = item.id || item._id || item.nama;
                const itemLat = item.lokasi?.lat ?? item.lokasi?.coordinates?.[1];
                const itemLng = item.lokasi?.lng ?? item.lokasi?.coordinates?.[0];
                return (
                <div
                  key={itemId}
                  className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.nama}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.alamat}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.jadwal?.map((j, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          <Clock className="mr-1 h-3 w-3 text-emerald-600" />
                          {j.hari} ({j.jamMulai} - {j.jamSelesai})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[11px] font-mono text-slate-400">
                      {itemLat !== undefined && itemLng !== undefined ? `${itemLat.toFixed(4)}, ${itemLng.toFixed(4)}` : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        if (confirm(`Hapus titik penjemputan "${item.nama}"?`)) {
                          deleteMutation.mutate(item.id || item._id || "");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
