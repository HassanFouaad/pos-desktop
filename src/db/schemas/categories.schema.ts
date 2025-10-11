import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  name: text("name"),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
});
