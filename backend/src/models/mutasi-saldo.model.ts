import { TIPE_MUTASI } from "@bank-sampah/shared";
import { InferSchemaType, Schema, model } from "mongoose";

const mutasiSaldoSchema = new Schema(
  {
    nasabahId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tipe: { type: String, enum: [...TIPE_MUTASI], required: true },
    jumlah: { type: Number, required: true },
    saldoSetelah: { type: Number, required: true, min: 0 },
    refId: { type: Schema.Types.ObjectId, required: true },
    keterangan: { type: String, trim: true },
    tanggal: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

mutasiSaldoSchema.index({ nasabahId: 1, tanggal: -1 });

export type MutasiSaldo = InferSchemaType<typeof mutasiSaldoSchema>;
export const MutasiSaldoModel = model("MutasiSaldo", mutasiSaldoSchema, "mutasiSaldo");
