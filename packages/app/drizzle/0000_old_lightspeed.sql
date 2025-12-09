CREATE TABLE `broadcasts` (
	`id` integer PRIMARY KEY NOT NULL,
	`twitch_id` integer NOT NULL,
	`title` text NOT NULL,
	`channel_id` integer NOT NULL,
	`published_at` integer NOT NULL,
	`duration` integer NOT NULL,
	`size` integer NOT NULL,
	`path` text NOT NULL,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `broadcasts_twitch_id_unique` ON `broadcasts` (`twitch_id`);--> statement-breakpoint
CREATE TABLE `channels` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`twitch_id` integer NOT NULL,
	`is_following` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channels_twitch_id_unique` ON `channels` (`twitch_id`);