CREATE TABLE `request_status_registry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`raw_status` text NOT NULL,
	`display_status` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `request_status_registry_raw_status_unique` ON `request_status_registry` (`raw_status`);--> statement-breakpoint
CREATE INDEX `request_status_registry_raw_status_idx` ON `request_status_registry` (`raw_status`);--> statement-breakpoint
CREATE INDEX `request_status_registry_display_status_idx` ON `request_status_registry` (`display_status`);--> statement-breakpoint
CREATE INDEX `request_status_registry_is_active_idx` ON `request_status_registry` (`is_active`);