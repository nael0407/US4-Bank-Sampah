"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User as UserIcon, Recycle, Menu } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">Admin</Badge>;
      case "PETUGAS":
        return <Badge variant="warning">Petugas</Badge>;
      case "NASABAH":
        return <Badge variant="success">Nasabah</Badge>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
            <Recycle className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Bank Sampah RW</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              US4 Digital
            </span>
          </div>
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          {user.role === "NASABAH" && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-500 font-medium">Saldo Anda</span>
              <span className="text-sm font-bold text-emerald-700">{formatRupiah(user.saldo || 0)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 leading-none">{user.nama}</span>
              <span className="text-xs text-slate-500 mt-0.5">{user.email}</span>
            </div>
            {getRoleBadge(user.role)}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            title="Keluar"
          >
            <LogOut className="h-4 w-4 md:mr-1.5" />
            <span className="hidden md:inline">Keluar</span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Daftar Nasabah</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
