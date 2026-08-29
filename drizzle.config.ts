import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Code-first schema is split only to keep the mature operational tables stable.
export default defineConfig({
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/content-schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://placeholder"
  }
});
