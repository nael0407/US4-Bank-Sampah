"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { User, Mail, Phone, MapPin, Wallet, ShieldCheck } from "lucide-react";

export default function ProfilPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profil Buku Tabungan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Informasi akun nasabah terdaftar di Bank Sampah RW.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-md shadow-emerald-600/30">
            {user?.nama?.charAt(0).toUpperCase() || "N"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{user?.nama}</CardTitle>
              <Badge variant="success">Nasabah Aktif</Badge>
            </div>
            <CardDescription className="mt-0.5">{user?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Wallet className="h-4 w-4 text-emerald-600" />
                <span>Saldo Buku Besar</span>
              </div>
              <p className="text-lg font-bold text-emerald-700">{formatRupiah(user?.saldo || 0)}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Status Akun</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {user?.aktif ? "Terverifikasi Aktif" : "Nonaktif"}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Nomor WhatsApp / HP</span>
                <span className="text-sm font-medium text-slate-800">
                  {user?.noHp || "Belum ditambahkan"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Alamat / RT / RW</span>
                <span className="text-sm font-medium text-slate-800">
                  {user?.alamat || "Belum ditambahkan"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
