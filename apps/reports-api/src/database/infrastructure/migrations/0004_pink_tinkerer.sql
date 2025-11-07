PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_request_categorization` (
	`requestId` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`technician` text NOT NULL,
	`requestIdLink` text,
	`createdTime` text NOT NULL,
	`modulo` text NOT NULL,
	`subject` text NOT NULL,
	`problemId` text NOT NULL,
	`linkedRequestId` text NOT NULL,
	`linkedRequestIdLink` text
);
--> statement-breakpoint
INSERT INTO `__new_request_categorization`("requestId", "category", "technician", "requestIdLink", "createdTime", "modulo", "subject", "problemId", "linkedRequestId", "linkedRequestIdLink") SELECT "requestId", "category", "technician", "requestIdLink", "createdTime", "modulo", "subject", "problemId", "linkedRequestId", "linkedRequestIdLink" FROM `request_categorization`;--> statement-breakpoint
DROP TABLE `request_categorization`;--> statement-breakpoint
ALTER TABLE `__new_request_categorization` RENAME TO `request_categorization`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `rc_category_idx` ON `request_categorization` (`category`);--> statement-breakpoint
CREATE INDEX `rc_technician_idx` ON `request_categorization` (`technician`);