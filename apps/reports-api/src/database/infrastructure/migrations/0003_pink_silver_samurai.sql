CREATE TABLE `error_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`error_type` text NOT NULL,
	`error_message` text NOT NULL,
	`stack_trace` text,
	`endpoint` text,
	`method` text,
	`user_id` text,
	`metadata` text
);
