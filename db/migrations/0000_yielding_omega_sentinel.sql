CREATE TABLE `inventory_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`change_type` text NOT NULL,
	`quantity_change` integer NOT NULL,
	`previous_quantity` integer NOT NULL,
	`new_quantity` integer NOT NULL,
	`created_at` text NOT NULL,
	`synced` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inventory_synced_idx` ON `inventory_logs` (`synced`);--> statement-breakpoint
CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_barcodes` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`barcode` text NOT NULL,
	`is_primary` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `barcode_idx` ON `product_barcodes` (`barcode`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`price` real NOT NULL,
	`stock_quantity` integer NOT NULL,
	`is_active` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `products_sku_idx` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_local_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`total` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text,
	`local_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`payment_method` text NOT NULL,
	`subtotal` real NOT NULL,
	`tax` real NOT NULL,
	`total` real NOT NULL,
	`reference` text,
	`created_at` text NOT NULL,
	`synced` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sales_synced_idx` ON `sales` (`synced`);--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer NOT NULL
);
