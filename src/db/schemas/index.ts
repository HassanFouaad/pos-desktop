import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "success",
  "failed",
]);
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }),
  permissions: text("permissions").array(),
  isLoggedIn: boolean("isLoggedIn").default(false),
  lastLoginAt: timestamp("lastLoginAt", { mode: "date" }),
  refreshToken: varchar("refreshToken", { length: 255 }),
  hashedPassword: varchar("hashedPassword", { length: 255 }),
  username: varchar("username", { length: 255 }),
  accessToken: varchar("accessToken", { length: 100000 }),
});

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
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
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
  name: varchar("name", { length: 255 }),
  parentCategoryId: uuid("parentCategoryId"),
  categoryType: varchar("categoryType", { length: 50 }),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
  localId: uuid("localId"),
});

export const pendingCategories = pgTable("pending_categories", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
  name: varchar("name", { length: 255 }),
  parentCategoryId: uuid("parentCategoryId"),
  categoryType: varchar("categoryType", { length: 50 }),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
  syncStatus: syncStatusEnum("syncStatus").default("pending"),
  localId: uuid("localId"),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
  categoryId: uuid("categoryId"),
  taxCategory: varchar("taxCategory", { length: 50 }),
  taxRate: decimal("taxRate", { precision: 12, scale: 2 }),
  taxIncluded: boolean("taxIncluded"),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  tags: text("tags").array(),
  status: varchar("status", { length: 50 }),
  variantsCount: integer("variantsCount"),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey(),
  productId: uuid("productId"),
  tenantId: uuid("tenantId"),
  name: varchar("name", { length: 100 }),
  unitOfMeasure: varchar("unitOfMeasure", { length: 50 }),
  sku: varchar("sku", { length: 100 }),
  baseSellingPrice: decimal("baseSellingPrice", { precision: 10, scale: 2 }),
  basePurchasePrice: decimal("basePurchasePrice", {
    precision: 10,
    scale: 2,
  }),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
  latestPriceSnapshotId: uuid("latestPriceSnapshotId"),
});

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
  storeId: uuid("storeId"),
  variantId: uuid("variantId"),
  quantityOnHand: integer("quantityOnHand"),
  quantityCommitted: integer("quantityCommitted"),
  quantityAvailable: integer("quantityAvailable"),
  reorderPoint: integer("reorderPoint"),
  maxStockLevel: integer("maxStockLevel"),
  lastCountedAt: timestamp("lastCountedAt", { mode: "date" }),
  costPerUnit: decimal("costPerUnit", { precision: 12, scale: 2 }),
  totalValue: decimal("totalValue", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
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
  lastVisitAt: timestamp("lastVisitAt", { mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
  localId: uuid("localId"),
  syncStatus: syncStatusEnum("syncStatus").default("pending"),
});

export const storePrices = pgTable("store_prices", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenantId"),
  variantId: uuid("variantId"),
  storeId: uuid("storeId"),
  price: decimal("price", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
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
    entityId: uuid("entity_id").notNull(),
    operation: varchar("operation", { length: 10 }).notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    syncedAt: timestamp("synced_at", { mode: "date" }),
    transactionId: uuid("transaction_id"),
    status: varchar("status", { length: 10 }).default("pending"),
    retryCount: integer("retry_count").default(0),
    nextRetryAt: timestamp("next_retry_at", { mode: "date" }),
    priority: integer("priority").default(5), // 1 = highest, 10 = lowest
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
  changes,
};
