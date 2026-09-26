import { ROLES } from "@bank-sampah/shared";
import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    nama: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: [...ROLES], required: true },
    saldo: { type: Number, default: 0, min: 0 },
    noHp: { type: String, trim: true },
    alamat: { type: String, trim: true },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);

export function toPublicUser(user: HydratedDocument<User>) {
  return {
    id: user.id as string,
    nama: user.nama,
    email: user.email,
    role: user.role,
    saldo: user.saldo,
    noHp: user.noHp,
    alamat: user.alamat,
    aktif: user.aktif,
  };
}
