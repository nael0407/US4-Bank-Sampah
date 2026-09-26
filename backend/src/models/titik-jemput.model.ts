import { HARI } from "@bank-sampah/shared";
import { InferSchemaType, Schema, model } from "mongoose";

const jadwalSchema = new Schema(
  {
    hari: { type: String, enum: [...HARI], required: true },
    jamMulai: { type: String, required: true },
    jamSelesai: { type: String, required: true },
  },
  { _id: false },
);

const titikJemputSchema = new Schema(
  {
    nama: { type: String, required: true, trim: true },
    alamat: { type: String, required: true, trim: true },
    lokasi: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    jadwal: { type: [jadwalSchema], default: [] },
  },
  { timestamps: true },
);

titikJemputSchema.index({ lokasi: "2dsphere" });

export type TitikJemput = InferSchemaType<typeof titikJemputSchema>;
export const TitikJemputModel = model("TitikJemput", titikJemputSchema, "titikJemput");
