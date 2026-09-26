import { MutasiQuery, TipeMutasi } from "@bank-sampah/shared";
import { ClientSession, Types } from "mongoose";
import { HttpError } from "../lib/http-error";
import { buildPagination, skipFor } from "../lib/pagination";
import { MutasiSaldoModel } from "../models/mutasi-saldo.model";
import { UserModel } from "../models/user.model";

type MutasiInput = {
  nasabahId: Types.ObjectId | string;
  tipe: TipeMutasi;
  jumlah: number;
  refId: Types.ObjectId;
  keterangan?: string;
};

export async function applyMutasi(session: ClientSession, input: MutasiInput) {
  const nasabahAda = await UserModel.exists({ _id: input.nasabahId, role: "NASABAH" }).session(session);
  if (!nasabahAda) throw new HttpError(404, "Nasabah tidak ditemukan");

  const saldoMinimal = input.jumlah < 0 ? -input.jumlah : 0;

  const nasabah = await UserModel.findOneAndUpdate(
    { _id: input.nasabahId, saldo: { $gte: saldoMinimal } },
    { $inc: { saldo: input.jumlah } },
    { returnDocument: "after", session },
  );
  if (!nasabah) throw new HttpError(400, "Saldo nasabah tidak mencukupi");

  await MutasiSaldoModel.create(
    [
      {
        nasabahId: nasabah._id,
        tipe: input.tipe,
        jumlah: input.jumlah,
        saldoSetelah: nasabah.saldo,
        refId: input.refId,
        keterangan: input.keterangan,
      },
    ],
    { session },
  );

  return nasabah.saldo;
}

export async function getSaldo(nasabahId: string) {
  const nasabah = await UserModel.findOne({ _id: nasabahId, role: "NASABAH" }).select("nama saldo");
  if (!nasabah) throw new HttpError(404, "Nasabah tidak ditemukan");

  return { nasabahId: nasabah.id as string, nama: nasabah.nama, saldo: nasabah.saldo };
}

export async function listMutasi(nasabahId: string, query: MutasiQuery) {
  const filter = { nasabahId, ...(query.tipe && { tipe: query.tipe }) };

  const [data, total] = await Promise.all([
    MutasiSaldoModel.find(filter)
      .sort({ tanggal: -1, _id: -1 })
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit),
    MutasiSaldoModel.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(query.page, query.limit, total) };
}
