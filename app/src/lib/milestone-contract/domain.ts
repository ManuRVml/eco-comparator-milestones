import type { MilestoneDefinition, criteriosMilestone, metricasMilestone } from "../../db/milestone-schema";
export type MilestoneCriterion = typeof criteriosMilestone.$inferSelect;
export type MilestoneMetric = typeof metricasMilestone.$inferSelect;
export interface MilestoneContract { definicion: MilestoneDefinition; criterios: MilestoneCriterion[]; metricas: MilestoneMetric[] }
export const EMPTY_DEFINITION: MilestoneDefinition = { job: "", outcome: "", meta: "", alcanceIncluido: "", fueraAlcance: "", responsable: "", aprobador: "", fechaPrevision: "", motivoPrevision: "" };
export function definitionPending(d: MilestoneDefinition): string[] {
  return (["job", "outcome", "meta", "alcanceIncluido", "fueraAlcance", "responsable", "aprobador"] as const).filter(key => !d[key]?.trim());
}
export function metricPending(m: MilestoneMetric): boolean {
  return !m.nombre.trim() || !m.metodo.trim() || (m.tipo === "Cuantitativa" ? !m.unidad.trim() || m.objetivo === null : !m.objetivoCualitativo.trim());
}
export function metricSatisfied(m: MilestoneMetric, c: MilestoneCriterion): boolean {
  if (!m.activa || metricPending(m) || (m.muestraMinima !== null && (c.muestraEvaluada === null || c.muestraEvaluada < m.muestraMinima))) return false;
  if (m.tipo === "Cualitativa") return c.resultadoCualitativo.trim() === m.objetivoCualitativo.trim();
  if (c.resultadoMedido === null || m.objetivo === null) return false;
  const tolerance = (m.tolerancia ?? 0) + Number.EPSILON * Math.max(Math.abs(c.resultadoMedido), Math.abs(m.objetivo), 1) * 4;
  const comparisons = { "Mayor o igual": () => c.resultadoMedido! + tolerance >= m.objetivo!, "Menor o igual": () => c.resultadoMedido! - tolerance <= m.objetivo!, "Igual": () => Math.abs(c.resultadoMedido! - m.objetivo!) <= tolerance };
  return comparisons[m.comparador]();
}
export function contractPending(c: MilestoneContract): string[] {
  const pending = definitionPending(c.definicion);
  const active = c.metricas.filter(m => m.activa), required = c.criterios.filter(v => v.obligatorio);
  if (!active.length) pending.push("métrica activa");
  if (active.some(metricPending)) pending.push("meta y método de medición");
  if (!required.length) pending.push("criterio obligatorio");
  if (required.some(v => !v.evidenciaRequerida.trim())) pending.push("evidencia requerida por criterio");
  if (active.some(m => !required.some(v => v.metricaId === m.id))) pending.push("vincular métricas a criterios obligatorios");
  return pending;
}
export function criterionAccepted(c: MilestoneCriterion, contract: MilestoneContract, hoy: string): boolean {
  const m = c.metricaId ? contract.metricas.find(m => m.id === c.metricaId) : undefined;
  return c.estado === "Verificado" && !!c.evidencia.trim() && !!c.evidenciaRequerida.trim() && c.aprobador.trim() === contract.definicion.aprobador.trim() && !!c.fecha && c.fecha <= hoy && (!c.metricaId || !!m && metricSatisfied(m, c));
}
export function contractAccepted(c: MilestoneContract | undefined, hoy: string): boolean {
  return !!c && !contractPending(c).length && c.criterios.filter(v => v.obligatorio).every(v => criterionAccepted(v, c, hoy));
}
export function acceptanceDate(c: MilestoneContract): string {
  return c.criterios.filter(v => v.obligatorio).map(v => v.fecha).sort().at(-1) ?? "";
}
