CREATE TABLE `capacidad_historia` (
	`capacidad_id` text NOT NULL,
	`historia_id` text NOT NULL,
	PRIMARY KEY(`capacidad_id`, `historia_id`),
	FOREIGN KEY (`capacidad_id`) REFERENCES `capacidades`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`historia_id`) REFERENCES `historias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `capacidad_historia_hu_idx` ON `capacidad_historia` (`historia_id`);--> statement-breakpoint
CREATE TABLE `capacidades` (
	`id` text PRIMARY KEY NOT NULL,
	`milestone_id` text NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text DEFAULT '' NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`borrador` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "capacidad_borrador" CHECK("capacidades"."borrador" in (0,1))
);
--> statement-breakpoint
CREATE INDEX `capacidades_milestone_idx` ON `capacidades` (`milestone_id`);