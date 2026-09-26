import { z } from "zod";
import { METODE_PENARIKAN, STATUS_PENARIKAN } from "../constants";
import { objectIdSchema, paginationQuerySchema } from "./common.schema";

const ewalletSchema = z.object({
  provider: z.string().trim().min(2, "Nama provider minimal 2 karakter"),
  nomor: z
    .string()
    .trim()
    .regex(/^(\+62|0)8\d{7,11}$/, "Nomor e-wallet tidak valid"),
});

export const createPenarikanSchema = z
  .object({
    jumlah: z
      .number({ message: "Jumlah penarikan harus berupa angka" })
      .int("Jumlah penarikan harus bilangan bulat")
      .positive("Jumlah penarikan harus lebih dari 0"),
    metode: z.enum(METODE_PENARIKAN, { message: "Metode penarikan tidak valid" }),
    ewallet: ewalletSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.metode === "E_WALLET") {
        return !!data.ewallet?.provider && !!data.ewallet?.nomor;
      }
      return true;
    },
    {
      message: "Data provider dan nomor e-wallet wajib diisi untuk penarikan e-wallet",
      path: ["ewallet"],
    },
  );
export type CreatePenarikanInput = z.infer<typeof createPenarikanSchema>;

export const tolakPenarikanSchema = z.object({
  catatan: z.string().trim().min(3, "Catatan penolakan minimal 3 karakter"),
});
export type TolakPenarikanInput = z.infer<typeof tolakPenarikanSchema>;

export const setujuiPenarikanSchema = z
  .object({
    catatan: z.string().trim().optional(),
  })
  .optional();
export type SetujuiPenarikanInput = z.infer<typeof setujuiPenarikanSchema>;

export const penarikanQuerySchema = paginationQuerySchema.extend({
  status: z.enum(STATUS_PENARIKAN).optional(),
  nasabahId: objectIdSchema.optional(),
});
export type PenarikanQuery = z.infer<typeof penarikanQuerySchema>;
