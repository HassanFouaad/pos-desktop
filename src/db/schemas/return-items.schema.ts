import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const returnItems = sqliteTable("return_items", {
  id: text("id").primaryKey(),
  returnId: text("returnId"),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  originalOrderItemId: text("originalOrderItemId"),
  quantityReturned: integer("quantityReturned"),
  unitRefundAmount: real("unitRefundAmount"),
  totalRefundAmount: real("totalRefundAmount"),
  returnToInventory: integer("returnToInventory", { mode: "boolean" }),
  inventoryAdjustmentId: text("inventoryAdjustmentId"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
});
