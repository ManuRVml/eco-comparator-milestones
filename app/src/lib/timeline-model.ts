import { ESTADOS_MILESTONE, type Model, type EstadoMilestone } from "./model";
import { sprintCheckpoint } from "./sprint-checkpoint";
import { milestoneCompletado } from "./completion";

/** Los checks se calculan sobre el alcance completo, antes de aplicar filtros de área o visibilidad. */
export function prepararTimeline(model: Model): Model {
  const milestones = model.milestones.map((m) => {
    const cierreVerificado = milestoneCompletado(m, model);
    const estadoFinal: EstadoMilestone = cierreVerificado ? "Cumplido" : m.estadoFinal === "Cumplido" ? (m.fechaObjetivo && m.fechaObjetivo < model.hoy ? "Atrasado" : "En curso") : m.estadoFinal;
    return { ...m, cierreVerificado, estadoFinal };
  });
  const checkpoints = model.sprints.map((s) => sprintCheckpoint(model, s.numero)!);
  return {
    ...model, milestones, milestoneById: new Map(milestones.map((m) => [m.id, m])),
    kpis: { ...model.kpis, milestonesPorEstado: Object.fromEntries(ESTADOS_MILESTONE.map((e) => [e, milestones.filter((m) => m.estadoFinal === e).length])) as Record<EstadoMilestone, number> },
    cierresSprint: Object.fromEntries(checkpoints.map((c) => [c.sprint.id, c.completo])),
    resumenesSprint: Object.fromEntries(checkpoints.map((c) => [c.sprint.id, { total: c.total, areas: c.areas }])),
  };
}
