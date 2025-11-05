CREATE TABLE `parent_child_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_id` text NOT NULL,
	`linked_request_id` text NOT NULL,
	`request_id_link` text,
	`linked_request_id_link` text
);
--> statement-breakpoint
CREATE INDEX `linked_request_id_idx` ON `parent_child_requests` (`linked_request_id`);--> statement-breakpoint
CREATE INDEX `request_id_idx` ON `parent_child_requests` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_relationship_idx` ON `parent_child_requests` (`request_id`,`linked_request_id`);--> statement-breakpoint
CREATE TABLE `request_categorization` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`technician` text NOT NULL,
	`requestId` text NOT NULL,
	`requestIdLink` text,
	`createdTime` text NOT NULL,
	`modulo` text NOT NULL,
	`subject` text NOT NULL,
	`problemId` text NOT NULL,
	`linkedRequestId` text NOT NULL,
	`linkedRequestIdLink` text
);
--> statement-breakpoint
CREATE INDEX `rc_category_idx` ON `request_categorization` (`category`);--> statement-breakpoint
CREATE INDEX `rc_request_id_idx` ON `request_categorization` (`requestId`);--> statement-breakpoint
CREATE INDEX `rc_technician_idx` ON `request_categorization` (`technician`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
