import { getEnv, getKeys } from "@/core/env.js";
import type { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export function signJwt(payload: object): string {
  const { privateKey } = getKeys();
  const { JWT_EXPIRES_IN } = getEnv();
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  const { publicKey } = getKeys();
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  } as VerifyOptions) as T;
}
