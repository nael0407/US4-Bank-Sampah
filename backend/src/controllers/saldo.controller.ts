import { mutasiQuerySchema } from "@bank-sampah/shared";
import { Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { getAuthUser } from "../middlewares/auth.middleware";
import * as ledgerService from "../services/ledger.service";

function resolveNasabahId(req: Request, nasabahIdDariQuery?: string) {
  const user = getAuthUser(req);
  if (user.role === "NASABAH") return user.id;

  if (!nasabahIdDariQuery) throw new HttpError(400, "Parameter nasabahId wajib diisi");
  return nasabahIdDariQuery;
}

export async function getSaldo(req: Request, res: Response) {
  const { nasabahId } = mutasiQuerySchema.pick({ nasabahId: true }).parse(req.query);
  const saldo = await ledgerService.getSaldo(resolveNasabahId(req, nasabahId));
  res.json(saldo);
}

export async function listMutasi(req: Request, res: Response) {
  const query = mutasiQuerySchema.parse(req.query);
  const hasil = await ledgerService.listMutasi(resolveNasabahId(req, query.nasabahId), query);
  res.json(hasil);
}
