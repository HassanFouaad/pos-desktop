import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  storeId: text("storeId"),
  orderId: text("orderId"),
  tenantId: text("tenantId"),
  variantId: text("variantId"),
  quantity: integer("quantity"),
  unitPrice: real("unitPrice"),
  originalUnitPrice: real("originalUnitPrice"),
  lineSubtotal: real("lineSubtotal"),
  lineDiscount: real("lineDiscount"),
  lineTotalBeforeTax: real("lineTotalBeforeTax"),
  inventoryAdjustmentId: text("inventoryAdjustmentId"),
  productName: text("productName"),
  variantName: text("variantName"),
  productSku: text("productSku"),
  variantAttributes: text("variantAttributes", { mode: "json" }), // Store as JSON in SQLite
  stockType: text("stockType"), // Order item stock type
  isReturned: integer("isReturned", { mode: "boolean" }),
  returnedQuantity: integer("returnedQuantity"),
  returnReason: text("returnReason"),
  lineTotal: real("lineTotal"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});
