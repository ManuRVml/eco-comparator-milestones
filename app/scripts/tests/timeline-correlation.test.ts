import { test } from "node:test";
import assert from "node:assert/strict";
import { createDb } from "../../src/db/client";
import { loadRaw } from "../../src/lib/load";
import { loadSprintPlans } from "../../src/lib/sprint-plan";
import { computeModel } from "../../src/lib/model";
import { sprintCheckpoint } from "../../src/lib/sprint-checkpoint";
import { prepararTimeline } from "../../src/lib/timeline-model";
import { tareaCompletada } from "../../src/lib/completion";

async function fixture() {
  const { client, db } = createDb("file:./data/reconciliation/preview.db");
  try {
    const [raw, planesSprint] = await Promise.all([loadRaw(db), loadSprintPlans(db)]);
    return { ...computeModel(raw, "2026-10-05"), planesSprint };
  } finally { client.close(); }
}

test("cada cierre correlaciona su sprint y su compromiso original sin inventar correspondencias", async () => {
  const m = await fixture();
  assert.equal(m.sprints.length, 7);
  for (const s of m.sprints) {
    const c = sprintCheckpoint(m, s.numero)!;
    assert.equal(c.compromiso?.fechaBase, s.fechaFin);
    assert.equal(c.compromiso?.id, `H-0${s.numero + 1}`);
    assert.equal(c.referenciasPendientes, [2, 3, 6].includes(s.numero) ? 1 : 0);
    assert.equal(c.completo, false);
  }
});

test("los aportes de las áreas suman el total y el filtro mantiene el denominador completo", async () => {
  const m = prepararTimeline(await fixture());
  for (const s of m.sprints) {
    const c = sprintCheckpoint(m, s.numero)!;
    const aporte = c.areas.reduce((sum, a) => sum + a.diasHechos / c.total.dias * 100, 0);
    assert.ok(Math.abs(aporte - c.total.pctReal) < 1e-9);
    assert.equal(c.areas.reduce((sum, a) => sum + a.dias, 0), c.total.dias);
    for (const a of c.areas) {
      const f = sprintCheckpoint(m, s.numero, a.areaId)!;
      assert.equal(f.total.pctReal, c.total.pctReal);
      assert.equal(f.porcentaje, a.pctReal);
      assert.equal(f.completo, c.completo);
    }
  }
});

test("100 % de implementación y un área terminada no certifican el cierre sin verificación", async () => {
  const m = await fixture();
  const c = sprintCheckpoint(m, 0)!;
  for (const t of c.tareas) { t.estado = "Hecha"; t.evidencia = "Implementación comprobada"; }
  const actual = sprintCheckpoint(m, 0)!;
  assert.equal(actual.total.pctReal, 100);
  assert.equal(actual.completo, false);
  assert.equal(sprintCheckpoint(m, 0, c.tareas[0].areaId)?.completo, false);
});

test("el check oficial requiere estado vigente, fecha y nota de publicación", async () => {
  const m = await fixture(), t = { ...m.tareas[0], estado: "Hecha" as const, publicadoCliente: true, fechaPublicacion: "2026-10-05", notaPublicacion: "Aprobado" };
  const official = { capa: "oficial" as const, hoy: m.hoy };
  assert.equal(tareaCompletada(t, official), true);
  assert.equal(tareaCompletada({ ...t, estado: "Pendiente" }, official), false);
  assert.equal(tareaCompletada({ ...t, fechaPublicacion: "2026-10-06" }, official), false);
  assert.equal(tareaCompletada({ ...t, notaPublicacion: "" }, official), false);
});

test("el check aparece cuando todo el alcance está publicado y desaparece al quedar una referencia pendiente", async () => {
  const m = await fixture();
  m.capa = "oficial";
  const c = sprintCheckpoint(m, 0)!;
  for (const t of c.tareas) {
    Object.assign(t, { estado: "Hecha", publicadoCliente: true, fechaPublicacion: m.hoy, notaPublicacion: "Entrega aprobada" });
  }
  assert.equal(sprintCheckpoint(m, 0)?.completo, true);
  const filtered = sprintCheckpoint(m, 0, c.tareas[0].areaId)!;
  assert.equal(filtered.completo, true);
  c.compromiso!.referenciasPendientes = 1;
  assert.equal(sprintCheckpoint(m, 0)?.completo, false);
});
