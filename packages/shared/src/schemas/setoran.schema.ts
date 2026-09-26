import { z } from "zod";
import { objectIdSchema } from "./common.schema";

const itemSetoranSchema = z.object({
  jenisSampahId: objectIdSchema,
  berat: z.number("Berat harus berupa angka").positive("Berat harus lebih dari 0").max(1000, "Berat maksimal 1000 kg"),
});

export const createSetoranSchema = z.object({
  nasabahId: objectIdSchema,
  items: z
    .array(itemSetoranSchema)
    .min(1, "Minimal satu jenis sampah")
    .refine(
      (items) => new Set(items.map((item) => item.jenisSampahId)).size === items.length,
      "Jenis sampah tidak boleh dobel dalam satu setoran",
    ),
});
export type CreateSetoranInput = z.infer<typeof createSetoranSchema>;
