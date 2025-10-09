import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  variantId: text("variantId"),
  quantityOnHand: integer("quantityOnHand"),
  quantityCommitted: integer("quantityCommitted"),
  quantityAvailable: integer("quantityAvailable"),
  reorderPoint: integer("reorderPoint"),
  maxStockLevel: integer("maxStockLevel"),
  costPerUnit: real("costPerUnit"),
  totalValue: real("totalValue"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});
