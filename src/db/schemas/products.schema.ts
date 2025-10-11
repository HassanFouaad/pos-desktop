import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  categoryId: text("categoryId"),
  tenantId: text("tenantId"),
  taxCategory: text("taxCategory"),
  taxRate: real("taxRate"), // SQLite uses REAL for floating point
  taxIncluded: integer("taxIncluded", { mode: "boolean" }),
  name: text("name"),
  description: text("description"),
  tags: text("tags", { mode: "json" }), // Store arrays as JSON in SQLite
  status: text("status"),
  variantsCount: integer("variantsCount"),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
});
