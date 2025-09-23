import {
  bigint,
  decimal,
  integer,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { productVariants } from "../../products/models/schema";
import { stores } from "../../stores/models/schema";

export const inventory = pgTable(
  "inventory",
  {
    id: bigint("id", { mode: "number" }).primaryKey(),
    tenantId: bigint("tenant_id", { mode: "number" }),
    storeId: bigint("store_id", { mode: "number" }).references(() => stores.id),
    variantId: bigint("variant_id", { mode: "number" }).references(
      () => productVariants.id
    ),
    quantityOnHand: integer("quantity_on_hand"),
    quantityCommitted: integer("quantity_committed"),
    quantityAvailable: integer("quantity_available"),
    reorderPoint: integer("reorder_point"),
    maxStockLevel: integer("max_stock_level"),
    lastCountedAt: timestamp("last_counted_at", { withTimezone: true }),
    costPerUnit: decimal("cost_per_unit", { precision: 12, scale: 2 }),
    totalValue: decimal("total_value", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => {
    return {
      storeVariantUnique: unique().on(table.storeId, table.variantId),
    };
  }
);
