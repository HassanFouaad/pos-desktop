import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// SQLite doesn't support enums directly, use text with check constraints
export type SyncStatus = "pending" | "success" | "failed";
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

export const stores = sqliteTable("stores", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  code: text("code"),
  name: text("name"),
  addressLine1: text("addressLine1"),
  addressLine2: text("addressLine2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postalCode"),
  country: text("country"),
  contactEmail: text("contactEmail"),
  contactPhone: text("contactPhone"),
  currency: text("currency"),
  taxRegion: text("taxRegion"),
  isActive: integer("isActive", { mode: "boolean" }),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

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

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  categoryId: text("categoryId"),
  taxCategory: text("taxCategory"),
  taxRate: real("taxRate"), // SQLite uses REAL for floating point
  taxIncluded: integer("taxIncluded", { mode: "boolean" }),
  name: text("name"),
  description: text("description"),
  tags: text("tags", { mode: "json" }), // Store arrays as JSON in SQLite
  status: text("status"),
  variantsCount: integer("variantsCount"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("productId"),
  tenantId: text("tenantId"),
  name: text("name"),
  unitOfMeasure: text("unitOfMeasure"),
  sku: text("sku"),
  baseSellingPrice: real("baseSellingPrice"),
  basePurchasePrice: real("basePurchasePrice"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
  latestPriceSnapshotId: text("latestPriceSnapshotId"),
});

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  storeId: text("storeId"),
  variantId: text("variantId"),
  quantityOnHand: integer("quantityOnHand"),
  quantityCommitted: integer("quantityCommitted"),
  quantityAvailable: integer("quantityAvailable"),
  reorderPoint: integer("reorderPoint"),
  maxStockLevel: integer("maxStockLevel"),
  lastCountedAt: integer("lastCountedAt", { mode: "timestamp" }),
  costPerUnit: real("costPerUnit"),
  totalValue: real("totalValue"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  name: text("name"),
  phone: text("phone"),
  dateOfBirth: integer("dateOfBirth", { mode: "timestamp" }), // Store as timestamp
  loyaltyNumber: text("loyaltyNumber"),
  loyaltyPoints: integer("loyaltyPoints"),
  totalSpent: real("totalSpent"),
  totalVisits: integer("totalVisits"),
  averageOrderValue: real("averageOrderValue"),
  lastVisitAt: integer("lastVisitAt", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
  localId: text("localId"),
  syncStatus: text("syncStatus").$type<SyncStatus>().default("pending"),
});

export const storePrices = sqliteTable("store_prices", {
  id: text("id").primaryKey(),
  tenantId: text("tenantId"),
  variantId: text("variantId"),
  storeId: text("storeId"),
  price: real("price"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const DatabaseSchema = {
  users,
  stores,
  categories,
  products,
  productVariants,
  inventory,
  customers,
  storePrices,
};
