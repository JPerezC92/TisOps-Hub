ALTER TABLE `request_status_registry` RENAME TO `monthly_report_status_registry`;--> statement-breakpoint
DROP INDEX `request_status_registry_raw_status_unique`;--> statement-breakpoint
DROP INDEX `request_status_registry_raw_status_idx`;--> statement-breakpoint
DROP INDEX `request_status_registry_display_status_idx`;--> statement-breakpoint
DROP INDEX `request_status_registry_is_active_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_report_status_registry_raw_status_unique` ON `monthly_report_status_registry` (`raw_status`);--> statement-breakpoint
CREATE INDEX `monthly_report_status_registry_raw_status_idx` ON `monthly_report_status_registry` (`raw_status`);--> statement-breakpoint
CREATE INDEX `monthly_report_status_registry_display_status_idx` ON `monthly_report_status_registry` (`display_status`);--> statement-breakpoint
CREATE INDEX `monthly_report_status_registry_is_active_idx` ON `monthly_report_status_registry` (`is_active`);