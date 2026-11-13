import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBerat(kg: number): string {
  return `${Number(kg).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} kg`;
}

export function formatTanggal(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatTanggalSaja(dateStr: string | Date): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(d);
}
