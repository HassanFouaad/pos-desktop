import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  name: text("name"),
  phone: text("phone"),
  dateOfBirth: integer("dateOfBirth", { mode: "timestamp" }), // Store as timestamp
  loyaltyNumber: text("loyaltyNumber"),
  loyaltyPoints: integer("loyaltyPoints"),
  totalSpent: real("totalSpent"),
  totalVisits: integer("totalVisits"),
  averageOrderValue: real("averageOrderValue"),
  lastVisitAt: integer("lastVisitAt", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
  localId: text("localId"),
});
