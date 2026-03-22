PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subject_translations` (
	`request_id` integer PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`subject_english` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_subject_translations`("request_id", "subject", "subject_english") SELECT "request_id", "subject", "subject_english" FROM `subject_translations`;--> statement-breakpoint
DROP TABLE `subject_translations`;--> statement-breakpoint
ALTER TABLE `__new_subject_translations` RENAME TO `subject_translations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_weekly_correctives` (
	`request_id` integer PRIMARY KEY NOT NULL,
	`request_id_link` text,
	`technician` text NOT NULL,
	`aplicativos` text NOT NULL,
	`categorizacion` text NOT NULL,
	`created_time` text NOT NULL,
	`request_status` text NOT NULL,
	`modulo` text NOT NULL,
	`subject` text NOT NULL,
	`priority` text NOT NULL,
	`eta` text NOT NULL,
	`rca` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_weekly_correctives`("request_id", "request_id_link", "technician", "aplicativos", "categorizacion", "created_time", "request_status", "modulo", "subject", "priority", "eta", "rca") SELECT "request_id", "request_id_link", "technician", "aplicativos", "categorizacion", "created_time", "request_status", "modulo", "subject", "priority", "eta", "rca" FROM `weekly_correctives`;--> statement-breakpoint
DROP TABLE `weekly_correctives`;--> statement-breakpoint
ALTER TABLE `__new_weekly_correctives` RENAME TO `weekly_correctives`;--> statement-breakpoint
CREATE INDEX `weekly_correctives_technician_idx` ON `weekly_correctives` (`technician`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_aplicativos_idx` ON `weekly_correctives` (`aplicativos`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_categorizacion_idx` ON `weekly_correctives` (`categorizacion`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_status_idx` ON `weekly_correctives` (`request_status`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_priority_idx` ON `weekly_correctives` (`priority`);