import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { milestones, tareas } from "./schema";

const timestamp = () => text("creado_en").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);

export const fuentesPlan = sqliteTable("fuentes_plan", {
  id: text("id").primaryKey(), nombre: text("nombre").notNull(), fecha: text("fecha").notNull(),
  huella: text("huella").notNull(), contenido: text("contenido").notNull(), creadoEn: timestamp(),
});

// Una referencia conserva el texto de origen y puede relacionarse con varias actividades.
export const referenciasPlan = sqliteTable("referencias_plan", {
  id: text("id").primaryKey(), fuenteId: text("fuente_id").notNull().references(() => fuentesPlan.id),
  idOrigen: text("id_origen").notNull(), nombre: text("nombre").notNull(),
  contenido: text("contenido").notNull(), decision: text("decision").notNull().default("Pendiente de revisión"),
});
export const referenciaTarea = sqliteTable("referencia_tarea", {
  referenciaId: text("referencia_id").notNull().references(() => referenciasPlan.id),
  tareaId: text("tarea_id").notNull().references(() => tareas.id),
  criterio: text("criterio").notNull(),
}, (t) => [primaryKey({ columns: [t.referenciaId, t.tareaId] })]);

export const flujoTarea = sqliteTable("flujo_tarea", {
  tareaId: text("tarea_id").primaryKey().references(() => tareas.id),
  ejecucion: text("ejecucion").notNull(), responsable: text("responsable"),
  insumos: text("insumos"), criterio: text("criterio"), entregaParcial: text("entrega_parcial"),
  prevision: text("prevision"), prioridad: integer("prioridad").notNull().default(0),
  actualizadoEn: text("actualizado_en").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
});
export const validacionesTarea = sqliteTable("validaciones_tarea", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tareaId: text("tarea_id").notNull().references(() => tareas.id), etapa: text("etapa").notNull(),
  resultado: text("resultado").notNull(), evidencia: text("evidencia").notNull(),
  actorRol: text("actor_rol").notNull(), creadoEn: timestamp(),
}, (t) => [index("validaciones_tarea_idx").on(t.tareaId, t.etapa)]);

export const bloqueosTarea = sqliteTable("bloqueos_tarea", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tareaId: text("tarea_id").notNull().references(() => tareas.id),
  tipo: text("tipo").notNull(), afecta: text("afecta").notNull(), descripcion: text("descripcion").notNull(),
  responsable: text("responsable").notNull(), revision: text("revision").notNull(),
  criterioLiberacion: text("criterio_liberacion").notNull(), severidad: text("severidad").notNull(),
  esfuerzoMinutos: integer("esfuerzo_minutos").notNull().default(0),
  resueltoEn: text("resuelto_en"), resolucion: text("resolucion"), creadoEn: timestamp(),
}, (t) => [index("bloqueos_tarea_idx").on(t.tareaId)]);

// Append-only: una reinterpretación crea otra versión; la última es la vigente.
export const relacionesFlujo = sqliteTable("relaciones_flujo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tareaId: text("tarea_id").notNull().references(() => tareas.id),
  proveedorId: text("proveedor_id").notNull().references(() => tareas.id),
  tipo: text("tipo").notNull(), afecta: text("afecta").notNull(), insumo: text("insumo").notNull(),
  criterio: text("criterio").notNull(), disponible: integer("disponible", { mode: "boolean" }).notNull().default(false),
  evidencia: text("evidencia"), actorRol: text("actor_rol").notNull(), creadoEn: timestamp(),
});

export const compromisosSprint = sqliteTable("compromisos_sprint", {
  id: text("id").primaryKey(), fuenteId: text("fuente_id").notNull().references(() => fuentesPlan.id),
  sprintId: text("sprint_id").notNull(), resultado: text("resultado").notNull(),
  criterio: text("criterio").notNull(), fechaBase: text("fecha_base").notNull(),
});
export const compromisoMilestone = sqliteTable("compromiso_milestone", {
  compromisoId: text("compromiso_id").notNull().references(() => compromisosSprint.id),
  milestoneId: text("milestone_id").notNull().references(() => milestones.id),
  criterio: text("criterio").notNull(),
}, (t) => [primaryKey({ columns: [t.compromisoId, t.milestoneId] })]);
export const previsionesMilestone = sqliteTable("previsiones_milestone", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  milestoneId: text("milestone_id").notNull().references(() => milestones.id),
  fecha: text("fecha").notNull(), motivo: text("motivo").notNull(), entregaMinima: text("entrega_minima").notNull(),
  responsable: text("responsable").notNull(), actorRol: text("actor_rol").notNull(), creadoEn: timestamp(),
});

export const lotesReconciliacion = sqliteTable("lotes_reconciliacion", {
  id: text("id").primaryKey(), huella: text("huella").notNull(), inventario: text("inventario").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(false), creadoEn: timestamp(),
});
