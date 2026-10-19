import assert from "node:assert/strict";
import { test } from "node:test";
import { filtrarVisibles, rechazoTextoExterno } from "../../src/lib/client-vocab";

test("rechaza un pendiente externo que incluye un término prohibido", () => {
  const rechazo = rechazoTextoExterno("externo", "Revisión de QA", null);
  assert.ok(rechazo);
  assert.equal(rechazo.status, 400);
  assert.match(rechazo.message, /«QA»/);

  const enDetalle = rechazoTextoExterno("externo", "Entregar acceso", "Cierre de sprint");
  assert.ok(enDetalle);
  assert.equal(enDetalle.status, 400);
  assert.match(enDetalle.message, /«sprint»/);
});

test("acepta texto limpio en un pendiente externo", () => {
  assert.equal(rechazoTextoExterno("externo", "Entregar licencia de Power BI", "Sin términos internos"), null);
});

test("no revisa el vocabulario de un pendiente interno", () => {
  assert.equal(rechazoTextoExterno("interno", "QA del sprint", "backlog"), null);
});

test("oculta pendientes externos ya guardados con vocabulario interno a quien no edita", () => {
  const rows = [
    { id: "qa", lado: "externo", titulo: "Revisión de QA", detalle: null },
    { id: "sprint", lado: "externo", titulo: "Entregar acceso", detalle: "Cierre de sprint" },
    { id: "limpio", lado: "externo", titulo: "Entregar licencia", detalle: "Sin términos internos" },
    { id: "interno", lado: "interno", titulo: "QA del sprint", detalle: "backlog" },
  ];

  assert.deepEqual(filtrarVisibles(rows, false).map((row) => row.id), ["limpio", "interno"]);
  assert.deepEqual(filtrarVisibles(rows, true).map((row) => row.id), ["qa", "sprint", "limpio", "interno"]);
});
