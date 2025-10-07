import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const storePrices = sqliteTable("store_prices", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  variantId: text("variantId"),
  storeId: text("storeId"),
  price: real("price"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});
