import { objectIdSchema } from "@bank-sampah/shared";
import { Request, Response } from "express";
import * as titikJemputService from "../services/titik-jemput.service";

export async function list(_req: Request, res: Response) {
  const titikJemput = await titikJemputService.listTitikJemput();
  res.json({ data: titikJemput });
}

export async function detail(req: Request, res: Response) {
  const titikJemput = await titikJemputService.getTitikJemputById(objectIdSchema.parse(req.params.id));
  res.json({ titikJemput });
}

export async function create(req: Request, res: Response) {
  const titikJemput = await titikJemputService.createTitikJemput(req.body);
  res.status(201).json({ message: "Titik jemput berhasil ditambahkan", titikJemput });
}

export async function update(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const titikJemput = await titikJemputService.updateTitikJemput(id, req.body);
  res.json({ message: "Titik jemput berhasil diperbarui", titikJemput });
}

export async function remove(req: Request, res: Response) {
  await titikJemputService.deleteTitikJemput(objectIdSchema.parse(req.params.id));
  res.json({ message: "Titik jemput berhasil dihapus" });
}
