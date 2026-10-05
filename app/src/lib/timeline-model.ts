import type { Model } from "./model";
import { sprintCheckpoint } from "./sprint-checkpoint";
import { milestoneCompletado } from "./completion";

/** Los checks se calculan sobre el alcance completo, antes de aplicar filtros de área o visibilidad. */
export function prepararTimeline(model: Model): Model {
  const milestones = model.milestones.map((m) => ({ ...m, cierreVerificado: milestoneCompletado(m, model) }));
  const checkpoints = model.sprints.map((s) => sprintCheckpoint(model, s.numero)!);
  return {
    ...model, milestones, milestoneById: new Map(milestones.map((m) => [m.id, m])),
    cierresSprint: Object.fromEntries(checkpoints.map((c) => [c.sprint.id, c.completo])),
    resumenesSprint: Object.fromEntries(checkpoints.map((c) => [c.sprint.id, { total: c.total, areas: c.areas }])),
  };
}
