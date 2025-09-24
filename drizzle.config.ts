import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: [
    "./src/features/stores/models/schema.ts",
    "./src/features/customers/models/schema.ts",
    "./src/features/products/models/schema.ts",
    "./src/features/inventory/models/schema.ts",
  ],
  out: "./src/db/migrations",
  dbCredentials: { url: "postgresql://user:password@host:port/db" },
  verbose: true,
  strict: true,
});
