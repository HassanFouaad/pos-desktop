CREATE TYPE "public"."sync_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
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
	"lastVisitAt" timestamp with time zone,
	"notes" text,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"syncStatus" "sync_status" DEFAULT 'pending'
);
