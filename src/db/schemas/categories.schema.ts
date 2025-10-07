import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  name: text("name"),
  parentCategoryId: text("parentCategoryId"),
  categoryType: text("categoryType"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
  localId: text("localId"),
});
