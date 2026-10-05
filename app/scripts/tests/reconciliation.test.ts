import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq, sql } from "drizzle-orm";
import { createDb } from "../../src/db/client";
import { bitacora, flujoTarea, lotesReconciliacion, notas, tareas } from "../../src/db/schema";
import { aplicarReconciliacion, simularReconciliacion } from "../lib/reconciliation";
import type { Bundle } from "../lib/reconciliation-sources";
import { mutarTarea } from "../../src/lib/workflow/task-mutations";
import { mutarPlan } from "../../src/lib/workflow/planning-mutations";
import { loadWorkflow } from "../../src/lib/workflow/load";
import { tieneCicloDuro } from "../../src/lib/workflow/domain";
import { estadoOficialTarea, aplicarCapaOficial, computeModel, vistaCliente } from "../../src/lib/model";
import { loadRaw } from "../../src/lib/load";
import { upsertById } from "../lib/importer";

const bundle = JSON.parse(readFileSync("seed/reconciliation.json", "utf8")) as Bundle;
mkdirSync("data/reconciliation", { recursive: true });
async function fixture() {
  const folder = mkdtempSync(resolve("data/reconciliation/test-")), file = resolve(folder, "test.db");
  // Fuente local sin servidor de prueba ni modificaciones durante esta copia.
  copyFileSync("data/reconciliation/preview.db", file);
  const conn = createDb(`file:${file}`);
  await migrate(conn.db, { migrationsFolder: resolve("drizzle") });
  return conn;
}

test("la simulación y un lote repetido conservan tareas, notas, evidencia y publicaciones", async () => {
  const { db, client } = await fixture();
  try {
    await db.insert(notas).values({ entidadTipo: "tarea", entidadId: "T-005", texto: "Nota de preservación", autorRol: "editor" });
    const before = await db.select().from(tareas), logs = await db.select().from(bitacora), notes = await db.select().from(notas);
    const simulation = await simularReconciliacion(db, bundle);
    assert.equal(simulation.tareasActuales, 99); assert.equal(simulation.tareasFuente, 80);
    assert.equal(simulation.correspondencias.find((x) => x.origen === "T-007")?.tareaId, "T-008");
    const repeated = await aplicarReconciliacion(db, bundle);
    assert.equal(repeated.aplicado, false);
    assert.deepEqual(await db.select().from(tareas), before);
    assert.deepEqual(await db.select().from(notas), notes);
    assert.deepEqual(await db.select().from(bitacora), logs);
    assert.equal((await db.all<{ integrity_check: string }>(sql`pragma integrity_check`))[0].integrity_check, "ok");
  } finally { client.close(); }
});

test("el import por ID rechaza una actividad distinta y revierte todo el lote", async () => {
  const { db, client } = await fixture();
  try {
    const before = await db.select().from(tareas), notes = await db.select().from(notas);
    await assert.rejects(db.transaction(async (tx) => {
      await tx.insert(notas).values({ entidadTipo: "tarea", entidadId: "T-007", texto: "No debe sobrevivir", autorRol: "editor" });
      await upsertById(tx, tareas, { key: "id", column: "id" }, [{ ...before.find((t) => t.id === "T-007")!, nombre: "Validar ambientes DEV de backend y frontend" }], { archivo: "prueba", tablas: [], conflictos: [], avisos: [] });
    }), /Conflicto de identidad/);
    assert.deepEqual(await db.select().from(tareas), before); assert.deepEqual(await db.select().from(notas), notes);
  } finally { client.close(); }
});

test("la fecha planificada no inicia trabajo oficial ni expone evidencia técnica de una HU editada", async () => {
  const { db, client } = await fixture();
  try {
    const raw = await loadRaw(db), t = raw.tareas[0];
    assert.equal(estadoOficialTarea({ ...t, publicadoCliente: false, fechaInicio: "2020-01-01" }, "2026-10-05"), "Pendiente");
    const hu = raw.historias[0]; hu.estadoOrigen = "editor"; hu.evidencia = "INTERNAL_SECRET_EVIDENCE"; hu.estado = "Aceptada";
    const official = aplicarCapaOficial(raw, "2026-10-05");
    assert.equal(official.historias[0].evidencia, null);
    assert.equal(official.historias[0].estado, "No iniciada");
    assert.equal(vistaCliente({ ...computeModel(raw, "2026-10-05", "oficial"), workflow: await loadWorkflow(db) }).workflow, undefined);
  } finally { client.close(); }
});

