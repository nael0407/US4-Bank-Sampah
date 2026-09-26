import { objectIdSchema, setoranQuerySchema } from "@bank-sampah/shared";
import { Request, Response } from "express";
import { getAuthUser } from "../middlewares/auth.middleware";
import * as setoranService from "../services/setoran.service";

export async function create(req: Request, res: Response) {
  const petugas = getAuthUser(req);
  const { setoran, saldo } = await setoranService.createSetoran(petugas.id, req.body);
  res.status(201).json({ message: "Setoran berhasil dicatat", setoran, saldoNasabah: saldo });
}

export async function list(req: Request, res: Response) {
  const query = setoranQuerySchema.parse(req.query);
  const hasil = await setoranService.listSetoran(getAuthUser(req), query);
  res.json(hasil);
}

export async function detail(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const setoran = await setoranService.getSetoranById(getAuthUser(req), id);
  res.json({ setoran });
}

export async function batal(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const { setoran, saldo } = await setoranService.batalSetoran(getAuthUser(req).id, id, req.body.alasan);
  res.json({ message: "Setoran berhasil dibatalkan", setoran, saldoNasabah: saldo });
}
