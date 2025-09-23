-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `stores` (
	`id` bigint PRIMARY KEY NOT NULL,
	`tenant_id` bigint,
	`code` varchar(10),
	`name` varchar(255),
	`address_line_1` varchar(255),
	`address_line_2` varchar(255),
	`city` varchar(100),
	`state` varchar(100),
	`postal_code` varchar(20),
	`country` varchar(100),
	`contact_email` varchar(255),
	`contact_phone` varchar(50),
	`currency` varchar(3),
	`tax_region` varchar(255),
	`is_active` boolean,
	`created_at` timestamp with time zone,
	`updated_at` timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` bigint PRIMARY KEY NOT NULL,
	`tenant_id` bigint,
	`name` varchar(255),
	`phone` varchar(50),
	`date_of_birth` date,
	`loyalty_number` varchar(100),
	`loyalty_points` integer,
	`total_spent` decimal(12, 2),
	`total_visits` integer,
	`average_order_value` decimal(12, 2),
	`last_visit_at` timestamp with time zone,
	`notes` text,
	`created_at` timestamp with time zone,
	`updated_at` timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` bigint PRIMARY KEY NOT NULL,
	`tenant_id` bigint,
	`name` varchar(255),
	`parent_category_id` bigint,
	`category_type` varchar(50),
	`created_at` timestamp with time zone,
	`updated_at` timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` bigint PRIMARY KEY NOT NULL,
	`product_id` bigint,
	`tenant_id` bigint,
	`name` varchar(100),
	`unit_of_measure` varchar(50),
	`sku` varchar(100),
	`base_selling_price` decimal(10, 2),
	`base_purchase_price` decimal(10, 2),
	`created_at` timestamp with time zone,
	`updated_at` timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint PRIMARY KEY NOT NULL,
	`tenant_id` bigint,
	`category_id` bigint,
	`tax_category` varchar(50),
	`tax_rate` decimal(12, 2),
	`tax_included` boolean,
	`name` varchar(255),
	`description` text,
	`tags` text[],
	`status` varchar(50),
	`variants_count` integer,
	`created_at` timestamp with time zone,
	`updated_at` timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` bigint PRIMARY KEY NOT NULL,
	`tenant_id` bigint,
	`store_id` bigint,
	`variant_id` bigint,
	`quantity_on_hand` integer,
	`quantity_committed` integer,
	`quantity_available` integer,
	`reorder_point` integer,
	`max_stock_level` integer,
	`last_counted_at` timestamp with time zone,
	`cost_per_unit` decimal(12, 2),
	`total_value` decimal(12, 2),
	`created_at` timestamp with time zone,
	`updated_at` timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_code_unique` ON `stores` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `public`.`products`(`id`) ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `public`.`categories`(`id`) ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE `inventory` ADD CONSTRAINT `inventory_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `public`.`stores`(`id`) ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE `inventory` ADD CONSTRAINT `inventory_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `public`.`product_variants`(`id`) ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/
