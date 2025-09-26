import {
  bigint,
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }),
  permissions: text("permissions").array(),
  isLoggedIn: boolean("isLoggedIn").default(false),
  lastLoginAt: timestamp("lastLoginAt", { withTimezone: true }),
  refreshToken: varchar("refreshToken", { length: 255 }),
});

export const stores = pgTable("stores", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  code: varchar("code", { length: 10 }),
  name: varchar("name", { length: 255 }),
  addressLine1: varchar("addressLine1", { length: 255 }),
  addressLine2: varchar("addressLine2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }),
  country: varchar("country", { length: 100 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  currency: varchar("currency", { length: 3 }),
  taxRegion: varchar("taxRegion", { length: 255 }),
  isActive: boolean("isActive"),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const categories = pgTable("categories", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  name: varchar("name", { length: 255 }),
  parentCategoryId: bigint("parentCategoryId", { mode: "number" }),
  categoryType: varchar("categoryType", { length: 50 }),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const products = pgTable("products", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  categoryId: bigint("categoryId", { mode: "number" }),
  taxCategory: varchar("taxCategory", { length: 50 }),
  taxRate: decimal("taxRate", { precision: 12, scale: 2 }),
  taxIncluded: boolean("taxIncluded"),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  tags: text("tags").array(),
  status: varchar("status", { length: 50 }),
  variantsCount: integer("variantsCount"),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const productVariants = pgTable("product_variants", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  productId: bigint("productId", { mode: "number" }),
  tenantId: bigint("tenantId", { mode: "number" }),
  name: varchar("name", { length: 100 }),
  unitOfMeasure: varchar("unitOfMeasure", { length: 50 }),
  sku: varchar("sku", { length: 100 }),
  baseSellingPrice: decimal("baseSellingPrice", { precision: 10, scale: 2 }),
  basePurchasePrice: decimal("basePurchasePrice", {
    precision: 10,
    scale: 2,
  }),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const inventory = pgTable("inventory", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  storeId: bigint("storeId", { mode: "number" }),
  variantId: bigint("variantId", { mode: "number" }),
  quantityOnHand: integer("quantityOnHand"),
  quantityCommitted: integer("quantityCommitted"),
  quantityAvailable: integer("quantityAvailable"),
  reorderPoint: integer("reorderPoint"),
  maxStockLevel: integer("maxStockLevel"),
  lastCountedAt: timestamp("lastCountedAt", { withTimezone: true }),
  costPerUnit: decimal("costPerUnit", { precision: 12, scale: 2 }),
  totalValue: decimal("totalValue", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const customers = pgTable("customers", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: date("dateOfBirth"),
  loyaltyNumber: varchar("loyaltyNumber", { length: 100 }),
  loyaltyPoints: integer("loyaltyPoints"),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }),
  totalVisits: integer("totalVisits"),
  averageOrderValue: decimal("averageOrderValue", {
    precision: 12,
    scale: 2,
  }),
  lastVisitAt: timestamp("lastVisitAt", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
});

export const storePrices = pgTable("store_prices", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  variantId: bigint("variantId", { mode: "number" }),
  storeId: bigint("storeId", { mode: "number" }),
  price: decimal("price", { precision: 12, scale: 2 }),
});

export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "success",
  "failed",
]);

// This table is deprecated and no longer in use. Customer data is now stored directly in the changes table.
// Keeping this for backward compatibility until a future migration can remove it.
export const pendingCustomers = pgTable("pending_customers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenantId", { mode: "number" }),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  dateOfBirth: date("dateOfBirth"),
  loyaltyNumber: varchar("loyaltyNumber", { length: 100 }),
  loyaltyPoints: integer("loyaltyPoints"),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }),
  totalVisits: integer("totalVisits"),
  averageOrderValue: decimal("averageOrderValue", {
    precision: 12,
    scale: 2,
  }),
  lastVisitAt: timestamp("lastVisitAt", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }),
  syncStatus: syncStatusEnum("syncStatus").default("pending"),
});

import { index, jsonb } from "drizzle-orm/pg-core";

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
export const DatabaseSchema = {
  users,
  stores,
  categories,
  products,
  productVariants,
  inventory,
  customers,
  storePrices,
  pendingCustomers,
  changes,
};
