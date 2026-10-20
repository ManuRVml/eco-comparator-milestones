import assert from "node:assert/strict";
import { test } from "node:test";
import { puedeMostrarObjetivoCiclo } from "../../src/lib/client-vocab";

test("oculta un objetivo de ciclo con vocabulario no apto para el rol de solo lectura", () => {
  assert.equal(puedeMostrarObjetivoCiclo("QA del sprint"), false);
});

test("conserva un objetivo de ciclo limpio", () => {
  assert.equal(puedeMostrarObjetivoCiclo("Validar el flujo de aprobación"), true);
});
