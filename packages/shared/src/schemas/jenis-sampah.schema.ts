import { z } from "zod";

const jenisSampahBaseSchema = z.object({
  nama: z.string().trim().min(2, "Nama jenis sampah minimal 2 karakter"),
  hargaPerKg: z.number().int("Harga harus bilangan bulat").min(0, "Harga per kg minimal 0"),
  aktif: z.boolean().default(true),
});

export const createJenisSampahSchema = jenisSampahBaseSchema;
export type CreateJenisSampahInput = z.infer<typeof createJenisSampahSchema>;

export const updateJenisSampahSchema = jenisSampahBaseSchema.partial();
export type UpdateJenisSampahInput = z.infer<typeof updateJenisSampahSchema>;

export const jenisSampahQuerySchema = z.object({
  aktif: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});
export type JenisSampahQuery = z.infer<typeof jenisSampahQuerySchema>;
