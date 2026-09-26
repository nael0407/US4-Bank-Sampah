import { ROLES } from "@bank-sampah/shared";
import { InferSchemaType, Schema, model } from "mongoose";

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
