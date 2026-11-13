"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatBerat } from "@/lib/utils";
import { fireEcoConfetti } from "@/lib/confetti";
import {
  Sparkles,
  TreePine,
  CloudSun,
  Zap,
  TrendingUp,
  Plus,
  RotateCcw,
  Recycle,
  Check,
} from "lucide-react";

interface WastePreset {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  icon: string;
  co2Factor: number; // kg CO2 saved per kg waste
  treeFactor: number; // trees preserved per 100 kg
  energyFactor: number; // kWh saved per kg
  color: string;
}

const PRESETS: WastePreset[] = [
  {
    id: "plastik",
    name: "Botol Plastik PET",
    category: "Plastik",
    defaultPrice: 3500,
    icon: "🧴",
    co2Factor: 1.5,
    treeFactor: 0.05,
    energyFactor: 5.7,
    color: "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50",
  },
  {
    id: "kardus",
    name: "Kardus Bersih",
    category: "Kertas",
    defaultPrice: 2200,
    icon: "📦",
    co2Factor: 0.9,
    treeFactor: 0.17, // 1 ton paper = ~17 trees
    energyFactor: 4.0,
    color: "border-amber-300 bg-amber-50/50 hover:bg-amber-50",
  },
  {
    id: "kaleng",
    name: "Kaleng / Logam",
    category: "Logam",
    defaultPrice: 14000,
    icon: "🥫",
    co2Factor: 9.0, // recycling aluminium saves 90%+ energy
    treeFactor: 0.02,
    energyFactor: 14.0,
    color: "border-blue-300 bg-blue-50/50 hover:bg-blue-50",
  },
  {
    id: "kertas",
    name: "Kertas HVS / Arsip",
    category: "Kertas",
    defaultPrice: 2800,
    icon: "📄",
    co2Factor: 1.0,
    treeFactor: 0.15,
    energyFactor: 4.2,
    color: "border-slate-300 bg-slate-50/80 hover:bg-slate-100",
  },
  {
    id: "kaca",
    name: "Botol Kaca",
    category: "Kaca",
    defaultPrice: 1000,
    icon: "🍾",
    co2Factor: 0.3,
    treeFactor: 0.01,
    energyFactor: 1.2,
    color: "border-teal-300 bg-teal-50/50 hover:bg-teal-50",
  },
  {
    id: "jelantah",
    name: "Minyak Jelantah",
    category: "Cair",
    defaultPrice: 7500,
    icon: "🛢️",
    co2Factor: 2.8, // prevent water pollution and biodiesel
    treeFactor: 0.08,
    energyFactor: 8.5,
    color: "border-orange-300 bg-orange-50/50 hover:bg-orange-50",
  },
];

export function EcoSimulator() {
  const [selectedWaste, setSelectedWaste] = useState<WastePreset>(PRESETS[0]);
  const [weight, setWeight] = useState<number>(5);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const estimatedRupiah = Math.round(weight * selectedWaste.defaultPrice);
  const co2Saved = (weight * selectedWaste.co2Factor).toFixed(1);
  const treesSaved = (weight * selectedWaste.treeFactor).toFixed(2);
  const energySaved = (weight * selectedWaste.energyFactor).toFixed(1);

  const addWeight = (delta: number) => {
    setWeight((prev) => Math.min(100, Math.max(0.5, Math.round((prev + delta) * 10) / 10)));
  };

  const handleSimulate = () => {
    fireEcoConfetti();
    setHasCelebrated(true);
    setTimeout(() => setHasCelebrated(false), 2000);
  };

  return (
    <Card className="overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/30 shadow-xl">
      <CardHeader className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse-glow">
              <Recycle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Simulasi Tabungan & Dampak Lingkungan
                <Badge variant="success" className="animate-bounce-subtle text-[11px]">
                  Interaktif
                </Badge>
              </CardTitle>
              <CardDescription>
                Pilih jenis sampah & atur berat untuk melihat saldo dan kontribusi hijau Anda.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2 space-y-6">
        {/* Waste Category Selector Tiles */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            1. Pilih Jenis Sampah
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PRESETS.map((preset) => {
              const isSelected = selectedWaste.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedWaste(preset)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 group active:scale-95 ${
                    isSelected
                      ? "border-emerald-600 bg-white shadow-md shadow-emerald-600/20 scale-[1.03]"
                      : `${preset.color} hover:scale-[1.02]`
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-2 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] shadow">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {preset.icon}
                  </span>
                  <span className="text-xs font-bold text-slate-800 text-center leading-tight">
                    {preset.name}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1">
                    {formatRupiah(preset.defaultPrice)}/kg
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Weight Controls */}
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              2. Tentukan Berat Timbangan
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Nilai saat ini:</span>
              <span className="text-xl font-extrabold text-emerald-600 animate-pulse-glow">
                {formatBerat(weight)}
              </span>
            </div>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min="0.5"
            max="30"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 transition-all"
          />

          {/* Quick Increment Shortcut Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              {[0.5, 1, 2, 5, 10].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => addWeight(inc)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 transition"
                >
                  +{inc} kg
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setWeight(5)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="h-3 w-3" /> Reset 5kg
            </button>
          </div>
        </div>

        {/* Live Calculation Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Main Rupiah Card */}
          <div className="sm:col-span-1 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white flex flex-col justify-between shadow-lg shadow-emerald-700/20">
            <div>
              <span className="text-xs font-medium text-emerald-200 block">Saldo Masuk Buku Besar</span>
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-emerald-50">
                {formatRupiah(estimatedRupiah)}
              </div>
            </div>
            <p className="text-[11px] text-emerald-100 mt-3">
              Langsung bisa dicairkan tunai atau transfer e-wallet.
            </p>
          </div>

          {/* Eco Metric 1: CO2 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Emisi CO₂ Dicegah</span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CloudSun className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800">{co2Saved} kg</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Jejak karbon berkurang</span>
            </div>
          </div>

          {/* Eco Metric 2: Trees */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Pohon Diselamatkan</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TreePine className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-emerald-700">{treesSaved} Pohon</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Kelestarian hutan RW</span>
            </div>
          </div>

          {/* Eco Metric 3: Energy */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Energi Dihemat</span>
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-amber-600">{energySaved} kWh</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Setara daya rumah tangga</span>
            </div>
          </div>
        </div>

        {/* Interactive Action Button with Confetti */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            Setiap 1 kg sampah yang dipilah mencegah pencemaran tanah dan selokan di lingkungan RW kita!
          </p>

          <Button
            type="button"
            onClick={handleSimulate}
            variant="eco"
            className="w-full sm:w-auto h-11 text-sm font-bold shadow-md shadow-emerald-600/30 active:scale-95"
          >
            {hasCelebrated ? (
              <>🎉 Luar Biasa! Dampak Dihitung!</>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Cek Dampak Hijau Anda
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
