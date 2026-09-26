import { CreateJenisSampahInput, JenisSampahQuery, UpdateJenisSampahInput } from "@bank-sampah/shared";
import { HydratedDocument } from "mongoose";
import { HttpError } from "../lib/http-error";
import { JenisSampah, JenisSampahModel } from "../models/jenis-sampah.model";
import { SetoranModel } from "../models/setoran.model";

function toResponse(jenis: HydratedDocument<JenisSampah>) {
  return {
    id: jenis.id as string,
    nama: jenis.nama,
    hargaPerKg: jenis.hargaPerKg,
    aktif: jenis.aktif,
  };
}

export async function listJenisSampah(query?: JenisSampahQuery) {
  const filter = query?.aktif !== undefined ? { aktif: query.aktif } : {};
  const daftarJenis = await JenisSampahModel.find(filter).sort({ nama: 1 });
  return daftarJenis.map(toResponse);
}

export async function getJenisSampahById(id: string) {
  const jenis = await JenisSampahModel.findById(id);
  if (!jenis) throw new HttpError(404, "Jenis sampah tidak ditemukan");

  return toResponse(jenis);
}

export async function createJenisSampah(input: CreateJenisSampahInput) {
  const sudahAda = await JenisSampahModel.exists({ nama: input.nama });
  if (sudahAda) throw new HttpError(409, "Nama jenis sampah sudah terdaftar");

  const jenis = await JenisSampahModel.create(input);
  return toResponse(jenis);
}

export async function updateJenisSampah(id: string, input: UpdateJenisSampahInput) {
  if (input.nama) {
    const duplikat = await JenisSampahModel.exists({ nama: input.nama, _id: { $ne: id } });
    if (duplikat) throw new HttpError(409, "Nama jenis sampah sudah terdaftar");
  }

  const jenis = await JenisSampahModel.findByIdAndUpdate(id, input, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!jenis) throw new HttpError(404, "Jenis sampah tidak ditemukan");

  return toResponse(jenis);
}

export async function deleteJenisSampah(id: string) {
  const jenis = await JenisSampahModel.findById(id);
  if (!jenis) throw new HttpError(404, "Jenis sampah tidak ditemukan");

  const sudahDipakai = await SetoranModel.exists({ "items.jenisSampahId": id });
  if (sudahDipakai) {
    jenis.aktif = false;
    await jenis.save();
    return { softDeleted: true };
  }

  await JenisSampahModel.findByIdAndDelete(id);
  return { softDeleted: false };
}
