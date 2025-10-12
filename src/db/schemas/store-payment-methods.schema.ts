import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const storePaymentMethods = sqliteTable("store_payment_methods", {
  id: text("id").primaryKey(),
  storeId: text("storeId"),
  tenantId: text("tenantId"),
  paymentMethod: text("paymentMethod"), // 'cash', 'card', 'check', 'store_credit', 'gift_card', 'mixed'
  isActive: integer("isActive", { mode: "boolean" }),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
});

