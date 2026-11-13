"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fireEcoConfetti } from "@/lib/confetti";
import { Award, Leaf, TreePine, Droplets, Sparkles, ChevronRight } from "lucide-react";

interface EcoLevelCardProps {
  totalKg?: number;
  totalSetoran?: number;
}

export function EcoLevelCard({ totalKg = 18.5, totalSetoran = 4 }: EcoLevelCardProps) {
  const [celebrated, setCelebrated] = useState(false);

  // Compute tier based on kg
  let tierName = "Warga Pemula Hijau";
  let tierBadge = "Tier 1";
  let nextMilestone = 25;
  let tierIcon = "🌱";

  if (totalKg >= 50) {
    tierName = "Pahlawan Daur Ulang RW";
    tierBadge = "Tier 3 • Legendaris";
    nextMilestone = 100;
    tierIcon = "👑";
  } else if (totalKg >= 15) {
    tierName = "Pejuang Lingkungan RW";
    tierBadge = "Tier 2 • Aktif";
    nextMilestone = 50;
    tierIcon = "🌳";
  }

  const progressPercent = Math.min(100, Math.round((totalKg / nextMilestone) * 100));

  const handleCelebrate = () => {
    fireEcoConfetti();
    setCelebrated(true);
    setTimeout(() => setCelebrated(false), 2500);
  };

  return (
    <Card className="overflow-hidden border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 shadow-sm hover:shadow-md transition">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/30 text-2xl animate-float">
              {tierIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{tierName}</span>
                <Badge variant="success" className="text-[10px] px-2 py-0.5">
                  {tierBadge}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total kontribusi: <b>{totalKg} kg</b> sampah terpilah dari {totalSetoran} kali timbangan
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCelebrate}
            className="self-start sm:self-auto border-emerald-300 text-emerald-800 hover:bg-emerald-50 active:scale-95 shadow-sm"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            {celebrated ? "Terima Kasih! 🎉" : "Rayakan Capaian"}
          </Button>
        </div>

        {/* Progress toward next milestone */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Menuju Milestone Berikutnya: {nextMilestone} kg</span>
            <span className="font-bold text-emerald-700">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Eco impact badges */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center text-xs">
          <div className="p-2 rounded-xl bg-white border border-slate-100">
            <span className="text-emerald-700 font-bold block text-sm">
              {(totalKg * 0.08).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">Pohon Diselamatkan</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-100">
            <span className="text-blue-600 font-bold block text-sm">
              {Math.round(totalKg * 12)} L
            </span>
            <span className="text-[10px] text-slate-400">Air Bersih Terjaga</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-slate-100">
            <span className="text-amber-600 font-bold block text-sm">
              {(totalKg * 1.6).toFixed(1)} kg
            </span>
            <span className="text-[10px] text-slate-400">CO₂ Berkurang</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
