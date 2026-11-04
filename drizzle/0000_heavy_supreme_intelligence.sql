CREATE TABLE `action_items` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`title` text NOT NULL,
	`assignee` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `incident_events` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`service` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	`status` text NOT NULL,
	`commander` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `incidents_number_unique` ON `incidents` (`number`);--> statement-breakpoint
CREATE TABLE `public_status_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`component` text NOT NULL,
	`status` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE set null
);
