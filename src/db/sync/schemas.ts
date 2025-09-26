import {
  bigint,
  index,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Changes table for tracking sync operations
 * Used to record changes that need to be synchronized with the server
 */
export const changes = pgTable(
  "changes",
  {
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: bigint("entity_id", { mode: "number" }).notNull(),
    operation: varchar("operation", { length: 10 }).notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    transactionId: varchar("transaction_id", { length: 50 }),
    status: varchar("status", { length: 10 }).default("pending"),
  },
  (table) => {
    return {
      statusIdx: index("idx_changes_status").on(table.status),
      entityTypeIdx: index("idx_changes_entity_type").on(table.entityType),
      transactionIdIdx: index("idx_changes_transaction_id").on(
        table.transactionId
      ),
    };
  }
);
