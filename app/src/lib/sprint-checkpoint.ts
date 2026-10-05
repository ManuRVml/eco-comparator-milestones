import { progresoAreas, resumir, type EstadoMilestone, type Model } from "./model";
import { tareaVerificada } from "./completion";

/** El alistamiento conserva su sprint y tareas; no crea un milestone ni certifica su entrega por fecha. */
export function sprintCheckpoint(model: Model, numero: number, areaId: string | null = null) {
  const sprint = model.sprints.find((s) => s.numero === numero);
  if (!sprint) return null;
  const todas = model.tareas.filter((t) => t.sprintId === sprint.id);
  const tareas = todas.filter((t) => !areaId || t.areaId === areaId);
  const festivos = new Set(model.festivos.map((f) => f.fecha));
  const total = model.resumenesSprint?.[sprint.id]?.total ?? resumir(sprint.id, sprint.id, todas, model.hoy, festivos);
  const areas = model.resumenesSprint?.[sprint.id]?.areas ?? progresoAreas(todas, model.areas, model.hoy, festivos);
  const progreso = areaId ? (areas.find((a) => a.areaId === areaId) ?? resumir(areaId, areaId, [], model.hoy, festivos)) : total;
  const hechas = progreso.hechas;
  const planes = model.planesSprint?.filter((p) => p.sprintId === sprint.id) ?? [];
  const compromiso = planes.length === 1 ? planes[0] : null;
  const referenciasPendientes = compromiso?.referenciasPendientes ?? 1;
  const requeridas = [...new Set([...todas.map((t) => t.id), ...(compromiso?.tareaIds ?? [])])];
  const completo = model.cierresSprint?.[sprint.id] ?? (requeridas.length > 0 && !!compromiso && referenciasPendientes === 0 && compromiso.fechaBase === sprint.fechaFin && requeridas.every((id) => {
    const t = model.tareaById.get(id); return !!t && tareaVerificada(t, model);
  }));
  const estado: EstadoMilestone = completo ? "Cumplido"
    : sprint.fechaFin < model.hoy ? "Atrasado"
    : todas.some((t) => t.estado === "Hecha" || t.estado === "En curso") ? "En curso" : "Pendiente";
  return { id: `S${numero}`, sprint, tareas, hechas, estado, completo, referenciasPendientes, porcentaje: progreso.pctReal, progreso, total, areas, compromiso };
}
