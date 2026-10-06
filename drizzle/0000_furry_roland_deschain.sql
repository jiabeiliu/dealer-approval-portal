CREATE TABLE `dealer_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`dealer` text NOT NULL,
	`email` text NOT NULL,
	`school` text NOT NULL,
	`district` text NOT NULL,
	`product` text NOT NULL,
	`quantity` integer NOT NULL,
	`reason` text NOT NULL,
	`submitted_at` integer NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`decided_at` integer,
	`decided_by` text
);
