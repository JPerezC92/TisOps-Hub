CREATE TABLE `problems` (
	`request_id` integer PRIMARY KEY NOT NULL,
	`service_category` text NOT NULL,
	`subject` text NOT NULL,
	`created_time` text NOT NULL,
	`aplicativos` text NOT NULL,
	`created_by` text NOT NULL,
	`planes_de_accion` text NOT NULL,
	`observaciones` text NOT NULL,
	`due_by_time` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `problems_aplicativos_idx` ON `problems` (`aplicativos`);--> statement-breakpoint
CREATE INDEX `problems_created_by_idx` ON `problems` (`created_by`);--> statement-breakpoint
CREATE INDEX `problems_service_category_idx` ON `problems` (`service_category`);