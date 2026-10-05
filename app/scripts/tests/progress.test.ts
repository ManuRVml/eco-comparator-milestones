import { test } from "node:test";
import assert from "node:assert/strict";
import { createDb } from "../../src/db/client";
import { loadRaw } from "../../src/lib/load";
import { computeModel, resumir, type Tarea } from "../../src/lib/model";
import { progresoLinea } from "../../src/lib/line-progress";
import { sprintCheckpoint } from "../../src/lib/sprint-checkpoint";

async function fixture() {
  const { client, db } = createDb("file:./data/reconciliation/preview.db");
  try { return await loadRaw(db); } finally { client.close(); }
}

test("el avance y el plan usan el mismo esfuerzo, con tareas únicas y sin progreso ficticio en curso", async () => {
  const raw = await fixture(), template = raw.tareas[0];
  const tareas: Tarea[] = [
    { ...template, id: "A", diasHabiles: 1, estado: "Hecha", fechaFin: "2026-09-25" },
    { ...template, id: "B", diasHabiles: 9, estado: "Pendiente", fechaFin: "2026-10-09" },
    { ...template, id: "C", diasHabiles: 10, estado: "En curso", fechaFin: "2026-09-25" },
  ];
  const progress = resumir("*", "Total", [...tareas, tareas[0]], "2026-10-05", new Set());
  assert.equal(progress.total, 3);
  assert.equal(progress.dias, 20);
  assert.equal(progress.pctReal, 5);
  assert.ok(Math.abs(progress.pctPlan - 55) < 1e-10);
  assert.ok(Math.abs(progress.brecha + 50) < 1e-10);
});

test("línea y total cuentan una sola vez las tareas compartidas por milestones y respetan el filtro de área", async () => {
  const raw = await fixture(), template = raw.tareas[0];
  raw.tareas = [
    { ...template, id: "A", areaId: raw.areas[0].id, diasHabiles: 1, estado: "Hecha" },
    { ...template, id: "B", areaId: raw.areas[1].id, diasHabiles: 9, estado: "Pendiente" },
  ];
  const [first, second] = raw.milestones;
  raw.milestones = [{ ...first, lineaId: raw.lineas[0].id }, { ...second, lineaId: raw.lineas[0].id }];
  raw.msTarea = [{ milestoneId: first.id, tareaId: "A" }, { milestoneId: first.id, tareaId: "B" }, { milestoneId: second.id, tareaId: "A" }];
  const model = computeModel(raw, "2026-10-05");
  assert.equal(model.total.pctReal, 10);
  assert.equal(model.milestoneById.get(first.id)?.pctPonderado, 10);
  assert.equal(progresoLinea(model, raw.lineas[0].id).pctReal, 10);
  assert.equal(progresoLinea(model, raw.lineas[0].id).total, 2);
  assert.equal(progresoLinea(model, raw.lineas[0].id, raw.areas[0].id).pctReal, 100);
});

test("los siete checkpoints conservan fecha, tareas y ponderación; la capa oficial usa solo lo publicado", async () => {
  const raw = await fixture(), model = computeModel(raw, "2026-10-05");
  const official = computeModel(raw, "2026-10-05", "oficial");
  for (const sprint of raw.sprints) {
    const c = sprintCheckpoint(model, sprint.numero)!;
    const tasks = raw.tareas.filter((t) => t.sprintId === sprint.id);
    const days = tasks.reduce((n, t) => n + (t.diasHabiles ?? 0), 0);
    const done = tasks.filter((t) => t.estado === "Hecha").reduce((n, t) => n + (t.diasHabiles ?? 0), 0);
    assert.equal(c.sprint.fechaFin, sprint.fechaFin);
    assert.equal(c.tareas.length, tasks.length);
    assert.equal(c.porcentaje, days ? done / days * 100 : 0);
  }
  assert.equal(sprintCheckpoint(model, 0)?.sprint.fechaInicio, "2026-09-21");
  assert.equal(sprintCheckpoint(model, 0)?.sprint.fechaFin, "2026-09-25");
  assert.equal(official.total.pctReal, 0);
  assert.equal(sprintCheckpoint(official, 0)?.porcentaje, 0);
});
