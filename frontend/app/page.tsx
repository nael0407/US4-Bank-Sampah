"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Recycle,
  Scale,
  Wallet,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
  TreePine,
  Lightbulb,
  HeartHandshake,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";
import { EcoSimulator } from "@/components/shared/eco-simulator";
import { fireEcoConfetti } from "@/lib/confetti";

interface JenisSampah {
  _id: string;
  nama: string;
  kategori: string;
  hargaPerKg: number;
  aktif: boolean;
}

const ECO_FACTS = [
  {
    icon: "🧴",
    title: "Botol Plastik PET",
    fact: "Daur ulang 1 botol plastik menghemat energi yang cukup untuk menyalakan lampu 60W selama 6 jam!",
    tip: "Kempiskan botol & simpan tutupnya secara terpisah.",
  },
  {
    icon: "📦",
    title: "Kardus & Karton",
    fact: "Mendaur ulang 1 ton kardus menyelamatkan 17 pohon dan menghemat 26.000 liter air bersih.",
    tip: "Pastikan kardus dalam keadaan kering dan bebas lakban berlebih.",
  },
  {
    icon: "🥫",
    title: "Kaleng Minuman",
    fact: "Aluminium dapat didaur ulang tanpa batas tanpa kehilangan kualitas sama sekali!",
    tip: "Bilas kaleng dari sisa cairan manis agar tidak mengundang semut.",
  },
  {
    icon: "🛢️",
    title: "Minyak Jelantah",
    fact: "1 liter minyak jelantah yang dibuang ke saluran air dapat mencemari hingga 1.000.000 liter air!",
    tip: "Kumpulkan di jerigen atau botol kaca tertutup rapat.",
  },
];

