CREATE TABLE `metricas_milestone` (
	`id` text PRIMARY KEY NOT NULL,
	`milestone_id` text NOT NULL,
	`nombre` text NOT NULL,
	`tipo` text NOT NULL,
	`unidad` text DEFAULT '' NOT NULL,
	`comparador` text DEFAULT 'Igual' NOT NULL,
	`objetivo` real,
	`objetivo_cualitativo` text DEFAULT '' NOT NULL,
	`metodo` text DEFAULT '' NOT NULL,
	`tolerancia` real,
	`muestra_minima` integer,
	`activa` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "metrica_tipo" CHECK("metricas_milestone"."tipo" in ('Cuantitativa','Cualitativa')),
	CONSTRAINT "metrica_comparador" CHECK("metricas_milestone"."comparador" in ('Mayor o igual','Menor o igual','Igual')),
	CONSTRAINT "metrica_activa" CHECK("metricas_milestone"."activa" in (0,1)),
	CONSTRAINT "metrica_tolerancia" CHECK("metricas_milestone"."tolerancia" is null or "metricas_milestone"."tolerancia" >= 0),
	CONSTRAINT "metrica_muestra" CHECK("metricas_milestone"."muestra_minima" is null or (typeof("metricas_milestone"."muestra_minima") = 'integer' and "metricas_milestone"."muestra_minima" >= 1))
);
--> statement-breakpoint
CREATE INDEX `metricas_milestone_idx` ON `metricas_milestone` (`milestone_id`);--> statement-breakpoint
CREATE TABLE `__new_criterios_milestone` (
	`id` text PRIMARY KEY NOT NULL,
	`milestone_id` text NOT NULL,
	`descripcion` text NOT NULL,
	`obligatorio` integer DEFAULT true NOT NULL,
	`evidencia_requerida` text DEFAULT '' NOT NULL,
	`metrica_id` text,
	`resultado_medido` real,
	`resultado_cualitativo` text DEFAULT '' NOT NULL,
	`muestra_evaluada` integer,
	`estado` text DEFAULT 'Pendiente' NOT NULL,
	`evidencia` text DEFAULT '' NOT NULL,
	`aprobador` text DEFAULT '' NOT NULL,
	`fecha` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`metrica_id`) REFERENCES `metricas_milestone`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "criterio_estado" CHECK("__new_criterios_milestone"."estado" in ('Pendiente','Verificado')),
	CONSTRAINT "criterio_obligatorio" CHECK("__new_criterios_milestone"."obligatorio" in (0,1)),
	CONSTRAINT "criterio_muestra" CHECK("__new_criterios_milestone"."muestra_evaluada" is null or (typeof("__new_criterios_milestone"."muestra_evaluada") = 'integer' and "__new_criterios_milestone"."muestra_evaluada" >= 1))
);
--> statement-breakpoint
INSERT INTO __new_criterios_milestone(id,milestone_id,descripcion,obligatorio,estado,evidencia,aprobador,fecha) SELECT id,milestone_id,descripcion,obligatorio,estado,evidencia,aprobador,fecha FROM criterios_milestone;--> statement-breakpoint
DROP TABLE `criterios_milestone`;--> statement-breakpoint
ALTER TABLE `__new_criterios_milestone` RENAME TO `criterios_milestone`;--> statement-breakpoint
CREATE INDEX `criterios_milestone_idx` ON `criterios_milestone` (`milestone_id`);--> statement-breakpoint
CREATE TABLE __new_fichas_milestone (
 milestone_id text PRIMARY KEY NOT NULL REFERENCES milestones(id), contenido text NOT NULL,
 job text NOT NULL DEFAULT '', outcome text NOT NULL DEFAULT '', meta text NOT NULL DEFAULT '', alcance_incluido text NOT NULL DEFAULT '',
 fuera_alcance text NOT NULL DEFAULT '', responsable text NOT NULL DEFAULT '', aprobador text NOT NULL DEFAULT '', fecha_prevision text NOT NULL DEFAULT '', motivo_prevision text NOT NULL DEFAULT ''
);--> statement-breakpoint
INSERT INTO __new_fichas_milestone(milestone_id,contenido,job,outcome,meta,fuera_alcance,responsable,aprobador,fecha_prevision,motivo_prevision) SELECT milestone_id,contenido,coalesce(json_extract(contenido,'$.job'),''),coalesce(json_extract(contenido,'$.outcome'),''),coalesce(json_extract(contenido,'$.meta'),''),coalesce(json_extract(contenido,'$.fueraAlcance'),''),coalesce(json_extract(contenido,'$.responsable'),''),coalesce(json_extract(contenido,'$.aprobador'),''),coalesce(json_extract(contenido,'$.fechaPrevision'),''),coalesce(json_extract(contenido,'$.motivoPrevision'),'') FROM fichas_milestone;--> statement-breakpoint
DROP TABLE fichas_milestone;--> statement-breakpoint
ALTER TABLE __new_fichas_milestone RENAME TO fichas_milestone;
