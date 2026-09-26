import { z } from "zod";
import { ROLES } from "../constants";
import { paginationQuerySchema } from "./common.schema";

export const createUserSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(ROLES, { message: "Role tidak valid" }),
  noHp: z
    .string()
    .regex(/^(\+62|0)8\d{7,11}$/, "Nomor HP tidak valid")
    .optional(),
  alamat: z.string().trim().optional(),
  aktif: z.boolean().default(true),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter").optional(),
  email: z.string().email("Format email tidak valid").optional(),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  role: z.enum(ROLES, { message: "Role tidak valid" }).optional(),
  noHp: z
    .string()
    .regex(/^(\+62|0)8\d{7,11}$/, "Nomor HP tidak valid")
    .optional(),
  alamat: z.string().trim().optional(),
  aktif: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  role: z.enum(ROLES).optional(),
  aktif: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});
export type UserQuery = z.infer<typeof userQuerySchema>;
