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
CREATE TABLE `war_rooms` (
	`incident_id` integer PRIMARY KEY NOT NULL,
	`application` text NOT NULL,
	`date` integer NOT NULL,
	`summary` text NOT NULL,
	`initial_priority` text NOT NULL,
	`start_time` real NOT NULL,
	`duration_minutes` integer NOT NULL,
	`end_time` real NOT NULL,
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