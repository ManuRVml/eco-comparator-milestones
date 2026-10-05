import type { MilestoneDefinition, criteriosMilestone } from "../../db/milestone-schema";
export type MilestoneCriterion = typeof criteriosMilestone.$inferSelect;
export interface MilestoneContract { definicion: MilestoneDefinition; criterios: MilestoneCriterion[] }
export const EMPTY_DEFINITION: MilestoneDefinition = { job: "", outcome: "", meta: "", fueraAlcance: "", responsable: "", aprobador: "", fechaPrevision: "", motivoPrevision: "" };
export function definitionPending(d: MilestoneDefinition): string[] {
  return (["job", "outcome", "meta", "fueraAlcance", "responsable", "aprobador"] as const).filter((key) => !d[key].trim());
}
export function contractAccepted(c: MilestoneContract | undefined, hoy: string): boolean {
  if (!c || definitionPending(c.definicion).length) return false;
  const required = c.criterios.filter((v) => v.obligatorio);
  return required.length > 0 && required.every((v) => v.estado === "Verificado" && !!v.evidencia.trim() && v.aprobador.trim() === c.definicion.aprobador.trim() && !!v.fecha && v.fecha <= hoy);
}
export function acceptanceDate(c: MilestoneContract): string {
  return c.criterios.filter((v) => v.obligatorio).map((v) => v.fecha).sort().at(-1) ?? "";
}
