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
  dbCredentials: {
    // This is a dummy connection string for drizzle-kit to work.
    // PGLite runs in-process and doesn't need a connection string during generation.
    url: "postgresql://user:password@host:port/db",
  },
  verbose: true,
  strict: true,
});
