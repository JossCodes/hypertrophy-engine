import { getEnv } from "@/core/env.js";

export const logger = {
  info: (message: string) => {
    console.info(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  },
  error: (message: string, error?: Error | string | object) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  debug: (message: string) => {
    try {
      const { NODE_ENV } = getEnv();
      if (NODE_ENV !== "production") {
        console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
      }
    } catch {
      // If getEnv fails, we can't log debug messages
    }
  },
};
