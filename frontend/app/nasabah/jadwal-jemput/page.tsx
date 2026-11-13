"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Navigation } from "lucide-react";
import type { MapPoint } from "@/components/shared/leaflet-map";

const LeafletMap = dynamic(() => import("@/components/shared/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] w-full rounded-2xl" />,
});

interface TitikJemputApi {
  _id: string;
  nama: string;
  alamat: string;
  lokasi: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  jadwal: Array<{
    hari: string;
    jamMulai: string;
    jamSelesai: string;
  }>;
}

export default function JadwalJemputPage() {
  const { data: response, isLoading } = useQuery<{ data: TitikJemputApi[] }>({
    queryKey: ["titik-jemput-list"],
    queryFn: () => apiClient("/api/titik-jemput"),
  });

  const rawList = response?.data || [];

  const mapPoints: MapPoint[] = rawList.map((item) => ({
    id: item._id,
    nama: item.nama,
    alamat: item.alamat,
    lat: item.lokasi?.coordinates ? item.lokasi.coordinates[1] : 0,
    lng: item.lokasi?.coordinates ? item.lokasi.coordinates[0] : 0,
    jadwal: item.jadwal,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Titik & Jadwal Penjemputan</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Peta interaktif pos penampungan dan waktu operasional timbang keliling di lingkungan RW.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 space-y-2">
          <LeafletMap points={mapPoints} height="480px" />
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Navigation className="h-3 w-3" /> Klik pada penanda pin hijau di peta untuk melihat jam jemput dan alamat lengkap.
          </p>
        </div>

        {/* Schedule Sidebar List */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Daftar Pos Timbang RW</span>
              </CardTitle>
              <CardDescription>Jadwal operasional penimbangan warga</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : rawList.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Calendar className="mx-auto h-6 w-6 text-slate-300 mb-1" />
                  <p className="text-xs">Belum ada titik jemput aktif</p>
                </div>
              ) : (
                rawList.map((titik) => (
                  <div
                    key={titik._id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition text-xs space-y-2"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{titik.nama}</h4>
                      <p className="text-slate-500 mt-0.5">{titik.alamat}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Jadwal Buka:
                      </span>
                      {titik.jadwal && titik.jadwal.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {titik.jadwal.map((j, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] bg-white border border-slate-200 text-slate-700"
                            >
                              <Clock className="mr-1 h-3 w-3 text-emerald-600" />
                              {j.hari} ({j.jamMulai} - {j.jamSelesai})
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada jadwal</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
