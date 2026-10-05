import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync } from "node:fs";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb } from "../../src/db/client";
import { loadMilestoneContracts } from "../../src/lib/milestone-contract/load";
import { mutarContrato } from "../../src/lib/milestone-contract/mutations";
import { contractAccepted, EMPTY_DEFINITION } from "../../src/lib/milestone-contract/domain";
import { loadRaw } from "../../src/lib/load";
import { computeModel, vistaCliente } from "../../src/lib/model";
import { prepararTimeline } from "../../src/lib/timeline-model";

const definition = { ...EMPTY_DEFINITION, job: "Job de prueba", outcome: "Resultado de prueba", meta: "Dos usuarios de prueba ingresan", fueraAlcance: "Fuera de alcance de prueba", responsable: "Responsable de prueba", aprobador: "Aprobador de prueba" };
async function fixture() {
  const folder = mkdtempSync(resolve("data/reconciliation/contract-test-"));
  copyFileSync("data/reconciliation/preview.db", resolve(folder, "test.db"));
  return createDb(`file:${resolve(folder, "test.db")}`);
}
test("la migración añade tablas y conserva todas las filas existentes, con los diez criterios originales pendientes", async () => {
  const c = await fixture();
  try {
    const names = (await c.client.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%' and name != '__drizzle_migrations'")).rows.map((r) => String(r.name));
    const before = await Promise.all(names.map((n) => c.client.execute(`select * from "${n}" order by rowid`)));
    await migrate(c.db, { migrationsFolder: resolve("drizzle") });
    for (let i = 0; i < names.length; i++) assert.deepEqual((await c.client.execute(`select * from "${names[i]}" order by rowid`)).rows, before[i].rows);
    const raw = await loadRaw(c.db), contracts = await loadMilestoneContracts(c.db, raw.milestones);
    assert.equal(Object.keys(contracts).length, 10);
    for (const m of raw.milestones) { assert.equal(contracts[m.id].criterios[0].descripcion, m.criterio); assert.equal(contracts[m.id].criterios[0].estado, "Pendiente"); }
  } finally { c.client.close(); }
});
test("la ficha pública persiste, la aceptación queda trazada y un cambio de outcome exige nueva revisión", async () => {
  const c = await fixture();
  try {
    await migrate(c.db, { migrationsFolder: resolve("drizzle") });
    await mutarContrato(c.db, "editor", { id: "M-01", accion: "ficha", ...definition, fechaPrevision: "2026-10-20", motivoPrevision: "Motivo público de prueba" });
    await mutarContrato(c.db, "admin", { id: "M-01", accion: "criterio", criterioId: "M-01-C01", descripcion: "Condición verificable de prueba", obligatorio: true, estado: "Verificado", evidencia: "Acta de prueba", aprobador: definition.aprobador, fecha: "2026-10-05" });
    let contracts = await loadMilestoneContracts(c.db, [{ id: "M-01", criterio: null }]);
    assert.equal(contractAccepted(contracts["M-01"], "2026-10-05"), true);
    assert.equal(contracts["M-01"].definicion.fechaPrevision, "2026-10-20");
    await mutarContrato(c.db, "editor", { id: "M-01", accion: "ficha", ...definition, outcome: "Outcome revisado de prueba" });
    contracts = await loadMilestoneContracts(c.db, [{ id: "M-01", criterio: null }]);
    assert.equal(contractAccepted(contracts["M-01"], "2026-10-05"), false);
    assert.equal(contracts["M-01"].criterios[0].evidencia, "Acta de prueba");
    assert.equal((await c.client.execute("select count(*) n from bitacora where campo like 'contrato:%'")).rows[0].n, 3);
  } finally { c.client.close(); }
});
test("consulta y editor no aprueban; se rechazan fecha futura, aprobador distinto y ficha incompleta", async () => {
  const c = await fixture();
  try {
    await migrate(c.db, { migrationsFolder: resolve("drizzle") });
    const body = { id: "M-01", accion: "criterio", criterioId: "M-01-C01", descripcion: "Condición verificable de prueba", estado: "Verificado", evidencia: "Acta de prueba", aprobador: definition.aprobador, fecha: "2026-10-05" };
    await assert.rejects(mutarContrato(c.db, "cliente", body), /Rol de consulta/);
    await assert.rejects(mutarContrato(c.db, "editor", body), /Solo el administrador/);
    await assert.rejects(mutarContrato(c.db, "admin", body), /Completa/);
    await mutarContrato(c.db, "editor", { id: "M-01", accion: "ficha", ...definition });
    await assert.rejects(mutarContrato(c.db, "admin", { ...body, fecha: "2099-01-01" }), /futura/);
    await assert.rejects(mutarContrato(c.db, "admin", { ...body, aprobador: "Otro aprobador" }), /coincidir/);
    await assert.rejects(mutarContrato(c.db, "admin", { ...body, evidencia: "" }), /evidencia/);
  } finally { c.client.close(); }
});
test("el cliente conserva el denominador completo del milestone y no recibe fichas de hitos ocultos", async () => {
  const c = await fixture();
  try {
    const raw = await loadRaw(c.db), model = computeModel(raw, "2026-10-05", "oficial");
    model.contratosMilestone = await loadMilestoneContracts(c.db, raw.milestones);
    const full = prepararTimeline(model), first = full.milestones[0];
    full.tareas[0].visibleCliente = false;
    full.milestones[1].visibleCliente = false;
    const client = vistaCliente(full);
    assert.deepEqual(client.milestoneById.get(first.id)?.trabajo, first.trabajo);
    assert.equal(client.contratosMilestone?.[full.milestones[1].id], undefined);
  } finally { c.client.close(); }
});
