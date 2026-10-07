import { sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { milestones } from "./schema";

// El JSON original se conserva como archivo histórico; las columnas son la fuente vigente.
export interface LegacyMilestoneDefinition {
  job: string; outcome: string; meta: string; fueraAlcance: string;
  responsable: string; aprobador: string; fechaPrevision: string; motivoPrevision: string;
}
export const fichasMilestone = sqliteTable("fichas_milestone", {
  milestoneId: text("milestone_id").primaryKey().references(() => milestones.id),
  contenido: text("contenido", { mode: "json" }).$type<LegacyMilestoneDefinition>().notNull(),
  job: text("job").notNull().default(""), outcome: text("outcome").notNull().default(""),
  meta: text("meta").notNull().default(""), alcanceIncluido: text("alcance_incluido").notNull().default(""),
  fueraAlcance: text("fuera_alcance").notNull().default(""), responsable: text("responsable").notNull().default(""),
  aprobador: text("aprobador").notNull().default(""), fechaPrevision: text("fecha_prevision").notNull().default(""),
  motivoPrevision: text("motivo_prevision").notNull().default(""),
});
export type MilestoneDefinition = Omit<typeof fichasMilestone.$inferSelect, "milestoneId" | "contenido">;
export const TIPOS_METRICA = ["Cuantitativa", "Cualitativa"] as const;
export const COMPARADORES_METRICA = ["Mayor o igual", "Menor o igual", "Igual"] as const;
export const metricasMilestone = sqliteTable("metricas_milestone", {
  id: text("id").primaryKey(), milestoneId: text("milestone_id").notNull().references(() => milestones.id),
  nombre: text("nombre").notNull(), tipo: text("tipo", { enum: TIPOS_METRICA }).notNull(),
  unidad: text("unidad").notNull().default(""), comparador: text("comparador", { enum: COMPARADORES_METRICA }).notNull().default("Igual"),
  objetivo: real("objetivo"), objetivoCualitativo: text("objetivo_cualitativo").notNull().default(""),
  metodo: text("metodo").notNull().default(""), tolerancia: real("tolerancia"), muestraMinima: integer("muestra_minima"),
  activa: integer("activa", { mode:"boolean" }).notNull().default(true),
}, t => [index("metricas_milestone_idx").on(t.milestoneId), check("metrica_tipo",sql`${t.tipo} in ('Cuantitativa','Cualitativa')`), check("metrica_comparador",sql`${t.comparador} in ('Mayor o igual','Menor o igual','Igual')`), check("metrica_activa",sql`${t.activa} in (0,1)`), check("metrica_tolerancia",sql`${t.tolerancia} is null or ${t.tolerancia} >= 0`), check("metrica_muestra",sql`${t.muestraMinima} is null or (typeof(${t.muestraMinima}) = 'integer' and ${t.muestraMinima} >= 1)`)]);
export const criteriosMilestone = sqliteTable("criterios_milestone", {
  id: text("id").primaryKey(), milestoneId: text("milestone_id").notNull().references(() => milestones.id),
  descripcion: text("descripcion").notNull(), obligatorio: integer("obligatorio", { mode: "boolean" }).notNull().default(true),
  evidenciaRequerida: text("evidencia_requerida").notNull().default(""), metricaId: text("metrica_id").references(() => metricasMilestone.id),
  resultadoMedido: real("resultado_medido"), resultadoCualitativo: text("resultado_cualitativo").notNull().default(""), muestraEvaluada: integer("muestra_evaluada"),
  estado: text("estado", { enum: ["Pendiente", "Verificado"] }).notNull().default("Pendiente"),
  evidencia: text("evidencia").notNull().default(""), aprobador: text("aprobador").notNull().default(""),
  fecha: text("fecha").notNull().default(""),
}, t => [index("criterios_milestone_idx").on(t.milestoneId), check("criterio_estado",sql`${t.estado} in ('Pendiente','Verificado')`), check("criterio_obligatorio",sql`${t.obligatorio} in (0,1)`), check("criterio_muestra",sql`${t.muestraEvaluada} is null or (typeof(${t.muestraEvaluada}) = 'integer' and ${t.muestraEvaluada} >= 1)`)]);
export const decisionesPendientes = sqliteTable("decisiones_pendientes", {
  id: text("id").primaryKey(), milestoneId: text("milestone_id").notNull().references(() => milestones.id),
  texto: text("texto").notNull(), responsableCliente: text("responsable_cliente").notNull().default(""),
  fechaLimite: text("fecha_limite").notNull().default(""),
  resuelta: integer("resuelta", { mode: "boolean" }).notNull().default(false),
  /** Borrador: propuesto por el equipo, aún no confirmado para mostrarse al cliente. */
  borrador: integer("borrador", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
}, t => [index("decisiones_pendientes_idx").on(t.milestoneId), check("decision_resuelta",sql`${t.resuelta} in (0,1)`), check("decision_borrador",sql`${t.borrador} in (0,1)`)]);
