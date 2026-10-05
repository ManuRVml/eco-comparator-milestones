import { eq, sql } from "drizzle-orm";
import { bitacora, bloqueosTarea, flujoTarea, tareas, validacionesTarea } from "../../db/schema";
import type { Db } from "../../db/client";
import type { UserRole } from "../auth-constants";
import { hoyIso } from "../dates";
import { HttpError } from "../http-error";
import { AFECTA, EJECUCIONES, ETAPAS, RESULTADOS, SEVERIDADES } from "./domain";
import { entero, fecha, opcion, texto } from "./validation";
import { loadWorkflow } from "./load";
import { insumosPendientes } from "./readiness";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Context = { tx: Tx; rol: UserRole; body: Record<string, unknown>; id: string };
const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

async function guardarFlujo({ tx, body, id }: Context) {
  const ejecucion = opcion(body, "ejecucion", EJECUCIONES);
  const responsable = texto(body, "responsable", 2, 200), insumos = texto(body, "insumos", 5), criterio = texto(body, "criterio", 5);
  const values = { tareaId: id, ejecucion, responsable, insumos, criterio, entregaParcial: texto(body, "entregaParcial", 5), prevision: fecha(body, "prevision"), prioridad: entero(body, "prioridad", 100) };
  const w = await loadWorkflow(tx as unknown as Db);
  if (!w?.activo) throw new HttpError(409, "La reconciliación aún no está activa");
  const momentos = ["Terminada", "En curso"].includes(ejecucion) ? ["Inicio", "Ejecución"] : ["Inicio"];
  const impedimentos = insumosPendientes(w, id, momentos);
  if (["Lista para empezar", "En curso", "Terminada"].includes(ejecucion) && impedimentos) throw new HttpError(409, "Hay un insumo pendiente para este momento del trabajo");
  const [t] = await tx.select().from(tareas).where(eq(tareas.id, id));
  if (ejecucion === "Terminada" && t.estado !== "Hecha") throw new HttpError(422, "Registra primero la implementación y su evidencia en el estado técnico");
  if (t.estado === "Hecha" && ejecucion !== "Terminada") throw new HttpError(409, "Reabre primero el estado técnico para cambiar la ejecución de una tarea Hecha");
  await tx.insert(flujoTarea).values(values).onConflictDoUpdate({ target: flujoTarea.tareaId, set: { ...values, actualizadoEn: now } });
}

async function validar({ tx, rol, body, id }: Context) {
  const etapa = opcion(body, "etapa", ETAPAS), resultado = opcion(body, "resultado", RESULTADOS), evidencia = texto(body, "evidencia", 5);
  const w = await loadWorkflow(tx as unknown as Db);
  const momento = etapa === "Integración" ? "Integración" : etapa === "Aceptación" ? "Aceptación" : "Ejecución";
  if (resultado === "Verificada" && w && insumosPendientes(w, id, [momento])) throw new HttpError(409, `La ${etapa.toLowerCase()} tiene insumos pendientes`);
  await tx.insert(validacionesTarea).values({ tareaId: id, etapa, resultado, evidencia, actorRol: rol });
}

async function bloquear({ tx, body, id }: Context) {
  await tx.insert(bloqueosTarea).values({ tareaId: id, tipo: opcion(body, "tipo", ["Bloqueo", "Incidente"]), afecta: opcion(body, "afecta", AFECTA), descripcion: texto(body, "descripcion", 5), responsable: texto(body, "responsable", 2, 200), revision: fecha(body, "revision"), criterioLiberacion: texto(body, "criterioLiberacion", 5), severidad: opcion(body, "severidad", SEVERIDADES), esfuerzoMinutos: entero(body, "esfuerzoMinutos") });
}

async function resolver({ tx, body, id }: Context) {
  const bloqueoId = entero(body, "bloqueoId");
  const [b] = await tx.select().from(bloqueosTarea).where(eq(bloqueosTarea.id, bloqueoId));
  if (!b || b.tareaId !== id) throw new HttpError(404, "Bloqueo no encontrado");
  if (b.resueltoEn) throw new HttpError(409, "El bloqueo ya está resuelto");
  await tx.update(bloqueosTarea).set({ resueltoEn: hoyIso(), resolucion: texto(body, "resolucion", 5), esfuerzoMinutos: entero(body, "esfuerzoMinutos") }).where(eq(bloqueosTarea.id, bloqueoId));
}

const actions: Record<string, (c: Context) => Promise<void>> = { flujo: guardarFlujo, validar, bloquear, resolver };
export async function mutarTarea(db: Db, rol: UserRole, body: Record<string, unknown>) {
  if (rol !== "editor" && rol !== "admin") throw new HttpError(403, "Tu rol es de solo lectura");
  const id = texto(body, "id", 1, 40), accion = opcion(body, "accion", Object.keys(actions));
  return db.transaction(async (tx) => {
    const [t] = await tx.select({ id: tareas.id }).from(tareas).where(eq(tareas.id, id));
    if (!t) throw new HttpError(404, "Tarea no encontrada");
    const w = await loadWorkflow(tx as unknown as Db);
    if (!w?.activo) throw new HttpError(409, "La reconciliación aún no está activa");
    // El historial captura el estado completo antes y después; no altera el estado legado ni la publicación.
    await actions[accion]({ tx, rol, body, id });
    await tx.insert(bitacora).values({ entidadTipo: "tarea", entidadId: id, campo: `flujo:${accion}`, valorAnterior: JSON.stringify({ flujo: w.flujos.find((f) => f.tareaId === id), bloqueos: w.bloqueos.filter((b) => b.tareaId === id), validaciones: w.validaciones.filter((v) => v.tareaId === id) }), valorNuevo: JSON.stringify(body), origen: "editor", actorRol: rol });
    return { cambiado: true };
  });
}
