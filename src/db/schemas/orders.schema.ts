import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customers } from "./customers.schema";
import { orderItems } from "./order-items.schema";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  customerId: text("customerId"),
  orderNumber: text("orderNumber"),
  externalOrderId: text("externalOrderId"),
  orderType: text("orderType"), // 'sale', 'return', 'exchange', 'refund'
  status: text("status"), // 'pending', 'completed', 'voided', 'refunded', 'partially_refunded'
  source: text("source"), // 'pos', 'web', 'mobile', 'api'
  subtotal: real("subtotal"),
  totalDiscount: real("totalDiscount"),
  totalTax: real("totalTax"),
  totalAmount: real("totalAmount"),
  paymentMethod: text("paymentMethod"), // 'cash', 'card', 'check', 'store_credit', 'gift_card', 'mixed'
  paymentStatus: text("paymentStatus"), // 'pending', 'paid', 'partial', 'refunded'
  amountPaid: real("amountPaid"),
  amountDue: real("amountDue"),
  changeGiven: real("changeGiven"),
  cashierId: text("cashierId"),
  shiftId: text("shiftId"),
  registerId: text("registerId"),
  originalOrderId: text("originalOrderId"),
  customerName: text("customerName"),
  customerPhone: text("customerPhone"),
  notes: text("notes"),
  internalNotes: text("internalNotes"),
  orderDate: integer("orderDate", { mode: "timestamp_ms" }),
  completedAt: integer("completedAt", { mode: "timestamp_ms" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});

relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  customer: one(customers),
}));
