CREATE TABLE `bloqueos_tarea` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tarea_id` text NOT NULL,
	`tipo` text NOT NULL,
	`afecta` text NOT NULL,
	`descripcion` text NOT NULL,
	`responsable` text NOT NULL,
	`revision` text NOT NULL,
	`criterio_liberacion` text NOT NULL,
	`severidad` text NOT NULL,
	`esfuerzo_minutos` integer DEFAULT 0 NOT NULL,
	`resuelto_en` text,
	`resolucion` text,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `bloqueos_tarea_idx` ON `bloqueos_tarea` (`tarea_id`);--> statement-breakpoint
CREATE TABLE `compromiso_milestone` (
	`compromiso_id` text NOT NULL,
	`milestone_id` text NOT NULL,
	`criterio` text NOT NULL,
	PRIMARY KEY(`compromiso_id`, `milestone_id`),
	FOREIGN KEY (`compromiso_id`) REFERENCES `compromisos_sprint`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `compromisos_sprint` (
	`id` text PRIMARY KEY NOT NULL,
	`fuente_id` text NOT NULL,
	`sprint_id` text NOT NULL,
	`resultado` text NOT NULL,
	`criterio` text NOT NULL,
	`fecha_base` text NOT NULL,
	FOREIGN KEY (`fuente_id`) REFERENCES `fuentes_plan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `flujo_tarea` (
	`tarea_id` text PRIMARY KEY NOT NULL,
	`ejecucion` text NOT NULL,
	`responsable` text,
	`insumos` text,
	`criterio` text,
	`entrega_parcial` text,
	`prevision` text,
	`prioridad` integer DEFAULT 0 NOT NULL,
	`actualizado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fuentes_plan` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`fecha` text NOT NULL,
	`huella` text NOT NULL,
	`contenido` text NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lotes_reconciliacion` (
	`id` text PRIMARY KEY NOT NULL,
	`huella` text NOT NULL,
	`inventario` text NOT NULL,
	`activo` integer DEFAULT false NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `previsiones_milestone` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`milestone_id` text NOT NULL,
	`fecha` text NOT NULL,
	`motivo` text NOT NULL,
	`entrega_minima` text NOT NULL,
	`responsable` text NOT NULL,
	`actor_rol` text NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `referencia_tarea` (
	`referencia_id` text NOT NULL,
	`tarea_id` text NOT NULL,
	`criterio` text NOT NULL,
	PRIMARY KEY(`referencia_id`, `tarea_id`),
	FOREIGN KEY (`referencia_id`) REFERENCES `referencias_plan`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `referencias_plan` (
	`id` text PRIMARY KEY NOT NULL,
	`fuente_id` text NOT NULL,
	`id_origen` text NOT NULL,
	`nombre` text NOT NULL,
	`contenido` text NOT NULL,
	`decision` text DEFAULT 'Pendiente de revisión' NOT NULL,
	FOREIGN KEY (`fuente_id`) REFERENCES `fuentes_plan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `relaciones_flujo` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tarea_id` text NOT NULL,
	`proveedor_id` text NOT NULL,
	`tipo` text NOT NULL,
	`afecta` text NOT NULL,
	`insumo` text NOT NULL,
	`criterio` text NOT NULL,
	`disponible` integer DEFAULT false NOT NULL,
	`evidencia` text,
	`actor_rol` text NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`proveedor_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `validaciones_tarea` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tarea_id` text NOT NULL,
	`etapa` text NOT NULL,
	`resultado` text NOT NULL,
	`evidencia` text NOT NULL,
	`actor_rol` text NOT NULL,
	`creado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`tarea_id`) REFERENCES `tareas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `validaciones_tarea_idx` ON `validaciones_tarea` (`tarea_id`,`etapa`);