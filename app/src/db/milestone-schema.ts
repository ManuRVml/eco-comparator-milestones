import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export interface MilestoneDefinition {
  job: string; outcome: string; meta: string; fueraAlcance: string;
  responsable: string; aprobador: string; fechaPrevision: string; motivoPrevision: string;
}
export const fichasMilestone = sqliteTable("fichas_milestone", {
  milestoneId: text("milestone_id").primaryKey(),
  contenido: text("contenido", { mode: "json" }).$type<MilestoneDefinition>().notNull(),
});
export const criteriosMilestone = sqliteTable("criterios_milestone", {
  id: text("id").primaryKey(), milestoneId: text("milestone_id").notNull(),
  descripcion: text("descripcion").notNull(), obligatorio: integer("obligatorio", { mode: "boolean" }).notNull().default(true),
  estado: text("estado", { enum: ["Pendiente", "Verificado"] }).notNull().default("Pendiente"),
  evidencia: text("evidencia").notNull().default(""), aprobador: text("aprobador").notNull().default(""),
  fecha: text("fecha").notNull().default(""),
});
