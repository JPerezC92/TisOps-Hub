PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rep01_tags` (
	`request_id` text PRIMARY KEY NOT NULL,
	`created_time` text NOT NULL,
	`informacion_adicional` text NOT NULL,
	`modulo` text NOT NULL,
	`problem_id` text NOT NULL,
	`linked_request_id` text NOT NULL,
	`jira` text NOT NULL,
	`categorizacion` text NOT NULL,
	`technician` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_rep01_tags`("request_id", "created_time", "informacion_adicional", "modulo", "problem_id", "linked_request_id", "jira", "categorizacion", "technician") SELECT "request_id", "created_time", "informacion_adicional", "modulo", "problem_id", "linked_request_id", "jira", "categorizacion", "technician" FROM `rep01_tags`;--> statement-breakpoint
DROP TABLE `rep01_tags`;--> statement-breakpoint
ALTER TABLE `__new_rep01_tags` RENAME TO `rep01_tags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `rep01_problem_id_idx` ON `rep01_tags` (`problem_id`);--> statement-breakpoint
CREATE INDEX `rep01_linked_request_id_idx` ON `rep01_tags` (`linked_request_id`);--> statement-breakpoint
CREATE INDEX `rep01_categorizacion_idx` ON `rep01_tags` (`categorizacion`);--> statement-breakpoint
CREATE INDEX `rep01_technician_idx` ON `rep01_tags` (`technician`);--> statement-breakpoint
CREATE INDEX `rep01_modulo_idx` ON `rep01_tags` (`modulo`);