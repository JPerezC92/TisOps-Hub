CREATE TABLE `module_registry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_value` text NOT NULL,
	`display_value` text NOT NULL,
	`application` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `module_registry_source_value_unique` ON `module_registry` (`source_value`);--> statement-breakpoint
CREATE INDEX `module_registry_source_value_idx` ON `module_registry` (`source_value`);--> statement-breakpoint
CREATE INDEX `module_registry_display_value_idx` ON `module_registry` (`display_value`);--> statement-breakpoint
CREATE INDEX `module_registry_application_idx` ON `module_registry` (`application`);--> statement-breakpoint
CREATE INDEX `module_registry_is_active_idx` ON `module_registry` (`is_active`);