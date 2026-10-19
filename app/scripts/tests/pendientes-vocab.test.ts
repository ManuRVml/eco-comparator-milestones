import assert from "node:assert/strict";
import { test } from "node:test";
import { rechazoTextoExterno } from "../../src/lib/client-vocab";

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
