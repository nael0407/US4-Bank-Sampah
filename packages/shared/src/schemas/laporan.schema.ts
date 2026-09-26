import { z } from "zod";

export const laporanQuerySchema = z.object({
  dari: z.coerce.date({ message: "Tanggal tidak valid" }).optional(),
  sampai: z.coerce.date({ message: "Tanggal tidak valid" }).optional(),
  from: z.coerce.date({ message: "Tanggal tidak valid" }).optional(),
  to: z.coerce.date({ message: "Tanggal tidak valid" }).optional(),
});
export type LaporanQuery = z.infer<typeof laporanQuerySchema>;

export const laporanPerJenisQuerySchema = laporanQuerySchema.extend({
  groupBy: z.enum(["hari", "bulan"]).default("hari"),
});
export type LaporanPerJenisQuery = z.infer<typeof laporanPerJenisQuerySchema>;
