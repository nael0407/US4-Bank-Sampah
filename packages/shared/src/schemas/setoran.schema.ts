import { z } from "zod";
import { STATUS_SETORAN } from "../constants";
import { objectIdSchema, paginationQuerySchema } from "./common.schema";

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

export const batalSetoranSchema = z.object({
  alasan: z.string().trim().min(3, "Alasan pembatalan minimal 3 karakter"),
});
export type BatalSetoranInput = z.infer<typeof batalSetoranSchema>;

export const setoranQuerySchema = paginationQuerySchema.extend({
  nasabahId: objectIdSchema.optional(),
  status: z.enum(STATUS_SETORAN).optional(),
  dari: z.coerce.date("Tanggal tidak valid").optional(),
  sampai: z.coerce.date("Tanggal tidak valid").optional(),
});
export type SetoranQuery = z.infer<typeof setoranQuerySchema>;
