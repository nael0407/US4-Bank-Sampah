import { STATUS_SETORAN } from "@bank-sampah/shared";
import { InferSchemaType, Schema, model } from "mongoose";

const itemSetoranSchema = new Schema(
  {
    jenisSampahId: { type: Schema.Types.ObjectId, ref: "JenisSampah", required: true },
    namaJenis: { type: String, required: true },
    berat: { type: Number, required: true, min: 0.01 },
    hargaPerKg: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const setoranSchema = new Schema(
  {
    nasabahId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    petugasId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tanggal: { type: Date, default: Date.now },
    items: { type: [itemSetoranSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: [...STATUS_SETORAN], default: "AKTIF" },
    dibatalkanOleh: { type: Schema.Types.ObjectId, ref: "User" },
    alasanBatal: { type: String, trim: true },
  },
  { timestamps: true },
);

setoranSchema.index({ nasabahId: 1, tanggal: -1 });

export type Setoran = InferSchemaType<typeof setoranSchema>;
export const SetoranModel = model("Setoran", setoranSchema, "setoran");
