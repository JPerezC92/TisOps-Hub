CREATE TABLE `application_patterns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`pattern` text NOT NULL,
	`priority` integer DEFAULT 100 NOT NULL,
	`match_type` text DEFAULT 'contains' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `application_registry`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `application_patterns_application_id_idx` ON `application_patterns` (`application_id`);--> statement-breakpoint
CREATE INDEX `application_patterns_priority_idx` ON `application_patterns` (`priority`);--> statement-breakpoint
CREATE INDEX `application_patterns_is_active_idx` ON `application_patterns` (`is_active`);--> statement-breakpoint
CREATE TABLE `application_registry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `application_registry_code_unique` ON `application_registry` (`code`);--> statement-breakpoint
CREATE INDEX `application_registry_code_idx` ON `application_registry` (`code`);--> statement-breakpoint
CREATE INDEX `application_registry_is_active_idx` ON `application_registry` (`is_active`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `monthly_reports` (
	`request_id` integer PRIMARY KEY NOT NULL,
	`aplicativos` text NOT NULL,
	`categorizacion` text NOT NULL,
	`created_time` text NOT NULL,
	`request_status` text NOT NULL,
	`modulo` text NOT NULL,
	`subject` text NOT NULL,
	`priority` text NOT NULL,
	`eta` text NOT NULL,
	`informacion_adicional` text NOT NULL,
	`resolved_time` text NOT NULL,
	`paises_afectados` text NOT NULL,
	`recurrencia` text NOT NULL,
	`technician` text NOT NULL,
	`jira` text NOT NULL,
	`problem_id` text NOT NULL,
	`linked_request_id` text NOT NULL,
	`request_ola_status` text NOT NULL,
	`grupo_escalamiento` text NOT NULL,
	`aplicactivos_afectados` text NOT NULL,
	`nivel_uno` text NOT NULL,
	`campana` text NOT NULL,
	`cuv` text NOT NULL,
	`release` text NOT NULL,
	`rca` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `monthly_reports_aplicativos_idx` ON `monthly_reports` (`aplicativos`);--> statement-breakpoint
CREATE INDEX `monthly_reports_categorizacion_idx` ON `monthly_reports` (`categorizacion`);--> statement-breakpoint
CREATE INDEX `monthly_reports_status_idx` ON `monthly_reports` (`request_status`);--> statement-breakpoint
CREATE INDEX `monthly_reports_priority_idx` ON `monthly_reports` (`priority`);--> statement-breakpoint
CREATE INDEX `monthly_reports_technician_idx` ON `monthly_reports` (`technician`);--> statement-breakpoint
CREATE INDEX `monthly_reports_created_time_idx` ON `monthly_reports` (`created_time`);--> statement-breakpoint
CREATE TABLE `parent_child_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_id` text NOT NULL,
	`linked_request_id` text NOT NULL,
	`request_id_link` text,
	`linked_request_id_link` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `linked_request_id_idx` ON `parent_child_requests` (`linked_request_id`);--> statement-breakpoint
CREATE INDEX `request_id_idx` ON `parent_child_requests` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_relationship_idx` ON `parent_child_requests` (`request_id`,`linked_request_id`);--> statement-breakpoint
CREATE TABLE `problems` (
	`request_id` integer PRIMARY KEY NOT NULL,
	`request_id_link` text,
	`service_category` text NOT NULL,
	`subject` text NOT NULL,
	`subject_link` text,
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
CREATE INDEX `problems_service_category_idx` ON `problems` (`service_category`);--> statement-breakpoint
CREATE TABLE `request_categorization` (
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
CREATE INDEX `rc_category_idx` ON `request_categorization` (`category`);--> statement-breakpoint
CREATE INDEX `rc_technician_idx` ON `request_categorization` (`technician`);--> statement-breakpoint
CREATE TABLE `request_tags` (
	`request_id` text PRIMARY KEY NOT NULL,
	`request_id_link` text,
	`created_time` text NOT NULL,
	`informacion_adicional` text NOT NULL,
	`modulo` text NOT NULL,
	`problem_id` text NOT NULL,
	`linked_request_id` text NOT NULL,
	`linked_request_id_link` text,
	`jira` text NOT NULL,
	`categorizacion` text NOT NULL,
	`technician` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `request_problem_id_idx` ON `request_tags` (`problem_id`);--> statement-breakpoint
CREATE INDEX `request_linked_request_id_idx` ON `request_tags` (`linked_request_id`);--> statement-breakpoint
CREATE INDEX `request_categorizacion_idx` ON `request_tags` (`categorizacion`);--> statement-breakpoint
CREATE INDEX `request_technician_idx` ON `request_tags` (`technician`);--> statement-breakpoint
CREATE INDEX `request_modulo_idx` ON `request_tags` (`modulo`);--> statement-breakpoint
CREATE TABLE `sessions_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ano` integer NOT NULL,
	`mes` integer NOT NULL,
	`peak` integer NOT NULL,
	`dia` integer NOT NULL,
	`incidentes` integer NOT NULL,
	`placed_orders` integer NOT NULL,
	`billed_orders` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_orders_ano_idx` ON `sessions_orders` (`ano`);--> statement-breakpoint
CREATE INDEX `sessions_orders_mes_idx` ON `sessions_orders` (`mes`);--> statement-breakpoint
CREATE INDEX `sessions_orders_dia_idx` ON `sessions_orders` (`dia`);--> statement-breakpoint
CREATE TABLE `sessions_orders_releases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`semana` text NOT NULL,
	`aplicacion` text NOT NULL,
	`fecha` integer NOT NULL,
	`release` text NOT NULL,
	`tickets_count` integer NOT NULL,
	`tickets_data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_orders_releases_aplicacion_idx` ON `sessions_orders_releases` (`aplicacion`);--> statement-breakpoint
CREATE INDEX `sessions_orders_releases_semana_idx` ON `sessions_orders_releases` (`semana`);--> statement-breakpoint
CREATE INDEX `sessions_orders_releases_fecha_idx` ON `sessions_orders_releases` (`fecha`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `war_rooms` (
	`request_id` integer PRIMARY KEY NOT NULL,
	`request_id_link` text NOT NULL,
	`application` text NOT NULL,
	`date` integer NOT NULL,
	`summary` text NOT NULL,
	`initial_priority` text NOT NULL,
	`start_time` integer NOT NULL,
	`duration_minutes` integer NOT NULL,
	`end_time` integer NOT NULL,
	`participants` integer NOT NULL,
	`status` text NOT NULL,
	`priority_changed` text NOT NULL,
	`resolution_team_changed` text NOT NULL,
	`notes` text NOT NULL,
	`rca_status` text NOT NULL,
	`url_rca` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `war_rooms_application_idx` ON `war_rooms` (`application`);--> statement-breakpoint
CREATE INDEX `war_rooms_status_idx` ON `war_rooms` (`status`);--> statement-breakpoint
CREATE INDEX `war_rooms_priority_idx` ON `war_rooms` (`initial_priority`);--> statement-breakpoint
CREATE INDEX `war_rooms_date_idx` ON `war_rooms` (`date`);--> statement-breakpoint
CREATE TABLE `weekly_correctives` (
	`request_id` text PRIMARY KEY NOT NULL,
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
CREATE INDEX `weekly_correctives_technician_idx` ON `weekly_correctives` (`technician`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_aplicativos_idx` ON `weekly_correctives` (`aplicativos`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_categorizacion_idx` ON `weekly_correctives` (`categorizacion`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_status_idx` ON `weekly_correctives` (`request_status`);--> statement-breakpoint
CREATE INDEX `weekly_correctives_priority_idx` ON `weekly_correctives` (`priority`);