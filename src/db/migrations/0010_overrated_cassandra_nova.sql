ALTER TABLE "changes" ADD COLUMN "retry_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "changes" ADD COLUMN "next_retry_at" timestamp;