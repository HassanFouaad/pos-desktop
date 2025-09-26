import {
  bigint,
  boolean,
  date,
  decimal,
  integer,
  pgTable,
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

export const DatabaseSchema = {
  users,
  stores,
  categories,
  products,
  productVariants,
  inventory,
  customers,
};
