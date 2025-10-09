import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inventoryAdjustments = sqliteTable("inventory_adjustments", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  variantId: text("variantId"),
  adjustmentType: text("adjustmentType"), // 'stock_in', 'stock_out', 'adjustment', 'transfer', 'loss', etc.
  quantityChange: integer("quantityChange"),
  quantityBefore: integer("quantityBefore"),
  quantityAfter: integer("quantityAfter"),
  unitCost: real("unitCost"),
  totalCost: real("totalCost"),
  reasonCode: text("reasonCode"),
  reason: text("reason"),
  referenceType: text("referenceType"), // 'order', 'return', 'purchase_order', 'manual', etc.
  referenceId: text("referenceId"),
  adjustedBy: text("adjustedBy"),
  adjustedAt: integer("adjustedAt", { mode: "timestamp_ms" }),
  batchId: text("batchId"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});
