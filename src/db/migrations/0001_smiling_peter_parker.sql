CREATE TABLE "changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" bigint NOT NULL,
	"operation" varchar(10) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"synced_at" timestamp with time zone,
	"transaction_id" varchar(50),
	"status" varchar(10) DEFAULT 'pending'
);
--> statement-breakpoint
CREATE INDEX "idx_changes_status" ON "changes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_changes_entity_type" ON "changes" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "idx_changes_transaction_id" ON "changes" USING btree ("transaction_id");