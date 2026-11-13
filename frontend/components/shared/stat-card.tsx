import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  className?: string;
  colorScheme?: "emerald" | "blue" | "amber" | "rose" | "slate";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  colorScheme = "emerald",
}: StatCardProps) {
  const schemeClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[colorScheme];

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", schemeClasses)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
          {(subtitle || trend) && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
              {subtitle && <span>{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
