import mongoose from "mongoose";
import { connectDatabase } from "./lib/db";
import { hashPassword } from "./lib/password";
import { JenisSampahModel } from "./models/jenis-sampah.model";
import { TitikJemputModel } from "./models/titik-jemput.model";
import { UserModel } from "./models/user.model";

const akunAwal = [
  { nama: "Admin Bank Sampah", email: "admin@banksampah.id", password: "admin12345", role: "ADMIN" },
  { nama: "Petugas Bank Sampah", email: "petugas@banksampah.id", password: "petugas12345", role: "PETUGAS" },
  { nama: "Nasabah Contoh", email: "nasabah@banksampah.id", password: "nasabah12345", role: "NASABAH" },
] as const;

const jenisSampahAwal = [
  { nama: "Plastik PET", hargaPerKg: 3000 },
  { nama: "Kardus", hargaPerKg: 2000 },
  { nama: "Kertas", hargaPerKg: 1500 },
  { nama: "Kaleng", hargaPerKg: 4000 },
  { nama: "Botol Kaca", hargaPerKg: 500 },
];

async function seedAkun() {
  for (const akun of akunAwal) {
    const sudahAda = await UserModel.exists({ email: akun.email });
    if (sudahAda) continue;

    await UserModel.create({
      nama: akun.nama,
      email: akun.email,
      passwordHash: await hashPassword(akun.password),
      role: akun.role,
    });
    console.log(`Akun ${akun.role}: ${akun.email} / ${akun.password}`);
  }
}

async function seedJenisSampah() {
  for (const jenis of jenisSampahAwal) {
    await JenisSampahModel.updateOne({ nama: jenis.nama }, { $setOnInsert: jenis }, { upsert: true });
  }
  console.log(`${jenisSampahAwal.length} jenis sampah siap`);
}

async function seedTitikJemput() {
  const jumlah = await TitikJemputModel.countDocuments();
  if (jumlah > 0) return;

  await TitikJemputModel.create({
    nama: "Pos RW 05",
    alamat: "Jl. Kaliurang Km 5, Sleman, Yogyakarta",
    lokasi: { type: "Point", coordinates: [110.3775, -7.77] },
    jadwal: [
      { hari: "RABU", jamMulai: "08:00", jamSelesai: "11:00" },
      { hari: "SABTU", jamMulai: "08:00", jamSelesai: "11:00" },
    ],
  });
  console.log("1 titik jemput contoh dibuat");
}

async function main() {
  await connectDatabase();
  await seedAkun();
  await seedJenisSampah();
  await seedTitikJemput();
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Seed gagal:", error);
  await mongoose.disconnect();
  process.exit(1);
});
