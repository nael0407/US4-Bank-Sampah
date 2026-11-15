"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, Shield, Power, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Role } from "@bank-sampah/shared";

interface UserAccount {
  id: string;
  _id?: string;
  nama: string;
  email: string;
  role: Role;
  saldo: number;
  noHp?: string;
  alamat?: string;
  aktif: boolean;
  createdAt: string;
}

export default function AdminPenggunaPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("PETUGAS");
  const [newNoHp, setNewNoHp] = useState("");
  const [newAlamat, setNewAlamat] = useState("");

  const { data: response, isLoading } = useQuery<{ data: UserAccount[]; total: number }>({
    queryKey: ["admin-users-list", roleFilter],
    queryFn: () => {
      const url =
        roleFilter === "ALL"
          ? "/api/users?limit=50"
          : `/api/users?role=${roleFilter}&limit=50`;
      return apiClient(url);
    },
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return apiClient("/api/users", {
        method: "POST",
        body: JSON.stringify({
          nama: newNama,
          email: newEmail,
          password: newPassword,
          role: newRole,
          noHp: newNoHp || undefined,
          alamat: newAlamat || undefined,
        }),
      });
    },
    onSuccess: () => {
      toast.success("Akun pengguna baru berhasil dibuat!");
      setAddModalOpen(false);
      setNewNama("");
      setNewEmail("");
      setNewPassword("");
      setNewNoHp("");
      setNewAlamat("");
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal membuat akun.");
    },
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, aktif }: { id: string; aktif: boolean }) => {
      return apiClient(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ aktif }),
      });
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Akun berhasil di-${variables.aktif ? "aktifkan" : "nonaktifkan"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal mengubah status akun.");
    },
  });

  const list = response?.data || [];
  const filteredList = list.filter(
    (u) =>
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.noHp && u.noHp.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kelola Akun Pengguna
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manajemen akun nasabah warga, petugas timbang, dan hak akses sistem.
          </p>
        </div>

        <Button onClick={() => setAddModalOpen(true)} className="shadow-sm">
          <UserPlus className="mr-1.5 h-4 w-4" /> Daftarkan Pengguna Baru
        </Button>
      </div>

      <Card>
        <CardHeader className="p-5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["ALL", "NASABAH", "PETUGAS", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    roleFilter === r
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r === "ALL" ? "Semua Peran" : r}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama, email, hp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">Tidak ada pengguna yang cocok dengan kriteria</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-6">Pengguna</th>
                    <th className="p-3">Peran (Role)</th>
                    <th className="p-3">Kontak & Alamat</th>
                    <th className="p-3 text-right">Saldo Buku Besar</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-6 text-right">Aksi Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredList.map((user) => {
                    const userId = user.id || user._id || "";
                    return (
                      <tr key={userId} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 pl-6">
                          <span className="font-bold text-slate-900 block text-sm">{user.nama}</span>
                          <span className="text-slate-400 text-[11px]">{user.email}</span>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              user.role === "ADMIN"
                                ? "destructive"
                                : user.role === "PETUGAS"
                                ? "warning"
                                : "success"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-500">
                          <div>{user.noHp || "-"}</div>
                          <div className="text-[11px] text-slate-400">{user.alamat || "-"}</div>
                        </td>
                        <td className="p-3 text-right font-bold text-sm text-emerald-700">
                          {user.role === "NASABAH" ? formatRupiah(user.saldo) : "-"}
                        </td>
                        <td className="p-3">
                          <Badge variant={user.aktif ? "success" : "destructive"}>
                            {user.aktif ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>
                        <td className="p-3 pr-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 text-xs font-semibold ${
                              user.aktif
                                ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                            onClick={() =>
                              toggleActiveMutation.mutate({ id: userId, aktif: !user.aktif })
                            }
                            disabled={toggleActiveMutation.isPending}
                          >
                            <Power className="mr-1 h-3.5 w-3.5" />
                            {user.aktif ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Daftarkan Akun Pengguna Baru"
        description="Buat akun petugas penimbang baru atau akun nasabah warga."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newNama || !newEmail || !newPassword) {
              toast.error("Nama, email, dan password wajib diisi");
              return;
            }
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="nama">Nama Lengkap *</Label>
            <Input
              id="nama"
              placeholder="Contoh: Siti Rahayu"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="siti@banksampah.id"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Kata Sandi (min 8 char) *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Peran / Hak Akses *</Label>
            <select
              id="role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PETUGAS">PETUGAS (Input kasir & persetujuan penarikan)</option>
              <option value="NASABAH">NASABAH (Warga penabung sampah)</option>
              <option value="ADMIN">ADMIN (Pengelola sistem penuh)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="noHp">Nomor WhatsApp / HP</Label>
              <Input
                id="noHp"
                placeholder="081234567890"
                value={newNoHp}
                onChange={(e) => setNewNoHp(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alamat">Alamat / RT / RW</Label>
              <Input
                id="alamat"
                placeholder="RT 03 / RW 04"
                value={newAlamat}
                onChange={(e) => setNewAlamat(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setAddModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Mendaftarkan...
                </>
              ) : (
                "Simpan Akun"
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
