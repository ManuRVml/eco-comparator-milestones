import type { MilestoneView, Model, Tarea } from "./model";
import { insumosPendientes } from "./workflow/readiness";
import { acceptanceDate, contractAccepted } from "./milestone-contract/domain";

export function tareaCompletada(t: Tarea, model: Pick<Model, "capa" | "hoy">): boolean {
  if (t.estado !== "Hecha") return false;
  return model.capa === "oficial"
    ? !!t.publicadoCliente && !!t.fechaPublicacion && t.fechaPublicacion <= model.hoy && !!t.notaPublicacion?.trim()
    : !!t.evidencia?.trim();
}

/** Cierre completo: implementación con evidencia y, con flujo activo, integración y aceptación verificadas. */
export function tareaVerificada(t: Tarea, model: Model): boolean {
  if (!tareaCompletada(t, model)) return false;
  const w = model.workflow;
  if (model.capa === "oficial") return true;
  if (!w?.activo) return false;
  if (insumosPendientes(w, t.id, ["Inicio", "Ejecución", "Integración", "Aceptación"])) return false;
  return ["Integración", "Aceptación"].every((etapa) => {
    const v = w.validaciones.filter((v) => v.tareaId === t.id && v.etapa === etapa).at(-1);
    return !!v?.evidencia.trim() && ["Verificada", "No aplica"].includes(v.resultado);
  });
}

export function milestoneCompletado(m: MilestoneView, model: Model): boolean {
  const contract = model.contratosMilestone?.[m.id];
  return m.publicado && !!m.fechaCierre && m.fechaCierre <= model.hoy && !!m.evidencia?.trim() &&
    contractAccepted(contract, model.hoy) && !!contract && m.fechaCierre >= acceptanceDate(contract);
}
