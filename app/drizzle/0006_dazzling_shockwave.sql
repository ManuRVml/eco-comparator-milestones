CREATE TABLE `pendientes` (
	`id` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`detalle` text,
	`lado` text NOT NULL,
	`tipo` text DEFAULT 'otro' NOT NULL,
	`responsable` text,
	`milestone_id` text,
	`fecha_limite` text,
	`estado` text DEFAULT 'abierto' NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`resuelto_en` text,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action
);
