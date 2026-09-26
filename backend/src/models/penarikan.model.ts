import { METODE_PENARIKAN, STATUS_PENARIKAN } from "@bank-sampah/shared";
import { InferSchemaType, Schema, model } from "mongoose";

const penarikanSchema = new Schema(
  {
    nasabahId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jumlah: { type: Number, required: true, min: 1 },
    metode: { type: String, enum: [...METODE_PENARIKAN], required: true },
    ewallet: {
      type: new Schema({ provider: String, nomor: String }, { _id: false }),
      required: false,
    },
    status: { type: String, enum: [...STATUS_PENARIKAN], default: "PENDING" },
    diprosesOleh: { type: Schema.Types.ObjectId, ref: "User" },
    diprosesPada: { type: Date },
    catatan: { type: String, trim: true },
  },
  { timestamps: true },
);

penarikanSchema.index({ nasabahId: 1, status: 1 });

export type Penarikan = InferSchemaType<typeof penarikanSchema>;
export const PenarikanModel = model("Penarikan", penarikanSchema, "penarikan");
