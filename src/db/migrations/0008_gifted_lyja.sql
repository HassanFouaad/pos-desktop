CREATE TABLE "pending_categories" (
	"id" bigint PRIMARY KEY NOT NULL,
	"tenantId" bigint,
	"name" varchar(255),
	"parentCategoryId" bigint,
	"categoryType" varchar(50),
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"syncStatus" "sync_status" DEFAULT 'pending',
	"localId" uuid
);
--> statement-breakpoint
ALTER TABLE "changes" ALTER COLUMN "transaction_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "localId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "pending_customers" ALTER COLUMN "localId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "localId" uuid;