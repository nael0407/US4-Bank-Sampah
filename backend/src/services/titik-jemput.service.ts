import { TitikJemputInput, UpdateTitikJemputInput } from "@bank-sampah/shared";
import { HydratedDocument } from "mongoose";
import { HttpError } from "../lib/http-error";
import { TitikJemput, TitikJemputModel } from "../models/titik-jemput.model";

type Koordinat = { lat: number; lng: number };

function toGeoJsonPoint({ lat, lng }: Koordinat) {
  return { type: "Point" as const, coordinates: [lng, lat] };
}

function toResponse(titik: HydratedDocument<TitikJemput>) {
  const [lng, lat] = titik.lokasi?.coordinates ?? [];
  return {
    id: titik.id as string,
    nama: titik.nama,
    alamat: titik.alamat,
    lokasi: { lat, lng },
    jadwal: titik.jadwal,
  };
}

export async function listTitikJemput() {
  const daftarTitik = await TitikJemputModel.find().sort({ nama: 1 });
  return daftarTitik.map(toResponse);
}

export async function getTitikJemputById(id: string) {
  const titik = await TitikJemputModel.findById(id);
  if (!titik) throw new HttpError(404, "Titik jemput tidak ditemukan");

  return toResponse(titik);
}

export async function createTitikJemput(input: TitikJemputInput) {
  const titik = await TitikJemputModel.create({ ...input, lokasi: toGeoJsonPoint(input.lokasi) });
  return toResponse(titik);
}

export async function updateTitikJemput(id: string, input: UpdateTitikJemputInput) {
  const perubahan = {
    ...input,
    ...(input.lokasi && { lokasi: toGeoJsonPoint(input.lokasi) }),
  };

  const titik = await TitikJemputModel.findByIdAndUpdate(id, perubahan, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!titik) throw new HttpError(404, "Titik jemput tidak ditemukan");

  return toResponse(titik);
}

export async function deleteTitikJemput(id: string) {
  const titik = await TitikJemputModel.findByIdAndDelete(id);
  if (!titik) throw new HttpError(404, "Titik jemput tidak ditemukan");
}
