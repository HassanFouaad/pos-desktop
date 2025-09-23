import {
  bigint,
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

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
