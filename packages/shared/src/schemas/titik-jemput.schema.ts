import { z } from "zod";
import { HARI } from "../constants";

const jamSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:mm");

const jadwalSchema = z
  .object({
    hari: z.enum(HARI),
    jamMulai: jamSchema,
    jamSelesai: jamSchema,
  })
  .refine((jadwal) => jadwal.jamMulai < jadwal.jamSelesai, {
    message: "Jam selesai harus setelah jam mulai",
    path: ["jamSelesai"],
  });

export const titikJemputSchema = z.object({
  nama: z.string().trim().min(3, "Nama titik minimal 3 karakter"),
  alamat: z.string().trim().min(5, "Alamat minimal 5 karakter"),
  lokasi: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  jadwal: z.array(jadwalSchema).default([]),
});
export type TitikJemputInput = z.infer<typeof titikJemputSchema>;

export const updateTitikJemputSchema = titikJemputSchema.partial();
export type UpdateTitikJemputInput = z.infer<typeof updateTitikJemputSchema>;
