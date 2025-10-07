import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  email: text("email"),
  name: text("name"),
  role: text("role"),
  permissions: text("permissions", { mode: "json" }), // Store arrays as JSON in SQLite
  isLoggedIn: integer("isLoggedIn", { mode: "boolean" }).default(false), // SQLite booleans are stored as integers
  lastLoginAt: integer("lastLoginAt", { mode: "timestamp" }), // SQLite timestamps as integers
  refreshToken: text("refreshToken"),
  hashedPassword: text("hashedPassword"),
  username: text("username"),
  accessToken: text("accessToken"),
});
