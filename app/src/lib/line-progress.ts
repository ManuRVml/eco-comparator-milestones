import { resumir, type Model } from "./model";

/** Una tarea puede contribuir a varios milestones; dentro de la línea se cuenta una sola vez. */
export function progresoLinea(model: Model, lineaId: string, areaId: string | null = null) {
  const ids = new Set(model.milestones.filter((m) => m.lineaId === lineaId).flatMap((m) => m.tareaIds));
  const tareas = model.tareas.filter((t) => ids.has(t.id) && (!areaId || t.areaId === areaId));
  return resumir(lineaId, lineaId, tareas, model.hoy, new Set(model.festivos.map((f) => f.fecha)));
}
