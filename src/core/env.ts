import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  //   DATABASE_URL: z.string().url(),
});

let envData: z.infer<typeof envSchema>;

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
