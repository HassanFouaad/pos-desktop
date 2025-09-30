CREATE TYPE "public"."sync_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"name" varchar(255),
	"parentCategoryId" bigint,
	"categoryType" varchar(50),
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"localId" uuid
);
--> statement-breakpoint
CREATE TABLE "changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" bigint NOT NULL,
	"operation" varchar(10) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now(),
	"synced_at" timestamp,
	"transaction_id" uuid,
	"status" varchar(10) DEFAULT 'pending',
	"retry_count" integer DEFAULT 0,
	"next_retry_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"name" varchar(255),
	"phone" varchar(50),
	"dateOfBirth" date,
	"loyaltyNumber" varchar(100),
	"loyaltyPoints" integer,
	"totalSpent" numeric(12, 2),
	"totalVisits" integer,
	"averageOrderValue" numeric(12, 2),
	"lastVisitAt" timestamp,
	"notes" text,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"localId" uuid
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"storeId" bigint,
	"variantId" bigint,
	"quantityOnHand" integer,
	"quantityCommitted" integer,
	"quantityAvailable" integer,
	"reorderPoint" integer,
	"maxStockLevel" integer,
	"lastCountedAt" timestamp,
	"costPerUnit" numeric(12, 2),
	"totalValue" numeric(12, 2),
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "pending_categories" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"name" varchar(255),
	"parentCategoryId" bigint,
	"categoryType" varchar(50),
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"syncStatus" "sync_status" DEFAULT 'pending',
	"localId" uuid
);
--> statement-breakpoint
CREATE TABLE "pending_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"name" varchar(255),
	"phone" varchar(50) NOT NULL,
	"dateOfBirth" date,
	"loyaltyNumber" varchar(100),
	"loyaltyPoints" integer,
	"totalSpent" numeric(12, 2),
	"totalVisits" integer,
	"averageOrderValue" numeric(12, 2),
	"lastVisitAt" timestamp,
	"notes" text,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"syncStatus" "sync_status" DEFAULT 'pending',
	"localId" uuid
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" bigint PRIMARY KEY NOT NULL,
	"productId" bigint,
	"tenantId" bigint,
	"name" varchar(100),
	"unitOfMeasure" varchar(50),
	"sku" varchar(100),
	"baseSellingPrice" numeric(10, 2),
	"basePurchasePrice" numeric(10, 2),
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"categoryId" bigint,
	"taxCategory" varchar(50),
	"taxRate" numeric(12, 2),
	"taxIncluded" boolean,
	"name" varchar(255),
	"description" text,
	"tags" text[],
	"status" varchar(50),
	"variantsCount" integer,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "store_prices" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"variantId" bigint,
	"storeId" bigint,
	"price" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"code" varchar(10),
	"name" varchar(255),
	"addressLine1" varchar(255),
	"addressLine2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postalCode" varchar(20),
	"country" varchar(100),
	"contactEmail" varchar(255),
	"contactPhone" varchar(50),
	"currency" varchar(3),
	"taxRegion" varchar(255),
	"isActive" boolean,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"email" varchar(255),
	"name" varchar(255),
	"role" varchar(50),
	"permissions" text[],
	"isLoggedIn" boolean DEFAULT false,
	"lastLoginAt" timestamp,
	"refreshToken" varchar(255),
	"hashedPassword" varchar(255),
	"username" varchar(255),
	"accessToken" varchar(500)
);
--> statement-breakpoint
CREATE INDEX "idx_changes_status" ON "changes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_changes_entity_type" ON "changes" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "idx_changes_transaction_id" ON "changes" USING btree ("transaction_id");