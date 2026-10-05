CREATE TABLE `criterios_milestone` (
	`id` text PRIMARY KEY NOT NULL,
	`milestone_id` text NOT NULL,
	`descripcion` text NOT NULL,
	`obligatorio` integer DEFAULT true NOT NULL,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	`evidencia` text DEFAULT '' NOT NULL,
	`aprobador` text DEFAULT '' NOT NULL,
	`fecha` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fichas_milestone` (
	`milestone_id` text PRIMARY KEY NOT NULL,
	`contenido` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `criterios_milestone` (`id`, `milestone_id`, `descripcion`)
SELECT `id` || '-C01', `id`, `criterio` FROM `milestones` WHERE length(trim(coalesce(`criterio`, ''))) > 0;
