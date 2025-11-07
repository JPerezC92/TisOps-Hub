CREATE TABLE `rep01_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_time` text NOT NULL,
	`request_id` text NOT NULL,
	`informacion_adicional` text NOT NULL,
	`modulo` text NOT NULL,
	`problem_id` text NOT NULL,
	`linked_request_id` text NOT NULL,
	`jira` text NOT NULL,
	`categorizacion` text NOT NULL,
	`technician` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rep01_tags_request_id_unique` ON `rep01_tags` (`request_id`);--> statement-breakpoint
CREATE INDEX `rep01_request_id_idx` ON `rep01_tags` (`request_id`);--> statement-breakpoint
CREATE INDEX `rep01_problem_id_idx` ON `rep01_tags` (`problem_id`);--> statement-breakpoint
CREATE INDEX `rep01_linked_request_id_idx` ON `rep01_tags` (`linked_request_id`);--> statement-breakpoint
CREATE INDEX `rep01_categorizacion_idx` ON `rep01_tags` (`categorizacion`);--> statement-breakpoint
CREATE INDEX `rep01_technician_idx` ON `rep01_tags` (`technician`);--> statement-breakpoint
CREATE INDEX `rep01_modulo_idx` ON `rep01_tags` (`modulo`);