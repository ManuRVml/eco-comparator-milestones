CREATE TABLE `agenda_hu` (
	`historia_id` text PRIMARY KEY NOT NULL,
	`fecha_weekly` text NOT NULL,
	`estado_evidencia` text,
	FOREIGN KEY (`historia_id`) REFERENCES `historias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `agenda_weekly` (
	`fecha` text PRIMARY KEY NOT NULL,
	`n_hu` integer NOT NULL,
	`sp_total` integer NOT NULL,
	`epicas` text
);
--> statement-breakpoint
CREATE TABLE `avance_area_base` (
	`area` text PRIMARY KEY NOT NULL,
	`tareas_total` integer NOT NULL,
	`tareas_planificadas_hoy` integer NOT NULL,
	`tareas_hechas` integer NOT NULL,
	`tareas_parciales` integer NOT NULL,
	`dias_habiles_total` integer NOT NULL,
	`dias_habiles_hechos` integer NOT NULL,
	`pct_planificado` real NOT NULL,
	`pct_real` real NOT NULL,
	`brecha` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `calendario` (
	`fecha` text PRIMARY KEY NOT NULL,
	`dia_semana` text,
	`es_habil` integer NOT NULL,
	`sprint_id` text,
	`es_jueves` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configuracion` (
	`clave` text PRIMARY KEY NOT NULL,
	`valor` text NOT NULL,
	`actualizado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `milestone_dependencia` (
	`milestone_id` text NOT NULL,
	`depende_de_id` text NOT NULL,
	PRIMARY KEY(`milestone_id`, `depende_de_id`),
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depende_de_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `milestone_riesgo` (
	`milestone_id` text NOT NULL,
	`riesgo_id` text NOT NULL,
	PRIMARY KEY(`milestone_id`, `riesgo_id`),
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`riesgo_id`) REFERENCES `riesgos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `riesgos` (
	`id` text PRIMARY KEY NOT NULL,
	`descripcion` text NOT NULL,
	`categoria` text,
	`probabilidad` text,
	`impacto` text,
	`mitigacion` text,
	`fuente` text,
	`interno` integer DEFAULT true NOT NULL,
	`actualizado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `milestones` ADD `valor_cliente` text;--> statement-breakpoint
ALTER TABLE `milestones` ADD `sprints_texto` text;--> statement-breakpoint
ALTER TABLE `milestones` ADD `epicas` text;--> statement-breakpoint
ALTER TABLE `milestones` ADD `avance_codigo_pct` real;--> statement-breakpoint
ALTER TABLE `milestones` ADD `avance_codigo_evidencia` text;--> statement-breakpoint
ALTER TABLE `tareas` ADD `dias_habiles` integer;