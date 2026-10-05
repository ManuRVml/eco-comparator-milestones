import { resumir, type EstadoMilestone, type Model } from "./model";

/** El alistamiento conserva su sprint y tareas; no crea un milestone ni certifica su entrega por fecha. */
export function sprintCheckpoint(model: Model, numero: number, areaId: string | null = null) {
  const sprint = model.sprints.find((s) => s.numero === numero);
  if (!sprint) return null;
  const tareas = model.tareas.filter((t) => t.sprintId === sprint.id && (!areaId || t.areaId === areaId));
  const progreso = resumir(sprint.id, sprint.id, tareas, model.hoy, new Set(model.festivos.map((f) => f.fecha)));
  const hechas = progreso.hechas;
  const estado: EstadoMilestone = tareas.length && hechas === tareas.length ? "Cumplido"
    : hechas || tareas.some((t) => t.estado === "En curso") ? "En curso" : "Pendiente";
  const compromiso = model.workflow?.compromisos.find((c) => c.sprintId === sprint.id);
  return { id: `S${numero}`, sprint, tareas, hechas, estado, porcentaje: progreso.pctReal, progreso, compromiso };
}
