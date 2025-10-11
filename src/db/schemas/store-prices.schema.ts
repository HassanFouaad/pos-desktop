import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const storePrices = sqliteTable("store_prices", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  variantId: text("variantId"),
  price: real("price"),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
});
