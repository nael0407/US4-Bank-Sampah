"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  History,
  ArrowDownRight,
  MapPin,
  User,
  Scale,
  Wallet,
  Tags,
  Users,
  BarChart3,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const nasabahNav = [
    { label: "Dashboard", href: "/nasabah/dashboard", icon: LayoutDashboard },
    { label: "Riwayat & Mutasi", href: "/nasabah/riwayat", icon: History },
    { label: "Tarik Saldo", href: "/nasabah/tarik-saldo", icon: ArrowDownRight },
    { label: "Titik & Jadwal Jemput", href: "/nasabah/jadwal-jemput", icon: MapPin },
    { label: "Profil Akun", href: "/nasabah/profil", icon: User },
  ];

  const petugasNav = [
    { label: "Dashboard", href: "/petugas/dashboard", icon: LayoutDashboard },
    { label: "Input Setoran (POS)", href: "/petugas/setoran", icon: Scale },
    { label: "Persetujuan Penarikan", href: "/petugas/penarikan", icon: Wallet },
  ];

  const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Jenis & Harga Sampah", href: "/admin/jenis-sampah", icon: Tags },
    { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
    { label: "Titik Jemput & Jadwal", href: "/admin/titik-jemput", icon: MapPin },
    { label: "Laporan & Statistik", href: "/admin/laporan", icon: BarChart3 },
  ];

  let currentNav = nasabahNav;
  let sectionTitle = "Menu Nasabah";

  if (role === "PETUGAS") {
    currentNav = petugasNav;
    sectionTitle = "Portal Petugas";
  } else if (role === "ADMIN") {
    currentNav = adminNav;
    sectionTitle = "Admin Panel";
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {sectionTitle}
          </span>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4 text-slate-500" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-2">
          {currentNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-800"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-75" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700">Bank Sampah Digital</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tingkat RW • Bersih & Berkah</p>
          </div>
        </div>
      </aside>
    </>
  );
}
