CREATE TABLE `collect_challenges` (
	`token` text PRIMARY KEY NOT NULL,
	`ip` text NOT NULL,
	`origin` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`used_event` text
);
--> statement-breakpoint
CREATE INDEX `challenges_ip_time_idx` ON `collect_challenges` (`ip`,`created_at`);--> statement-breakpoint
CREATE INDEX `challenges_expiry_idx` ON `collect_challenges` (`expires_at`);--> statement-breakpoint
CREATE TABLE `analytics_counter` (
	`id` text PRIMARY KEY NOT NULL,
	`total` integer NOT NULL,
	`started_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_metrics` (
	`day` text PRIMARY KEY NOT NULL,
	`pageviews` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`event_id` text PRIMARY KEY NOT NULL,
	`ip` text NOT NULL,
	`day` text NOT NULL,
	`visited_at` integer NOT NULL,
	`view` text NOT NULL,
	`counted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `visits_time_idx` ON `visits` (`visited_at`);--> statement-breakpoint
CREATE INDEX `visits_day_ip_idx` ON `visits` (`day`,`ip`);