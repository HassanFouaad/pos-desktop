CREATE TABLE "store_prices" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"variantId" bigint,
	"storeId" bigint,
	"price" numeric(12, 2)
);
