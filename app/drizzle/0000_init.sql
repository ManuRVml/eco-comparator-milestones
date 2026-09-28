CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bitacora` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entidad_tipo` text NOT NULL,
	`entidad_id` text NOT NULL,
	`campo` text NOT NULL,
	`valor_anterior` text,
	`valor_nuevo` text,
	`origen` text NOT NULL,
	`actor_rol` text,
	`detalle` text,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bitacora_entidad_idx` ON `bitacora` (`entidad_tipo`,`entidad_id`);--> statement-breakpoint
CREATE TABLE `festivos` (
	`fecha` text PRIMARY KEY NOT NULL,
	`dia_semana` text,
	`festividad` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `historias` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`epica_id` text,
	`epica` text,
	`feature_id` text,
	`feature` text,
	`prioridad` text,
	`sp` integer,
	`sprint_id` text,
	`estado_plan` text,
	`dependencias` text,
	`justificacion` text,
	`estado` text DEFAULT 'No iniciada' NOT NULL,
	`estado_origen` text DEFAULT 'plan' NOT NULL,
	`visible_cliente` integer DEFAULT true NOT NULL,
	`fecha_estado` text,
	`evidencia` text,
	`fecha_cierre` text,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`actualizado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `historias_sprint_idx` ON `historias` (`sprint_id`);--> statement-breakpoint
CREATE TABLE `lineas` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`orden` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `milestone_historia` (
	`milestone_id` text NOT NULL,
	`historia_id` text NOT NULL,
	PRIMARY KEY(`milestone_id`, `historia_id`),
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`historia_id`) REFERENCES `historias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `milestone_tarea` (
	`milestone_id` text NOT NULL,
	`tarea_id` text NOT NULL,
	PRIMARY KEY(`milestone_id`, `tarea_id`),
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`linea_id` text,
	`sprint_id` text,
	`fecha_objetivo` text,
	`criterio` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`estado` text DEFAULT 'No iniciado' NOT NULL,
	`estado_origen` text DEFAULT 'plan' NOT NULL,
	`visible_cliente` integer DEFAULT true NOT NULL,
	`fecha_estado` text,
	`evidencia` text,
	`fecha_cierre` text,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`actualizado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`linea_id`) REFERENCES `lineas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entidad_tipo` text NOT NULL,
	`entidad_id` text NOT NULL,
	`texto` text NOT NULL,
	`autor_rol` text NOT NULL,
	`visible_cliente` integer DEFAULT false NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notas_entidad_idx` ON `notas` (`entidad_tipo`,`entidad_id`);--> statement-breakpoint
CREATE TABLE `sprints` (
	`id` text PRIMARY KEY NOT NULL,
	`numero` integer NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`dias_habiles` integer,
	`objetivo` text,
	`epicas` text,
	`hu_incluidas` text,
	`sp_comprometidos` integer
);
--> statement-breakpoint
CREATE TABLE `tarea_predecesora` (
	`tarea_id` text NOT NULL,
	`predecesora_id` text NOT NULL,
	PRIMARY KEY(`tarea_id`, `predecesora_id`),
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`predecesora_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tareas` (
	`id` text PRIMARY KEY NOT NULL,
	`sprint_id` text,
	`fase` text,
	`epica_id` text,
	`feature_id` text,
	`historia_id` text,
	`nombre` text NOT NULL,
	`descripcion` text,
	`rol` text,
	`tipo_tarea` text,
	`area_id` text NOT NULL,
	`fecha_inicio` text,
	`fecha_fin` text,
	`duracion_dias` integer,
	`ruta_critica` integer DEFAULT false NOT NULL,
	`paralelo_con` text,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	`estado_origen` text DEFAULT 'plan' NOT NULL,
	`visible_cliente` integer DEFAULT true NOT NULL,
	`fecha_estado` text,
	`evidencia` text,
	`fecha_cierre` text,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`actualizado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`historia_id`) REFERENCES `historias`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tareas_sprint_idx` ON `tareas` (`sprint_id`);--> statement-breakpoint
CREATE INDEX `tareas_historia_idx` ON `tareas` (`historia_id`);--> statement-breakpoint
CREATE INDEX `tareas_area_idx` ON `tareas` (`area_id`);