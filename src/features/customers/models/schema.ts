import {
  bigint,
  date,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number" }),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: date("date_of_birth"),
  loyaltyNumber: varchar("loyalty_number", { length: 100 }),
  loyaltyPoints: integer("loyalty_points"),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }),
  totalVisits: integer("total_visits"),
  averageOrderValue: decimal("average_order_value", {
    precision: 12,
    scale: 2,
  }),
  lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});