export default function LandingPage() {
  const [selectedFactIndex, setSelectedFactIndex] = useState(0);

  const { data: jenisSampahList } = useQuery<JenisSampah[]>({
    queryKey: ["jenis-sampah-public"],
    queryFn: async () => {
      try {
        const res = await apiClient<{ data: JenisSampah[] }>("/api/jenis-sampah");
        return res.data || [];
      } catch {
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section with Floating Leaves & Pulse Badges */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-100/60 via-white to-slate-50 py-20 px-4 md:px-8 border-b border-slate-200/60">
        <div className="absolute top-12 left-10 text-4xl opacity-30 animate-float pointer-events-none select-none">
          🍃
        </div>
        <div className="absolute bottom-16 right-12 text-4xl opacity-30 animate-float [animation-delay:1.5s] pointer-events-none select-none">
          🌱
        </div>
        <div className="absolute top-24 right-20 text-3xl opacity-20 animate-float [animation-delay:0.8s] pointer-events-none select-none">
          ♻️
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <Badge
            variant="success"
            className="px-4 py-1.5 text-sm font-semibold shadow-sm inline-flex items-center gap-1.5 animate-pulse-glow"
          >
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Digitalisasi Pengelolaan Sampah Tingkat RW
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Ubah Sampah Jadi <span className="text-emerald-600 underline decoration-emerald-300">Rupiah</span> Secara Otomatis & Transparan
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
            Selamat tinggal buku tabungan robek dan salah hitung. Setoran sampah ditimbang petugas, tercatat di buku besar digital, dan saldo langsung bisa dicairkan ke uang tunai atau dompet digital.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register">
              <Button
                variant="eco"
                size="lg"
                className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-emerald-600/25 active:scale-95"
                onClick={() => fireEcoConfetti()}
              >
                Daftar Sebagai Nasabah <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 h-12 hover:border-emerald-300 active:scale-95"
              >
                Masuk ke Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Credentials Box */}
      <section className="py-6 px-4 max-w-4xl mx-auto w-full">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-3 text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Akun Pengujian Cepat (Demo Akun Dosen / Evaluator)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition">
              <span className="font-bold text-slate-800 block">👑 Admin</span>
              <p className="text-slate-500 font-mono mt-1">admin@banksampah.id</p>
              <p className="text-slate-400 font-mono">admin12345</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition">
              <span className="font-bold text-slate-800 block">⚖️ Petugas</span>
              <p className="text-slate-500 font-mono mt-1">petugas@banksampah.id</p>
              <p className="text-slate-400 font-mono">petugas12345</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition">
              <span className="font-bold text-slate-800 block">👤 Nasabah</span>
              <p className="text-slate-500 font-mono mt-1">nasabah@banksampah.id</p>
              <p className="text-slate-400 font-mono">nasabah12345</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Eco Simulator Section */}
      <section className="py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <EcoSimulator />
      </section>

      {/* Interactive Waste Facts & Sorting Guide */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-2">Edukasi Warga</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Fakta & Panduan Memilah Sampah RW
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Klik kategori di bawah ini untuk melihat dampak daur ulang dan tips pemilahannya.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {ECO_FACTS.map((item, idx) => {
            const isSelected = selectedFactIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedFactIndex(idx)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/70 shadow-md scale-[1.02]"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-3xl block mb-2">{item.icon}</span>
                <span className="font-bold text-sm text-slate-900 block">{item.title}</span>
                <span className="text-xs text-emerald-700 font-medium">Klik untuk fakta ▾</span>
              </button>
            );
          })}
        </div>

        {/* Fact Card Detail */}
        <div className="p-6 rounded-2xl bg-white border border-emerald-200/80 shadow-md flex flex-col sm:flex-row items-center gap-5 animate-in fade-in duration-200">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
            {ECO_FACTS[selectedFactIndex].icon}
          </div>
          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <h4 className="font-bold text-lg text-slate-900">
              {ECO_FACTS[selectedFactIndex].title}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              💡 {ECO_FACTS[selectedFactIndex].fact}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mt-1">
              <TreePine className="h-3.5 w-3.5 text-emerald-600" />
              <span>Tip Warga: {ECO_FACTS[selectedFactIndex].tip}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Waste Prices Section */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-2">Katalog Terbuka</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Daftar Harga Beli Sampah Terkini</h2>
            <p className="text-slate-500 text-sm mt-1">Harga resmi per kilogram yang berlaku untuk setoran saat ini.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {jenisSampahList && jenisSampahList.length > 0 ? (
            jenisSampahList.map((item) => (
              <Card key={item._id} className="hover:border-emerald-400 hover:shadow-md transition-all hover:scale-[1.02] duration-200">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {item.kategori || "Umum"}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-2">{item.nama}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Harga / kg</span>
                    <span className="text-lg font-extrabold text-emerald-600">
                      {formatRupiah(item.hargaPerKg)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Default previews if database not yet populated
            [
              { nama: "Botol Plastik PET", kategori: "Plastik", harga: 3500 },
              { nama: "Kardus Bersih", kategori: "Kertas", harga: 2200 },
              { nama: "Kaleng Minuman / Logam", kategori: "Logam", harga: 14000 },
              { nama: "Kertas Arsip / HVS", kategori: "Kertas", harga: 2800 },
              { nama: "Botol Kaca Bening", kategori: "Kaca", harga: 1000 },
              { nama: "Minyak Jelantah", kategori: "Cair", harga: 7500 },
            ].map((sampah, i) => (
              <Card key={i} className="hover:border-emerald-400 hover:shadow-md transition-all hover:scale-[1.02] duration-200">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {sampah.kategori}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-2">{sampah.nama}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Harga / kg</span>
                    <span className="text-lg font-extrabold text-emerald-600">
                      {formatRupiah(sampah.harga)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-4 md:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Mengapa Bank Sampah Digital?</h2>
            <p className="text-slate-500 mt-2">Didesain khusus memecahkan kendala pencatatan manual di lingkungan warga.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-4 shadow-md shadow-emerald-600/30">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Timbangan & Hitung Otomatis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Petugas hanya memasukkan jenis sampah dan kilogram hasil timbangan. Subtotal dan penambahan saldo dihitung sistem menggunakan harga snapshot transaksi saat itu.
              </p>
            </div>

            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-4 shadow-md shadow-emerald-600/30">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Buku Besar Tanpa Celah</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Setiap mutasi bertipe Setoran, Penarikan, maupun Koreksi tersimpan abadi dalam satu transaksi basis data. Riwayat saldo selalu dapat diaudit kapan saja.
              </p>
            </div>

            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-4 shadow-md shadow-emerald-600/30">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pencairan Fleksibel & Notifikasi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nasabah dapat mengajukan penarikan tunai saat penimbangan atau transfer ke dompet digital (GoPay, OVO, DANA). Notifikasi email dikirim otomatis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-200">US4 — Bank Sampah: Pencatatan Setoran & Saldo Otomatis</p>
            <p className="mt-1">Proyek Akhir Pengembangan Aplikasi Web (Semester 5)</p>
          </div>
          <div className="text-right">
            <p className="text-slate-300">Tim Pengembang:</p>
            <p className="text-slate-400">Theo Immanuel Sanyoto • Arimbi Arum Sari • Natanael Sebastian Simanjuntak • Adnan Abdul Majid</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
