import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orderHistory = sqliteTable("order_history", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  orderId: text("orderId"),
  userId: text("userId"),
  fromStatus: text("fromStatus"),
  toStatus: text("toStatus"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});
