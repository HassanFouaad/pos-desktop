import {
  bigint,
  boolean,
  date,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number" }),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }),
  permissions: text("permissions").array(),
  isLoggedIn: boolean("is_logged_in").default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const stores = pgTable("stores", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number" }),
  code: varchar("code", { length: 10 }).unique(),
  name: varchar("name", { length: 255 }),
  addressLine1: varchar("address_line_1", { length: 255 }),
  addressLine2: varchar("address_line_2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  currency: varchar("currency", { length: 3 }),
  taxRegion: varchar("tax_region", { length: 255 }),
  isActive: boolean("is_active"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const categories = pgTable("categories", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number" }),
  name: varchar("name", { length: 255 }),
  parentCategoryId: bigint("parent_category_id", { mode: "number" }),
  categoryType: varchar("category_type", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const products = pgTable("products", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number" }),
  categoryId: bigint("category_id", { mode: "number" }).references(
    () => categories.id
  ),
  taxCategory: varchar("tax_category", { length: 50 }),
  taxRate: decimal("tax_rate", { precision: 12, scale: 2 }),
  taxIncluded: boolean("tax_included"),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  tags: text("tags").array(),
  status: varchar("status", { length: 50 }),
  variantsCount: integer("variants_count"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const productVariants = pgTable("product_variants", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  productId: bigint("product_id", { mode: "number" }).references(
    () => products.id
  ),
  tenantId: bigint("tenant_id", { mode: "number" }),
  name: varchar("name", { length: 100 }),
  unitOfMeasure: varchar("unit_of_measure", { length: 50 }),
  sku: varchar("sku", { length: 100 }).unique(),
  baseSellingPrice: decimal("base_selling_price", { precision: 10, scale: 2 }),
  basePurchasePrice: decimal("base_purchase_price", {
    precision: 10,
    scale: 2,
  }),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

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
  (table) => [
    {
      storeVariantUnique: unique().on(table.storeId, table.variantId),
    },
  ]
);

export const customers = pgTable("customers", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number" }),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: date("date_of_birth"),
  loyaltyNumber: varchar("loyalty_number", { length: 100 }),
  loyaltyPoints: integer("loyalty_points"),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }),
  totalVisits: integer("total_visits"),
  averageOrderValue: decimal("average_order_value", {
    precision: 12,
    scale: 2,
  }),
  lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
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
