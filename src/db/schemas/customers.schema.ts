import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  name: text("name"),
  phone: text("phone"),
  dateOfBirth: text("dateOfBirth"),
  loyaltyNumber: text("loyaltyNumber"),
  loyaltyPoints: integer("loyaltyPoints"),
  totalSpent: real("totalSpent"),
  totalVisits: integer("totalVisits"),
  averageOrderValue: real("averageOrderValue"),
  lastVisitAt: text("lastVisitAt"),
  notes: text("notes"),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
});
