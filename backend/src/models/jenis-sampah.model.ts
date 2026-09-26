import { InferSchemaType, Schema, model } from "mongoose";

const jenisSampahSchema = new Schema(
  {
    nama: { type: String, required: true, unique: true, trim: true },
    hargaPerKg: { type: Number, required: true, min: 0 },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type JenisSampah = InferSchemaType<typeof jenisSampahSchema>;
export const JenisSampahModel = model("JenisSampah", jenisSampahSchema, "jenisSampah");
