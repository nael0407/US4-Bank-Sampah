import { Role } from "@bank-sampah/shared";
import jwt from "jsonwebtoken";
import { config } from "./config";

export const TOKEN_MAX_AGE_SECONDS = 24 * 60 * 60;

export type TokenPayload = {
  id: string;
  role: Role;
};

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: TOKEN_MAX_AGE_SECONDS });
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
}
