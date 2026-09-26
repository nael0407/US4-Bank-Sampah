import { LaporanPerJenisQuery, LaporanQuery } from "@bank-sampah/shared";
import { PenarikanModel } from "../models/penarikan.model";
import { SetoranModel } from "../models/setoran.model";
import { UserModel } from "../models/user.model";

const SATU_HARI_MS = 24 * 60 * 60 * 1000;

function resolveDateRange(query: LaporanQuery) {
  const dari = query.dari || query.from;
  const sampai = query.sampai || query.to;
  return { dari, sampai };
}

function buildSetoranDateFilter(dari?: Date, sampai?: Date) {
  if (!dari && !sampai) return {};
  return {
    tanggal: {
      ...(dari && { $gte: dari }),
      ...(sampai && { $lt: new Date(sampai.getTime() + SATU_HARI_MS) }),
    },
  };
}

function buildPenarikanDateFilter(dari?: Date, sampai?: Date) {
  if (!dari && !sampai) return {};
  return {
    $or: [
      {
        diprosesPada: {
          ...(dari && { $gte: dari }),
          ...(sampai && { $lt: new Date(sampai.getTime() + SATU_HARI_MS) }),
        },
      },
      {
        diprosesPada: { $exists: false },
        createdAt: {
          ...(dari && { $gte: dari }),
          ...(sampai && { $lt: new Date(sampai.getTime() + SATU_HARI_MS) }),
        },
      },
    ],
  };
}

export async function getRingkasanLaporan(query: LaporanQuery) {
  const { dari, sampai } = resolveDateRange(query);
  const setoranFilter = { status: "AKTIF", ...buildSetoranDateFilter(dari, sampai) };
  const penarikanFilter = { status: "DISETUJUI", ...buildPenarikanDateFilter(dari, sampai) };

  const [setoranRes, penarikanRes, saldoRes, totalNasabahAktif, nasabahTeraktif] = await Promise.all([
    SetoranModel.aggregate([
      { $match: setoranFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalKg: { $sum: "$items.berat" },
          totalNilai: { $sum: "$items.subtotal" },
          daftarTransaksi: { $addToSet: "$_id" },
        },
      },
    ]),
    PenarikanModel.aggregate([
      { $match: penarikanFilter },
      {
        $group: {
          _id: null,
          totalPenarikan: { $sum: "$jumlah" },
          totalTransaksi: { $sum: 1 },
        },
      },
    ]),
    UserModel.aggregate([
      { $match: { role: "NASABAH", aktif: true } },
      { $group: { _id: null, totalSaldo: { $sum: "$saldo" } } },
    ]),
    UserModel.countDocuments({ role: "NASABAH", aktif: true }),
    SetoranModel.aggregate([
      { $match: setoranFilter },
      {
        $group: {
          _id: "$nasabahId",
          totalNilai: { $sum: "$total" },
          totalTransaksi: { $sum: 1 },
        },
      },
      { $sort: { totalNilai: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "nasabah",
        },
      },
      { $unwind: "$nasabah" },
      {
        $project: {
          _id: 0,
          nasabahId: "$_id",
          nama: "$nasabah.nama",
          email: "$nasabah.email",
          totalNilai: 1,
          totalTransaksi: 1,
        },
      },
    ]),
  ]);

  const rawKg = setoranRes[0]?.totalKg ?? 0;
  const totalKg = Math.round((rawKg + Number.EPSILON) * 100) / 100;

  return {
    periode: {
      dari: dari ? dari.toISOString().split("T")[0] : null,
      sampai: sampai ? sampai.toISOString().split("T")[0] : null,
    },
    ringkasan: {
      totalKg,
      totalNilaiSetoran: setoranRes[0]?.totalNilai ?? 0,
      totalPenarikan: penarikanRes[0]?.totalPenarikan ?? 0,
      saldoBeredar: saldoRes[0]?.totalSaldo ?? 0,
      totalNasabahAktif,
      totalTransaksiSetoran: setoranRes[0]?.daftarTransaksi?.length ?? 0,
      totalTransaksiPenarikan: penarikanRes[0]?.totalTransaksi ?? 0,
    },
    nasabahTeraktif,
  };
}

export async function getLaporanPerJenis(query: LaporanPerJenisQuery) {
  const { dari, sampai } = resolveDateRange(query);
  const groupBy = query.groupBy || "hari";
  const setoranFilter = { status: "AKTIF", ...buildSetoranDateFilter(dari, sampai) };

  const dateFormat = groupBy === "bulan" ? "%Y-%m" : "%Y-%m-%d";

  const [perJenis, tren] = await Promise.all([
    SetoranModel.aggregate([
      { $match: setoranFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.jenisSampahId",
          namaJenis: { $first: "$items.namaJenis" },
          totalKg: { $sum: "$items.berat" },
          totalNilai: { $sum: "$items.subtotal" },
          totalTransaksi: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          jenisSampahId: "$_id",
          namaJenis: 1,
          totalKg: { $round: ["$totalKg", 2] },
          totalNilai: 1,
          totalTransaksi: 1,
        },
      },
      { $sort: { totalKg: -1 } },
    ]),
    SetoranModel.aggregate([
      { $match: setoranFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            periode: { $dateToString: { format: dateFormat, date: "$tanggal", timezone: "+07:00" } },
            namaJenis: "$items.namaJenis",
          },
          totalKg: { $sum: "$items.berat" },
          totalNilai: { $sum: "$items.subtotal" },
        },
      },
      {
        $group: {
          _id: "$_id.periode",
          totalKg: { $sum: "$totalKg" },
          totalNilai: { $sum: "$totalNilai" },
          rincian: {
            $push: {
              namaJenis: "$_id.namaJenis",
              totalKg: { $round: ["$totalKg", 2] },
              totalNilai: "$totalNilai",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          periode: "$_id",
          totalKg: { $round: ["$totalKg", 2] },
          totalNilai: 1,
          rincian: 1,
        },
      },
      { $sort: { periode: 1 } },
    ]),
  ]);

  return {
    periode: {
      dari: dari ? dari.toISOString().split("T")[0] : null,
      sampai: sampai ? sampai.toISOString().split("T")[0] : null,
    },
    groupBy,
    perJenis,
    tren,
  };
}
