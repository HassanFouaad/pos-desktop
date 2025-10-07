import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const returns = sqliteTable("returns", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  originalOrderId: text("originalOrderId"),
  storeId: text("storeId"),
  returnType: text("returnType"), // 'full_return', 'partial_return', 'exchange', 'store_credit'
  returnReason: text("returnReason"),
  processedBy: text("processedBy"),
  approvedBy: text("approvedBy"),
  requiresApproval: integer("requiresApproval", { mode: "boolean" }),
  approvalNotes: text("approvalNotes"),
  refundMethod: text("refundMethod"), // 'original_payment', 'cash', 'store_credit', 'exchange'
  refundAmount: real("refundAmount"),
  exchangeOrderId: text("exchangeOrderId"),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});
