import { asc, sql } from "drizzle-orm";
import type { Db } from "../../db/client";
import { bloqueosTarea, compromisoMilestone, compromisosSprint, flujoTarea, fuentesPlan, lotesReconciliacion, previsionesMilestone, referenciasPlan, referenciaTarea, relacionesFlujo, validacionesTarea } from "../../db/schema";
import { ultimasPor } from "./domain";
import type { Workflow } from "./types";

export async function loadWorkflow(db: Db): Promise<Workflow | null> {
  const exists = await db.all(sql`select name from sqlite_master where type='table' and name='lotes_reconciliacion'`);
  if (!exists.length) return null; // Compatible con la base anterior hasta aplicar la migración.
  const [lotes, flujos, bloqueos, validaciones, relaciones, compromisos, vinculos, previsiones, referencias, correspondencias, fuentes] = await Promise.all([
    db.select().from(lotesReconciliacion), db.select().from(flujoTarea), db.select().from(bloqueosTarea),
    db.select().from(validacionesTarea).orderBy(asc(validacionesTarea.id)), db.select().from(relacionesFlujo).orderBy(asc(relacionesFlujo.id)),
    db.select().from(compromisosSprint), db.select().from(compromisoMilestone),
    db.select().from(previsionesMilestone).orderBy(asc(previsionesMilestone.id)),
    db.select().from(referenciasPlan),
    db.select().from(referenciaTarea),
    db.select({ id: fuentesPlan.id, nombre: fuentesPlan.nombre, fecha: fuentesPlan.fecha, huella: fuentesPlan.huella }).from(fuentesPlan),
  ]);
  return {
    activo: lotes.some((l) => l.activo), flujos, bloqueos,
    validaciones: ultimasPor(validaciones, (v) => `${v.tareaId}:${v.etapa}`),
    relaciones: ultimasPor(relaciones, (r) => `${r.tareaId}:${r.proveedorId}`),
    compromisos, vinculos, previsiones: ultimasPor(previsiones, (p) => p.milestoneId),
    referencias, correspondencias, fuentes,
  };
}
