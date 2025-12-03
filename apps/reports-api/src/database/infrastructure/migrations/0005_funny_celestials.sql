CREATE TABLE `categorization_registry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_value` text NOT NULL,
	`display_value` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categorization_registry_source_value_unique` ON `categorization_registry` (`source_value`);
--> statement-breakpoint
CREATE INDEX `categorization_registry_source_value_idx` ON `categorization_registry` (`source_value`);
--> statement-breakpoint
CREATE INDEX `categorization_registry_display_value_idx` ON `categorization_registry` (`display_value`);
--> statement-breakpoint
CREATE INDEX `categorization_registry_is_active_idx` ON `categorization_registry` (`is_active`);
