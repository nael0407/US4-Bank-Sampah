import { CreateSetoranInput } from "@bank-sampah/shared";
import { withTransaction } from "../lib/db";
import { HttpError } from "../lib/http-error";
import { JenisSampahModel } from "../models/jenis-sampah.model";
import { SetoranModel } from "../models/setoran.model";
import { UserModel } from "../models/user.model";
import { applyMutasi } from "./ledger.service";

async function buildItemSetoran(items: CreateSetoranInput["items"]) {
  const daftarJenis = await JenisSampahModel.find({
    _id: { $in: items.map((item) => item.jenisSampahId) },
    aktif: true,
  });
  const jenisById = new Map(daftarJenis.map((jenis) => [jenis.id as string, jenis]));

  return items.map((item) => {
    const jenis = jenisById.get(item.jenisSampahId);
    if (!jenis) throw new HttpError(400, "Jenis sampah tidak ditemukan atau sudah nonaktif");

    const berat = Math.round(item.berat * 100) / 100;
    return {
      jenisSampahId: jenis._id,
      namaJenis: jenis.nama,
      berat,
      hargaPerKg: jenis.hargaPerKg,
      subtotal: Math.round(berat * jenis.hargaPerKg),
    };
  });
}

export async function createSetoran(petugasId: string, input: CreateSetoranInput) {
  const nasabah = await UserModel.findOne({ _id: input.nasabahId, role: "NASABAH" });
  if (!nasabah) throw new HttpError(404, "Nasabah tidak ditemukan");
  if (!nasabah.aktif) throw new HttpError(400, "Akun nasabah sedang nonaktif");

  const items = await buildItemSetoran(input.items);
  const total = items.reduce((jumlah, item) => jumlah + item.subtotal, 0);

  return withTransaction(async (session) => {
    const [setoran] = await SetoranModel.create(
      [{ nasabahId: nasabah._id, petugasId, items, total }],
      { session },
    );

    const saldo = await applyMutasi(session, {
      nasabahId: nasabah._id,
      tipe: "SETORAN",
      jumlah: total,
      refId: setoran._id,
      keterangan: `Setoran ${items.length} jenis sampah`,
    });

    return { setoran, saldo };
  });
}
