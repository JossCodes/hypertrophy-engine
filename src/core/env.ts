import dotenv from "dotenv";
import { readFileSync } from "fs";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  //   DATABASE_URL: z.string().url(),,
  JWT_PRIVATE_KEY_PATH: z.string(),
  JWT_PUBLIC_KEY_PATH: z.string(),
  JWT_EXPIRES_IN: z.string().default("15m"),
});

let envData: z.infer<typeof envSchema>;

let privateKey: string;
let publicKey: string;

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    process.exit(1);
  }

  envData = result.data;
}

export function getEnv() {
  if (!envData)
    throw new Error(
      "Environment variables not validated. Call validateEnv() first.",
    );
  return envData;
}

export function getKeys() {
  const env = getEnv();
  if (!privateKey) {
    privateKey = readFileSync(env.JWT_PRIVATE_KEY_PATH, "utf8");
  }
  if (!publicKey) {
    publicKey = readFileSync(env.JWT_PUBLIC_KEY_PATH, "utf8");
  }
  return { privateKey, publicKey };
}
