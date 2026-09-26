import { CreateSetoranInput, Role, SetoranQuery } from "@bank-sampah/shared";
import { withTransaction } from "../lib/db";
import { HttpError } from "../lib/http-error";
import { sendSetoranEmail } from "../lib/mailer";
import { buildPagination, skipFor } from "../lib/pagination";
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

  const hasil = await withTransaction(async (session) => {
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

  void sendSetoranEmail({
    email: nasabah.email,
    nama: nasabah.nama,
    tanggal: hasil.setoran.tanggal,
    items,
    total,
    saldo: hasil.saldo,
  });

  return hasil;
}

type PenggunaAktif = { id: string; role: Role };

const SATU_HARI_MS = 24 * 60 * 60 * 1000;

function buildFilterTanggal(dari?: Date, sampai?: Date) {
  if (!dari && !sampai) return {};
  return {
    tanggal: {
      ...(dari && { $gte: dari }),
      ...(sampai && { $lt: new Date(sampai.getTime() + SATU_HARI_MS) }),
    },
  };
}

export async function listSetoran(pengguna: PenggunaAktif, query: SetoranQuery) {
  const nasabahId = pengguna.role === "NASABAH" ? pengguna.id : query.nasabahId;
  const filter = {
    ...(nasabahId && { nasabahId }),
    ...(query.status && { status: query.status }),
    ...buildFilterTanggal(query.dari, query.sampai),
  };

  const [data, total] = await Promise.all([
    SetoranModel.find(filter)
      .populate("nasabahId", "nama email")
      .populate("petugasId", "nama")
      .sort({ tanggal: -1 })
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit),
    SetoranModel.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(query.page, query.limit, total) };
}

export async function getSetoranById(pengguna: PenggunaAktif, id: string) {
  const setoran = await SetoranModel.findById(id)
    .populate("nasabahId", "nama email")
    .populate("petugasId", "nama")
    .populate("dibatalkanOleh", "nama");

  const bukanMilikNasabah =
    pengguna.role === "NASABAH" && setoran && !setoran.nasabahId._id.equals(pengguna.id);
  if (!setoran || bukanMilikNasabah) throw new HttpError(404, "Setoran tidak ditemukan");

  return setoran;
}

export async function batalSetoran(penggunaId: string, id: string, alasan: string) {
  return withTransaction(async (session) => {
    const setoran = await SetoranModel.findOneAndUpdate(
      { _id: id, status: "AKTIF" },
      { status: "DIBATALKAN", dibatalkanOleh: penggunaId, alasanBatal: alasan },
      { returnDocument: "after", session },
    );

    if (!setoran) {
      const setoranAda = await SetoranModel.exists({ _id: id }).session(session);
      throw setoranAda
        ? new HttpError(400, "Setoran sudah dibatalkan sebelumnya")
        : new HttpError(404, "Setoran tidak ditemukan");
    }

    const saldo = await applyMutasi(session, {
      nasabahId: setoran.nasabahId,
      tipe: "KOREKSI",
      jumlah: -setoran.total,
      refId: setoran._id,
      keterangan: `Pembatalan setoran: ${alasan}`,
    });

    return { setoran, saldo };
  });
}
