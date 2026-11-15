"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatRupiah } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tags, Plus, Edit2, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface JenisSampah {
  id: string;
  _id?: string;
  nama: string;
  kategori?: string;
  hargaPerKg: number;
  deskripsi?: string;
  aktif: boolean;
}

export default function AdminJenisSampahPage() {
  const queryClient = useQueryClient();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JenisSampah | null>(null);

  // Form states
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("Plastik");
  const [hargaPerKg, setHargaPerKg] = useState<number | "">("");
  const [deskripsi, setDeskripsi] = useState("");
  const [aktif, setAktif] = useState(true);

  const { data: response, isLoading } = useQuery<{ data: JenisSampah[] }>({
    queryKey: ["admin-jenis-sampah"],
    queryFn: () => apiClient("/api/jenis-sampah"),
  });

  const list = response?.data || [];

  const openAddModal = () => {
    setEditingItem(null);
    setNama("");
    setKategori("Plastik");
    setHargaPerKg("");
    setDeskripsi("");
    setAktif(true);
    setModalOpen(true);
  };

  const openEditModal = (item: JenisSampah) => {
    setEditingItem(item);
    setNama(item.nama);
    setKategori(item.kategori || "Plastik");
    setHargaPerKg(item.hargaPerKg);
    setDeskripsi(item.deskripsi || "");
    setAktif(item.aktif);
    setModalOpen(true);
  };

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        nama,
        kategori,
        hargaPerKg: Number(hargaPerKg),
        deskripsi: deskripsi || undefined,
        aktif,
      };

      if (editingItem) {
        const itemId = editingItem.id || editingItem._id;
        return apiClient(`/api/jenis-sampah/${itemId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        return apiClient("/api/jenis-sampah", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Data jenis sampah diperbarui!" : "Jenis sampah baru berhasil ditambahkan!"
      );
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-jenis-sampah"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-sampah-public"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-sampah-active"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menyimpan jenis sampah.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient(`/api/jenis-sampah/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Jenis sampah berhasil dinonaktifkan/dihapus!");
      queryClient.invalidateQueries({ queryKey: ["admin-jenis-sampah"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-sampah-public"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-sampah-active"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menghapus jenis sampah.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !hargaPerKg) {
      toast.error("Nama dan harga per kg wajib diisi");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Katalog Jenis & Harga Sampah
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Atur harga beli resmi per kilogram. Perubahan harga hanya berlaku untuk transaksi setoran baru.
          </p>
        </div>

        <Button onClick={openAddModal} className="shadow-sm">
          <Plus className="mr-1.5 h-4 w-4" /> Tambah Jenis Sampah
        </Button>
      </div>

      <Card>
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Tags className="h-4 w-4 text-emerald-600" />
            <span>Daftar Kategori Sampah Terdaftar</span>
          </CardTitle>
          <span className="text-xs text-slate-400">Total {list.length} item</span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">Belum ada jenis sampah</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-6">Nama Sampah</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-right">Harga Beli / kg</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {list.map((item) => {
                    const itemId = item.id || item._id || item.nama;
                    return (
                    <tr key={itemId} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 pl-6">
                        <span className="font-bold text-slate-900 block text-sm">{item.nama}</span>
                        {item.deskripsi && (
                          <span className="text-slate-400 text-[11px]">{item.deskripsi}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-slate-700">
                          {item.kategori || "Umum"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-extrabold text-sm text-emerald-700">
                        {formatRupiah(item.hargaPerKg)}
                      </td>
                      <td className="p-3">
                        <Badge variant={item.aktif ? "success" : "destructive"}>
                          {item.aktif ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="p-3 pr-6 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => openEditModal(item)}
                          title="Ubah Data"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => {
                            if (confirm(`Yakin ingin menonaktifkan/menghapus "${item.nama}"?`)) {
                              deleteMutation.mutate(item.id || item._id || "");
                            }
                          }}
                          title="Hapus / Nonaktifkan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add / Edit Dialog */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Ubah Jenis & Harga Sampah" : "Tambah Jenis Sampah Baru"}
        description="Pastikan harga per kilogram telah disepakati bersama pengurus RW."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nama">Nama Sampah *</Label>
            <Input
              id="nama"
              placeholder="Contoh: Botol Plastik PET Bening"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kategori">Kategori</Label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Plastik">Plastik</option>
                <option value="Kertas">Kertas</option>
                <option value="Logam">Logam</option>
                <option value="Kaca">Kaca</option>
                <option value="Cair">Cair</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="harga">Harga / kg (Rp) *</Label>
              <Input
                id="harga"
                type="number"
                placeholder="Contoh: 3500"
                value={hargaPerKg}
                onChange={(e) =>
                  setHargaPerKg(e.target.value === "" ? "" : Number(e.target.value))
                }
                min={1}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deskripsi">Keterangan / Syarat Kondisi</Label>
            <Input
              id="deskripsi"
              placeholder="Contoh: Bersih dari label dan dipipihkan"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>

          {editingItem && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="aktif"
                checked={aktif}
                onChange={(e) => setAktif(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="aktif" className="text-xs font-medium cursor-pointer">
                Status Aktif (dapat dipilih di kasir penimbangan)
              </Label>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Data"
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
