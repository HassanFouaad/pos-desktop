/* interface PosAttributes {
  id: string;
  tenantId: string;
  storeId: string;
  name: string;
  status: PosStatus;
  createdAt: Date;
  updatedAt: Date;
} */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pos = sqliteTable("pos", {
  id: text("id").primaryKey(),
  storeId: text("storeId"),
  tenantId: text("tenantId"),
  name: text("name"),
  status: text("status"),
  createdAt: text("createdAt"),
  updatedAt: text("updatedAt"),
});
