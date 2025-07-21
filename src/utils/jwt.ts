import { getEnv, getKeys } from "@/core/env.js";
import {
  JwtPayload,
  sign,
  SignOptions,
  verify,
  VerifyOptions,
} from "jsonwebtoken";

export function signJwt(payload: object): string {
  const { privateKey } = getKeys();
  const { JWT_EXPIRES_IN } = getEnv();
  return sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  const { publicKey } = getKeys();
  return verify(token, publicKey, {
    algorithms: ["RS256"],
  } as VerifyOptions) as T;
}
