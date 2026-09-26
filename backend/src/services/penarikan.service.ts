import { CreatePenarikanInput, MetodePenarikan, PenarikanQuery, Role } from "@bank-sampah/shared";
import { withTransaction } from "../lib/db";
import { HttpError } from "../lib/http-error";
import { sendPenarikanStatusEmail } from "../lib/mailer";
import { buildPagination, skipFor } from "../lib/pagination";
import { PenarikanModel } from "../models/penarikan.model";
import { UserModel } from "../models/user.model";
import { applyMutasi } from "./ledger.service";

type PenggunaAktif = { id: string; role: Role };

export async function createPenarikan(nasabahId: string, input: CreatePenarikanInput) {
  const nasabah = await UserModel.findOne({ _id: nasabahId, role: "NASABAH" });
  if (!nasabah) throw new HttpError(404, "Nasabah tidak ditemukan");
  if (!nasabah.aktif) throw new HttpError(400, "Akun nasabah sedang nonaktif");

  const pending = await PenarikanModel.aggregate([
    { $match: { nasabahId: nasabah._id, status: "PENDING" } },
    { $group: { _id: null, total: { $sum: "$jumlah" } } },
  ]);
  const totalPending = pending[0]?.total ?? 0;
  const saldoTersedia = nasabah.saldo - totalPending;

  if (input.jumlah > saldoTersedia) {
    throw new HttpError(
      400,
      `Saldo tidak mencukupi. Saldo saat ini: ${nasabah.saldo}, total pengajuan pending: ${totalPending}, saldo tersedia: ${saldoTersedia}`,
    );
  }

  const penarikan = await PenarikanModel.create({
    nasabahId: nasabah._id,
    jumlah: input.jumlah,
    metode: input.metode,
    ewallet: input.metode === "E_WALLET" ? input.ewallet : undefined,
    status: "PENDING",
  });

  return penarikan;
}

export async function listPenarikan(pengguna: PenggunaAktif, query: PenarikanQuery) {
  const nasabahId = pengguna.role === "NASABAH" ? pengguna.id : query.nasabahId;
  const filter = {
    ...(nasabahId && { nasabahId }),
    ...(query.status && { status: query.status }),
  };

  const [data, total] = await Promise.all([
    PenarikanModel.find(filter)
      .populate("nasabahId", "nama email noHp")
      .populate("diprosesOleh", "nama")
      .sort({ createdAt: -1 })
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit),
    PenarikanModel.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(query.page, query.limit, total) };
}

export async function getPenarikanById(pengguna: PenggunaAktif, id: string) {
  const penarikan = await PenarikanModel.findById(id)
    .populate("nasabahId", "nama email noHp")
    .populate("diprosesOleh", "nama");

  const bukanMilikNasabah =
    pengguna.role === "NASABAH" && penarikan && !penarikan.nasabahId._id.equals(pengguna.id);
  if (!penarikan || bukanMilikNasabah) throw new HttpError(404, "Pengajuan penarikan tidak ditemukan");

  return penarikan;
}

export async function setujuiPenarikan(petugasId: string, id: string, catatan?: string) {
  const hasil = await withTransaction(async (session) => {
    const penarikan = await PenarikanModel.findOneAndUpdate(
      { _id: id, status: "PENDING" },
      {
        status: "DISETUJUI",
        diprosesOleh: petugasId,
        diprosesPada: new Date(),
        ...(catatan && { catatan }),
      },
      { returnDocument: "after", session },
    );

    if (!penarikan) {
      const ada = await PenarikanModel.exists({ _id: id }).session(session);
      throw ada
        ? new HttpError(400, "Pengajuan penarikan sudah diproses sebelumnya")
        : new HttpError(404, "Pengajuan penarikan tidak ditemukan");
    }

    const saldo = await applyMutasi(session, {
      nasabahId: penarikan.nasabahId,
      tipe: "PENARIKAN",
      jumlah: -penarikan.jumlah,
      refId: penarikan._id,
      keterangan: `Penarikan saldo ${penarikan.metode === "TUNAI" ? "tunai" : "e-wallet"}`,
    });

    const nasabah = await UserModel.findById(penarikan.nasabahId).session(session);
    return { penarikan, saldo, nasabah };
  });

  if (hasil.nasabah) {
    void sendPenarikanStatusEmail({
      email: hasil.nasabah.email,
      nama: hasil.nasabah.nama,
      jumlah: hasil.penarikan.jumlah,
      metode: hasil.penarikan.metode as MetodePenarikan,
      disetujui: true,
      saldo: hasil.saldo,
      catatan: hasil.penarikan.catatan ?? undefined,
    });
  }

  return { penarikan: hasil.penarikan, saldo: hasil.saldo };
}

export async function tolakPenarikan(petugasId: string, id: string, catatan: string) {
  const penarikan = await PenarikanModel.findOneAndUpdate(
    { _id: id, status: "PENDING" },
    {
      status: "DITOLAK",
      diprosesOleh: petugasId,
      diprosesPada: new Date(),
      catatan,
    },
    { returnDocument: "after" },
  );

  if (!penarikan) {
    const ada = await PenarikanModel.exists({ _id: id });
    throw ada
      ? new HttpError(400, "Pengajuan penarikan sudah diproses sebelumnya")
      : new HttpError(404, "Pengajuan penarikan tidak ditemukan");
  }

  const nasabah = await UserModel.findById(penarikan.nasabahId);
  if (nasabah) {
    void sendPenarikanStatusEmail({
      email: nasabah.email,
      nama: nasabah.nama,
      jumlah: penarikan.jumlah,
      metode: penarikan.metode as MetodePenarikan,
      disetujui: false,
      saldo: nasabah.saldo,
      catatan,
    });
  }

  return penarikan;
}
