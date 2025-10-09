import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const storePrices = sqliteTable("store_prices", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  variantId: text("variantId"),
  price: real("price"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});