const ready = { accion: "flujo", id: "T-014", ejecucion: "Lista para empezar", responsable: "Equipo frontend", insumos: "Contrato acordado con fixtures", criterio: "Recorrido probado con contrato", entregaParcial: "Selector utilizable con fixtures", prevision: "2026-10-09", prioridad: 10 };
const blocker = { accion: "bloquear", id: "T-014", tipo: "Bloqueo", afecta: "Integración", descripcion: "Falta el acceso al entorno", responsable: "Infraestructura", revision: "2026-10-06", criterioLiberacion: "Conexión real verificada", severidad: "Alta", esfuerzoMinutos: 0 };
test("un bloqueo de integración permite preparar ejecución y prohíbe certificar la integración", async () => {
  const { db, client } = await fixture();
  try {
    const before = await db.select().from(tareas);
    await mutarTarea(db, "editor", blocker);
    await mutarTarea(db, "editor", ready);
    assert.equal((await db.select().from(flujoTarea).where(eq(flujoTarea.tareaId, "T-014")))[0].ejecucion, "Lista para empezar");
    await assert.rejects(mutarTarea(db, "editor", { accion: "validar", id: "T-014", etapa: "Integración", resultado: "Verificada", evidencia: "Prueba que todavía no puede pasar" }), /insumos pendientes/);
    assert.deepEqual(await db.select().from(tareas), before);
  } finally { client.close(); }
});

test("un bloqueo de inicio afecta a su actividad y puede resolverse con evidencia", async () => {
  const { db, client } = await fixture();
  try {
    await mutarTarea(db, "editor", { ...blocker, afecta: "Inicio" });
    await assert.rejects(mutarTarea(db, "editor", ready), /insumo pendiente/);
    await mutarTarea(db, "editor", { ...ready, id: "T-015" });
    const w = await loadWorkflow(db), block = w!.bloqueos.find((b) => b.tareaId === "T-014" && !b.resueltoEn)!;
    await mutarTarea(db, "editor", { accion: "resolver", id: "T-014", bloqueoId: block.id, resolucion: "Acceso confirmado y probado", esfuerzoMinutos: 30 });
    await mutarTarea(db, "editor", ready);
    assert.equal((await loadWorkflow(db))!.bloqueos.find((b) => b.id === block.id)!.esfuerzoMinutos, 30);
  } finally { client.close(); }
});

test("las relaciones se versionan y un ciclo de bloqueos se rechaza", async () => {
  const { db, client } = await fixture();
  try {
    const relation = { accion: "relacion", id: "T-014", proveedorId: "T-015", tipo: "Bloqueo real", afecta: "Inicio", insumo: "Contrato listo para consumir", criterio: "Revisión compartida completada", disponible: false };
    await mutarPlan(db, "editor", relation);
    await assert.rejects(mutarPlan(db, "editor", { ...relation, id: "T-015", proveedorId: "T-014" }), /ciclo/);
    await mutarPlan(db, "editor", { ...relation, tipo: "Coordinación" });
    assert.equal((await loadWorkflow(db))!.relaciones.find((r) => r.tareaId === "T-014")!.tipo, "Coordinación");
    assert.equal((await db.all<{ n: number }>(sql`select count(*) as n from relaciones_flujo where tarea_id='T-014'`))[0].n, 2);
    assert.equal(tieneCicloDuro([{ tareaId: "A", proveedorId: "B", tipo: "Coordinación", disponible: false }, { tareaId: "B", proveedorId: "A", tipo: "Coordinación", disponible: false }]), false);
  } finally { client.close(); }
});

test("las previsiones conservan fecha base, Sprint 0 y todo el historial", async () => {
  const { db, client } = await fixture();
  try {
    const raw = await loadRaw(db), base = raw.milestones.find((m) => m.id === "M-01")!.fechaObjetivo;
    const forecast = { accion: "prevision", id: "M-01", fecha: "2026-10-16", motivo: "Dependencia externa con revisión", entregaMinima: "Login validado con usuario real", responsable: "Líder técnico" };
    await mutarPlan(db, "editor", forecast); await mutarPlan(db, "editor", { ...forecast, fecha: "2026-10-19" });
    assert.equal((await loadRaw(db)).milestones.find((m) => m.id === "M-01")!.fechaObjetivo, base);
    assert.equal((await loadWorkflow(db))!.previsiones.find((p) => p.milestoneId === "M-01")!.fecha, "2026-10-19");
    assert.equal((await db.all<{ n: number }>(sql`select count(*) as n from previsiones_milestone where milestone_id='M-01'`))[0].n, 2);
    assert.deepEqual(raw.sprints.find((s) => s.numero === 0)?.fechaInicio, "2026-09-21"); assert.equal(raw.sprints.find((s) => s.numero === 0)?.fechaFin, "2026-09-25");
    await assert.rejects(mutarPlan(db, "editor", { ...forecast, fecha: "2026-02-30" }), /fecha inválida/);
  } finally { client.close(); }
});

test("desactivar el lote conserva actualizaciones y evita nuevas mutaciones de flujo", async () => {
  const { db, client } = await fixture();
  try {
    await mutarTarea(db, "editor", ready);
    const before = await db.select().from(flujoTarea);
    await db.update(lotesReconciliacion).set({ activo: false });
    assert.deepEqual(await db.select().from(flujoTarea), before);
    await assert.rejects(mutarTarea(db, "editor", ready), /no está activa/);
  } finally { client.close(); }
});
