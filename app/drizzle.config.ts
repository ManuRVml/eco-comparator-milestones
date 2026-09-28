import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: { url: process.env.DATABASE_URL || "file:./data/seguimiento.db" },
} satisfies Config;