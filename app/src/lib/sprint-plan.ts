import { eq, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { compromisosSprint, fuentesPlan, referenciaTarea } from "../db/schema";
import { parseSources } from "./plan-sources";

/** Solo plan y correspondencias; no transporta evidencias, recursos, bloqueos ni archivos originales. */
export interface SprintPlan {
  id: string; sprintId: string; resultado: string; criterio: string; fechaBase: string;
  tareaIds: string[]; referenciasPendientes: number; referenciasTotales: number;
}

export async function loadSprintPlans(db: Db): Promise<SprintPlan[]> {
  const exists = await db.all(sql`select name from sqlite_master where type='table' and name='compromisos_sprint'`);
  if (!exists.length) return [];
  const [compromisos, fuentes, correspondencias] = await Promise.all([
    db.select().from(compromisosSprint),
    db.select({ id: fuentesPlan.id, nombre: fuentesPlan.nombre, contenido: fuentesPlan.contenido }).from(fuentesPlan).where(eq(fuentesPlan.nombre, "02_working_plan_benchhub.md")),
    db.select().from(referenciaTarea),
  ]);
  const originales = fuentes.flatMap((f) => parseSources([{ nombre: f.nombre, contenido: f.contenido }]).hitos);
  return compromisos.map((c) => {
    const original = originales.find((h) => `${h.fuenteId}:${h.idOrigen}` === c.id);
    const refs = original?.tareas.map((id) => `${c.fuenteId}:${id}`) ?? [];
    return {
      id: original?.idOrigen ?? c.id.split(":").at(-1)!, sprintId: c.sprintId,
      resultado: c.resultado, criterio: c.criterio, fechaBase: c.fechaBase,
      tareaIds: [...new Set(correspondencias.filter((r) => refs.includes(r.referenciaId)).map((r) => r.tareaId))],
      referenciasPendientes: original ? refs.filter((ref) => !correspondencias.some((r) => r.referenciaId === ref)).length : 1,
      referenciasTotales: refs.length,
    };
  });
}
