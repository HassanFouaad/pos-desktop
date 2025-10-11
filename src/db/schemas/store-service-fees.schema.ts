import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const storeServiceFees = sqliteTable("store_service_fees", {
  id: text("id").primaryKey(),
  storeId: text("storeId"),
  tenantId: text("tenantId"),
  type: text("type"), // 'fixed' or 'percentage'
  value: real("value"), // amount for fixed, percentage for percentage
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});
