import { z } from "zod";
import { TIPE_MUTASI } from "../constants";
import { objectIdSchema, paginationQuerySchema } from "./common.schema";

export const mutasiQuerySchema = paginationQuerySchema.extend({
  nasabahId: objectIdSchema.optional(),
  tipe: z.enum(TIPE_MUTASI).optional(),
});
export type MutasiQuery = z.infer<typeof mutasiQuerySchema>;
