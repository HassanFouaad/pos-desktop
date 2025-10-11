import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  code: text("code"),
  name: text("name"),
  addressLine1: text("addressLine1"),
  addressLine2: text("addressLine2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postalCode"),
  country: text("country"),
  contactEmail: text("contactEmail"),
  contactPhone: text("contactPhone"),
  currency: text("currency"),
  taxRegion: text("taxRegion"),
  isActive: integer("isActive", { mode: "boolean" }),
  hasServiceFees: integer("hasServiceFees", { mode: "boolean" }),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
});
