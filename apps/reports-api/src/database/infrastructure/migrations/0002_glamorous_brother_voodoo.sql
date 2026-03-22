PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subject_translations` (
	`request_id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`subject_english` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_subject_translations`("request_id", "subject", "subject_english") SELECT "request_id", "subject", "subject_english" FROM `subject_translations`;--> statement-breakpoint
DROP TABLE `subject_translations`;--> statement-breakpoint
ALTER TABLE `__new_subject_translations` RENAME TO `subject_translations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;