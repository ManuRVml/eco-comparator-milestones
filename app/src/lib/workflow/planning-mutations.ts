import { eq } from "drizzle-orm";
import type { Db } from "../../db/client";
import { bitacora, compromisoMilestone, compromisosSprint, milestones, previsionesMilestone, referenciasPlan, referenciaTarea, relacionesFlujo, tareas } from "../../db/schema";
import type { UserRole } from "../auth-constants";
import { HttpError } from "../http-error";
import { AFECTA, RELACIONES, tieneCicloDuro } from "./domain";
import { loadWorkflow } from "./load";
import { fecha, opcion, texto } from "./validation";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Context = { tx: Tx; rol: UserRole; body: Record<string, unknown>; id: string };
async function prevision({ tx, rol, body, id }: Context) {
  const [m] = await tx.select({ id: milestones.id }).from(milestones).where(eq(milestones.id, id));
  if (!m) throw new HttpError(404, "Milestone no encontrado");
  await tx.insert(previsionesMilestone).values({ milestoneId: id, fecha: fecha(body, "fecha"), motivo: texto(body, "motivo", 5), entregaMinima: texto(body, "entregaMinima", 5), responsable: texto(body, "responsable", 2, 200), actorRol: rol });
}
async function relacion({ tx, rol, body, id }: Context) {
  const proveedorId = texto(body, "proveedorId", 1, 40);
  const [t] = await tx.select({ id: tareas.id }).from(tareas).where(eq(tareas.id, id));
  const [p] = await tx.select({ id: tareas.id }).from(tareas).where(eq(tareas.id, proveedorId));
  if (!t || !p) throw new HttpError(404, "Actividad o proveedor no encontrado");
  if (id === proveedorId) throw new HttpError(422, "Una actividad no puede ser su propio proveedor");
  if (typeof body.disponible !== "boolean") throw new HttpError(422, "Indica si el insumo está disponible");
  const values = { tareaId: id, proveedorId, tipo: opcion(body, "tipo", RELACIONES), afecta: opcion(body, "afecta", AFECTA), insumo: texto(body, "insumo", 5), criterio: texto(body, "criterio", 5), disponible: body.disponible, evidencia: body.disponible ? texto(body, "evidencia", 5) : null, actorRol: rol };
  const w = await loadWorkflow(tx as unknown as Db);
  const relaciones = (w?.relaciones ?? []).filter((r) => r.tareaId !== id || r.proveedorId !== proveedorId);
  if (tieneCicloDuro([...relaciones, values])) throw new HttpError(409, "La relación crea un ciclo de insumos pendientes");
  await tx.insert(relacionesFlujo).values(values);
}
async function correspondencia({ tx, body, id }: Context) {
  const referenciaId = texto(body, "referenciaId", 1, 240);
  const [r] = await tx.select().from(referenciasPlan).where(eq(referenciasPlan.id, referenciaId));
  const [t] = await tx.select({ id: tareas.id }).from(tareas).where(eq(tareas.id, id));
  if (!r || !t) throw new HttpError(404, "Referencia o actividad no encontrada");
  const criterio = texto(body, "criterio", 5);
  await tx.insert(referenciaTarea).values({ referenciaId, tareaId: id, criterio }).onConflictDoUpdate({ target: [referenciaTarea.referenciaId, referenciaTarea.tareaId], set: { criterio } });
  await tx.update(referenciasPlan).set({ decision: "Confirmada por el equipo" }).where(eq(referenciasPlan.id, referenciaId));
}
async function vincular({ tx, body, id }: Context) {
  const compromisoId = texto(body, "compromisoId", 1, 240), criterio = texto(body, "criterio", 5);
  const [h] = await tx.select().from(compromisosSprint).where(eq(compromisosSprint.id, compromisoId));
  const [m] = await tx.select({ id: milestones.id }).from(milestones).where(eq(milestones.id, id));
  if (!h || !m) throw new HttpError(404, "Hito o milestone no encontrado");
  await tx.insert(compromisoMilestone).values({ compromisoId, milestoneId: id, criterio }).onConflictDoUpdate({ target: [compromisoMilestone.compromisoId, compromisoMilestone.milestoneId], set: { criterio } });
}
const actions: Record<string, (c: Context) => Promise<void>> = { prevision, relacion, correspondencia, vincular };
export async function mutarPlan(db: Db, rol: UserRole, body: Record<string, unknown>) {
  if (rol !== "editor" && rol !== "admin") throw new HttpError(403, "Tu rol es de solo lectura");
  const id = texto(body, "id", 1, 40), accion = opcion(body, "accion", Object.keys(actions));
  return db.transaction(async (tx) => {
    const w = await loadWorkflow(tx as unknown as Db);
    if (!w?.activo) throw new HttpError(409, "La reconciliación aún no está activa");
    await actions[accion]({ tx, rol, body, id });
    await tx.insert(bitacora).values({ entidadTipo: ["prevision", "vincular"].includes(accion) ? "milestone" : "tarea", entidadId: id, campo: `plan:${accion}`, valorAnterior: JSON.stringify({ previsiones: w.previsiones, relaciones: w.relaciones, correspondencias: w.correspondencias, vinculos: w.vinculos }), valorNuevo: JSON.stringify(body), origen: "editor", actorRol: rol });
    return { cambiado: true };
  });
}
