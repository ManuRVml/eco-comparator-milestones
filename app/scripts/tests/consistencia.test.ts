import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createDb } from "../../src/db/client";
import { loadRaw } from "../../src/lib/load";
import { computeModel, type Capa, type Model, type Raw } from "../../src/lib/model";
import { progresoLinea } from "../../src/lib/line-progress";

/** Suma de días hábiles y de días hechos de las líneas = proyecto (cada tarea cuenta una vez, mismo conjunto de tareas). */
function verificar(model: Model) {
  const lineas = model.lineas.map((l) => progresoLinea(model, l.id));
  const dias = lineas.reduce((s, p) => s + p.dias, 0);
  const diasHechos = lineas.reduce((s, p) => s + p.diasHechos, 0);
  const hechas = lineas.reduce((s, p) => s + p.hechas, 0);
  const total = lineas.reduce((s, p) => s + p.total, 0);
  assert.equal(dias, model.total.dias, "días hábiles: Σ líneas ≠ proyecto");
  assert.equal(diasHechos, model.total.diasHechos, "días hechos: Σ líneas ≠ proyecto");
  assert.equal(hechas, model.total.hechas);
  assert.equal(total, model.total.total);
  const pctLineas = dias ? (diasHechos / dias) * 100 : 0;
  assert.ok(Math.abs(pctLineas - model.total.pctReal) < 1e-9, `% ponderado: líneas ${pctLineas} ≠ proyecto ${model.total.pctReal}`);
  const planLineas = lineas.reduce((s, p) => s + (p.pctPlan * p.dias) / 100, 0);
  assert.ok(!dias || Math.abs((planLineas / dias) * 100 - model.total.pctPlan) < 1e-9, "previsto: líneas ≠ proyecto");
}

const t = (id: string, estado: string, dias: number, fin: string) => ({ id, areaId: "backend", estado, diasHabiles: dias, fechaInicio: fin, fechaFin: fin, historiaId: null, publicadoCliente: false });

function rawSintetico(conHuerfana: boolean): Raw {
  const tareas = [t("T-1", "Hecha", 3, "2026-10-01"), t("T-2", "En curso", 5, "2026-10-05"), t("T-3", "Pendiente", 2, "2026-11-01"), t("T-4", "Hecha", 4, "2026-10-02"), t("T-5", "Pendiente", 6, "2026-12-01")];
  if (conHuerfana) tareas.push(t("T-6", "Hecha", 10, "2026-10-01")); // sin milestone: no cuenta en proyecto ni en líneas
  const ms = (id: string, lineaId: string) => ({ id, nombre: id, lineaId, fechaObjetivo: "2026-12-10", orden: 0, estado: "No iniciado", estadoOrigen: "plan", visibleCliente: true });
  return {
    lineas: [{ id: "L1", nombre: "L1", orden: 1 }, { id: "L2", nombre: "L2", orden: 2 }], areas: [{ id: "backend", nombre: "Backend", orden: 1 }], sprints: [], festivos: [], calendario: [],
    milestones: [ms("M-01", "L1"), ms("M-02", "L2")], historias: [], tareas, predecesoras: [],
    msHu: [], msTarea: [{ milestoneId: "M-01", tareaId: "T-1" }, { milestoneId: "M-01", tareaId: "T-2" }, { milestoneId: "M-01", tareaId: "T-3" }, { milestoneId: "M-02", tareaId: "T-4" }, { milestoneId: "M-02", tareaId: "T-5" }],
    msDep: [], msRiesgo: [], capacidades: [], capacidadHu: [], riesgos: [], notas: [], agendaWeekly: [], agendaHu: [], base: [], config: {},
  } as unknown as Raw;
}

test("líneas = proyecto con datos sintéticos, también con una tarea sin milestone", () => {
  for (const huerfana of [false, true]) {
    const model = computeModel(rawSintetico(huerfana), "2026-10-07", "tecnica");
    assert.equal(model.total.total, 5);
    verificar(model);
  }
});

test("un milestone con tareas pendientes no está «En curso» solo porque una HU lo esté", () => {
  const raw = rawSintetico(false);
  raw.historias = [{ id: "HU-1", nombre: "HU", estado: "En curso", prioridad: "MVP", sp: 3 }] as never;
  raw.msHu = [{ milestoneId: "M-02", historiaId: "HU-1" }];
  raw.tareas = raw.tareas.map((x) => (x.id === "T-4" ? { ...x, estado: "Pendiente" } : x));
  const model = computeModel(raw, "2026-10-07", "tecnica");
  assert.equal(model.milestoneById.get("M-02")!.estadoSugerido, "Pendiente");
  assert.equal(model.milestoneById.get("M-01")!.estadoSugerido, "En curso");
});

// Base sembrada/de prueba: CONSISTENCIA_DB, o data/seguimiento.test.db / data/seguimiento.db si existen.
const archivo = [process.env.CONSISTENCIA_DB, "data/seguimiento.test.db", "data/seguimiento.db"].filter((f): f is string => !!f).map((f) => resolve(f)).find((f) => existsSync(f));
test("líneas = proyecto sobre la base sembrada (capas técnica y oficial)", { skip: archivo ? false : "sin base sembrada en data/" }, async () => {
  const { db, client } = createDb(`file:${archivo}`);
  try {
    const raw = await loadRaw(db);
    if (!raw.tareas.length) return;
    for (const capa of ["tecnica", "oficial"] as Capa[]) verificar(computeModel(raw, "2026-10-07", capa));
  } finally {
    client.close();
  }
});
