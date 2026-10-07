CREATE TABLE `decisiones_pendientes` (
	`id` text PRIMARY KEY NOT NULL,
	`milestone_id` text NOT NULL,
	`texto` text NOT NULL,
	`responsable_cliente` text DEFAULT '' NOT NULL,
	`fecha_limite` text DEFAULT '' NOT NULL,
	`resuelta` integer DEFAULT false NOT NULL,
	`borrador` integer DEFAULT true NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "decision_resuelta" CHECK("decisiones_pendientes"."resuelta" in (0,1)),
	CONSTRAINT "decision_borrador" CHECK("decisiones_pendientes"."borrador" in (0,1))
);
--> statement-breakpoint
CREATE INDEX `decisiones_pendientes_idx` ON `decisiones_pendientes` (`milestone_id`);