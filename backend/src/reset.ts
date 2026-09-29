import mongoose from "mongoose";
import { connectDatabase } from "./lib/db";
import { JenisSampahModel } from "./models/jenis-sampah.model";
import { MutasiSaldoModel } from "./models/mutasi-saldo.model";
import { PenarikanModel } from "./models/penarikan.model";
import { SetoranModel } from "./models/setoran.model";
import { TitikJemputModel } from "./models/titik-jemput.model";
import { UserModel } from "./models/user.model";

async function main() {
  await connectDatabase();
  console.log("Menghapus semua data lama di database...");
  await Promise.all([
    UserModel.deleteMany({}),
    JenisSampahModel.deleteMany({}),
    SetoranModel.deleteMany({}),
    PenarikanModel.deleteMany({}),
    MutasiSaldoModel.deleteMany({}),
    TitikJemputModel.deleteMany({}),
  ]);
  console.log("Database berhasil dibersihkan!");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Gagal membersihkan database:", error);
  await mongoose.disconnect();
  process.exit(1);
});
