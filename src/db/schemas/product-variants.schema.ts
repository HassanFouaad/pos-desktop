import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("productId"),
  tenantId: text("tenantId"),
  name: text("name"),
  unitOfMeasure: text("unitOfMeasure"),
  sku: text("sku"),
  baseSellingPrice: real("baseSellingPrice"),
  basePurchasePrice: real("basePurchasePrice"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
  latestPriceSnapshotId: text("latestPriceSnapshotId"),
});
