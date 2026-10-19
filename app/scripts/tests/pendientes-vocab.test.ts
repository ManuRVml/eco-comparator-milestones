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

test("rechaza el responsable de un pendiente externo con un término prohibido", () => {
  const rechazo = rechazoTextoExterno("externo", "Entregar acceso", null, "equipo de QA");
  assert.ok(rechazo);
  assert.equal(rechazo.status, 400);
  assert.match(rechazo.message, /«QA»/);
});

test("rechaza «Cliente» en el título de un pendiente externo", () => {
  const rechazo = rechazoTextoExterno("externo", "Pendiente del Cliente", null);
  assert.ok(rechazo);
  assert.equal(rechazo.status, 400);
  assert.match(rechazo.message, /«cliente»/);
});

test("oculta un pendiente externo ya guardado con responsable no apto", () => {
  const rows = [
    { id: "resp", lado: "externo", titulo: "Entregar acceso", detalle: null, responsable: "equipo de QA" },
    { id: "limpio", lado: "externo", titulo: "Entregar licencia", detalle: null, responsable: "Ana" },
  ];
  assert.deepEqual(filtrarVisibles(rows, false).map((row) => row.id), ["limpio"]);
  assert.deepEqual(filtrarVisibles(rows, true).map((row) => row.id), ["resp", "limpio"]);
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
