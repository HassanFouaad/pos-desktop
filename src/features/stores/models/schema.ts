import {
  bigint,
  boolean,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number" }),
  code: varchar("code", { length: 10 }).unique(),
  name: varchar("name", { length: 255 }),
  addressLine1: varchar("address_line_1", { length: 255 }),
  addressLine2: varchar("address_line_2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  currency: varchar("currency", { length: 3 }),
  taxRegion: varchar("tax_region", { length: 255 }),
  isActive: boolean("is_active"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});
