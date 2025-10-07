import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name"),
  subdomain: text("subdomain"),
  adminUsername: text("adminUsername"),
  contactPhone: text("contactPhone"),
  secondaryContactPhone: text("secondaryContactPhone"),
  logoUrl: text("logoUrl"),
  primaryColor: text("primaryColor"),
  accentColor: text("accentColor"),
  storesCount: integer("storesCount"),
  isActive: integer("isActive", { mode: "boolean" }),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});
