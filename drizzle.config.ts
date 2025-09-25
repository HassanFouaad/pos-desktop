import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schemas/index.ts",
  out: "./src/db/migrations",
  driver: "pglite",

  dbCredentials: {
    url: config.DATABASE_NAME,
  },
});
