import { objectIdSchema, penarikanQuerySchema } from "@bank-sampah/shared";
import { Request, Response } from "express";
import { getAuthUser } from "../middlewares/auth.middleware";
import * as penarikanService from "../services/penarikan.service";

export async function create(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const penarikan = await penarikanService.createPenarikan(authUser.id, req.body);
  res.status(201).json({ message: "Pengajuan penarikan berhasil dibuat", penarikan });
}

export async function list(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const query = penarikanQuerySchema.parse(req.query);
  const result = await penarikanService.listPenarikan(authUser, query);
  res.json(result);
}

export async function detail(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const id = objectIdSchema.parse(req.params.id);
  const penarikan = await penarikanService.getPenarikanById(authUser, id);
  res.json({ penarikan });
}

export async function setujui(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const id = objectIdSchema.parse(req.params.id);
  const catatan = req.body?.catatan;
  const { penarikan, saldo } = await penarikanService.setujuiPenarikan(authUser.id, id, catatan);
  res.json({ message: "Pengajuan penarikan disetujui", penarikan, saldo });
}

export async function tolak(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const id = objectIdSchema.parse(req.params.id);
  const penarikan = await penarikanService.tolakPenarikan(authUser.id, id, req.body.catatan);
  res.json({ message: "Pengajuan penarikan ditolak", penarikan });
}
