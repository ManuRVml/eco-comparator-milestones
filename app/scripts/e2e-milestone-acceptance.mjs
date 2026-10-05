import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { SignJWT } from "jose";
import { startTestServer } from "./lib/test-server.mjs";

process.loadEnvFile(".env.local");
process.env.TEST_SOURCE_DB = "data/reconciliation/preview.db";
process.env.APP_HOY = "2026-10-05";
const server = await startTestServer(3115, { migrate: true }), browser = await chromium.launch();
const contexts = {}, pages = {};
const key = new TextEncoder().encode(process.env.SESSION_SECRET);
let checks = 0;
mkdirSync("data/reconciliation/screens-fixes", { recursive: true });
const definition = { job: "Job de prueba: preparar análisis", outcome: "Resultado de acceso validado de prueba", meta: "Dos usuarios de prueba acceden con su rol", alcanceIncluido:"Acceso por rol de prueba", fueraAlcance: "Fuera de alcance de prueba", responsable: "Responsable de prueba", aprobador: "Aprobador de prueba", fechaPrevision: "2026-10-20", motivoPrevision: "Motivo público de prueba" };
const criterion = { id: "M-01", accion: "criterio", criterioId: "M-01-C01", descripcion: "Dos usuarios de prueba acceden con su rol", obligatorio: true, evidenciaRequerida:"Acta de comparación de prueba",metricaId:"test-metric",resultadoMedido:99.9,muestraEvaluada:30, estado: "Verificado", evidencia: "Acta de aceptación de prueba", aprobador: definition.aprobador, fecha: "2026-10-05" };
async function post(role, endpoint, body, expected) {
  const r = await contexts[role].request.post(server.base + endpoint, { data: body });
  assert.equal(r.status(), expected, await r.text()); checks++;
}
try {
  for (const role of ["admin", "editor", "cliente"]) {
    contexts[role] = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const token = await new SignJWT({ role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(key);
    await contexts[role].addCookies([{ name: "seg_session", value: token, url: server.base }]);
    pages[role] = await contexts[role].newPage();
  }
  await post("cliente", "/api/editor/milestone", { id: "M-01", accion: "ficha", ...definition }, 403);
  await post("admin", "/api/editor/publicacion", { tipo: "milestone", id: "M-01", publicar: true, fecha: "2026-10-05", nota: "Publicación de prueba" }, 422);
  await post("editor", "/api/editor/milestone", criterion, 403);
  for(const role of ["editor","cliente"]) {
    for(const accion of ["ficha","metrica","criterio"]) await post(role,"/api/editor/milestone",{id:"M-01",accion},403);
    await post(role,"/api/editor/config",{clave:"resumen_area_ecopetrol",valor:true},403);
    await pages[role].goto(`${server.base}/editor?vista=configuracion`);
    assert.equal(await pages[role].getByTestId("contract-editor").count(),0);checks++;
  }
  await pages.editor.goto(`${server.base}/milestones/M-01`);
  assert.equal(await pages.editor.getByText("Aprobar y publicar el milestone",{exact:true}).count(),0);checks++;
  await pages.editor.goto(`${server.base}/editor?vista=visibilidad`);
  assert.equal(await pages.editor.locator('[data-testid^="config-"]').count(),0);checks++;
  const admin=pages.admin;
  await admin.goto(`${server.base}/editor?vista=configuracion&ms=M-01`);
  const form=admin.locator("form").filter({has:admin.locator("legend",{hasText:"Ficha del milestone"})});
  for(const [name,value] of Object.entries(definition)) await form.locator(`[name="${name}"]`).fill(value);
  const saved=admin.waitForResponse(r=>r.url().endsWith("/api/editor/milestone")&&r.request().method()==="POST");
  await form.getByRole("button",{name:"Guardar",exact:true}).click();assert.equal((await saved).status(),200);checks++;
  const metric={id:"M-01",accion:"metrica",metricaId:"test-metric",nombre:"Precisión de prueba",tipo:"Cuantitativa",unidad:"%",comparador:"Igual",objetivo:100,metodo:"Comparar muestra de prueba",tolerancia:0.2,muestraMinima:30,activa:true};
  await post("admin","/api/editor/milestone",metric,200);
  await post("admin","/api/editor/milestone",{...metric,tolerancia:-1},422);
  await post("admin","/api/editor/milestone",{...metric,muestraMinima:1.5},422);
  await post("admin","/api/editor/config",{clave:"resumen_area_ecopetrol",valor:"Inválido"},422);
  await post("admin","/api/editor/milestone",{...criterion,resultadoMedido:99},422);
  await post("admin","/api/editor/milestone",{...criterion,muestraEvaluada:29},422);
  await post("admin","/api/editor/publicacion",{tipo:"milestone",id:"M-01",publicar:true,fecha:"2026-02-31",nota:"Publicación de prueba"},422);
  await post("admin", "/api/editor/milestone", { ...criterion, aprobador: "Otro aprobador" }, 422);
  await post("admin", "/api/editor/milestone", { ...criterion, fecha: "2099-01-01" }, 422);
  await admin.goto(`${server.base}/editor?vista=configuracion&ms=M-01`);
  const cform = admin.locator("form").filter({ has: admin.locator("legend", { hasText: "Criterio M-01-C01" }) });
  await cform.locator('[name="descripcion"]').fill(criterion.descripcion);
  await cform.locator('[name="evidenciaRequerida"]').fill(criterion.evidenciaRequerida);
  await cform.locator('[name="metricaId"]').selectOption("test-metric");
  await cform.locator('[name="resultadoMedido"]').fill("99.9");
  await cform.locator('[name="muestraEvaluada"]').fill("30");
  await cform.locator('[name="estado"]').selectOption("Verificado");
  await cform.locator('[name="evidencia"]').fill(criterion.evidencia);
  await cform.locator('[name="aprobador"]').fill(criterion.aprobador);
  await cform.locator('[name="fecha"]').fill(criterion.fecha);
  const accepted = admin.waitForResponse((r) => r.url().endsWith("/api/editor/milestone") && r.request().method() === "POST");
  await cform.getByRole("button", { name: "Guardar criterio y aceptación" }).click();
  assert.equal((await accepted).status(), 200); checks++;
  await post("admin", "/api/editor/publicacion", { tipo: "milestone", id: "M-01", publicar: true, fecha: "2026-10-04", nota: "Publicación de prueba" }, 422);
  await post("editor", "/api/editor/publicacion", { tipo: "milestone", id: "M-01", publicar: true, fecha: "2026-10-05", nota: "Publicación de prueba" }, 403);
  await post("admin", "/api/editor/publicacion", { tipo: "milestone", id: "M-01", publicar: true, fecha: "2026-10-05", nota: "Publicación de prueba" }, 200);
  const client = pages.cliente;
  await client.goto(`${server.base}/milestones/M-01`);
  assert.equal(await client.getByTestId("check-delivery-M-01").count(), 1); checks++;
  assert.match(await client.getByTestId("delivery-M-01").innerText(), /Acta de aceptación de prueba/); checks++;
  assert.match(await client.getByTestId("delivery-M-01").innerText(), /Motivo público de prueba/); checks++;
  assert.equal(await client.getByTestId("contract-editor").count(), 0); checks++;
  await post("admin", "/api/editor/milestone", { id: "M-01", accion: "ficha", ...definition, outcome: "Nuevo outcome de prueba" }, 200);
  await admin.goto(`${server.base}/editor?vista=configuracion&ms=M-01`);
  const metricForm=admin.locator("form").filter({has:admin.locator("legend",{hasText:"Añadir métrica"})});
  await metricForm.locator('[name="nombre"]').fill("Meta cero de prueba");
  await metricForm.locator('[name="objetivo"]').fill("0");
  const metricSave=admin.waitForResponse(r=>r.url().endsWith("/api/editor/milestone")&&r.request().method()==="POST");
  await metricForm.getByRole("button",{name:"Añadir métrica",exact:true}).click();assert.equal((await metricSave).status(),200);checks++;
  await admin.reload();
  const zero=admin.locator("form").filter({has:admin.locator("legend",{hasText:"Métrica: Meta cero de prueba"})});
  assert.equal(await zero.locator('[name="objetivo"]').inputValue(),"0");checks++;
  assert.equal(await zero.locator('[name="tolerancia"]').inputValue(),"");checks++;
  assert.equal(await zero.locator('[name="muestraMinima"]').inputValue(),"");checks++;
  await admin.setViewportSize({width:390,height:844});
  assert.ok(await admin.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks++;
  await admin.screenshot({path:"data/reconciliation/screens-fixes/admin-config-mobile.png",fullPage:true});
  await client.reload();
  assert.equal(await client.getByTestId("check-delivery-M-01").count(), 0); checks++;
  assert.match(await client.getByTestId("delivery-M-01").innerText(), /aceptación por criterios pendiente/); checks++;
  for (const role of ["cliente", "admin"]) {
    const page = pages[role];
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(server.base);
    const count = await page.locator(".milestone-counts").boundingBox();
    assert.ok(count && count.y + count.height < 844); checks++;
    await page.screenshot({ path: `data/reconciliation/screens-fixes/${role}-mobile-resumen.png` });
    await page.goto(`${server.base}/milestones/M-01`);
    const delivery = await page.getByTestId("delivery-M-01").boundingBox();
    assert.ok(delivery && delivery.y < 500); checks++;
    await page.screenshot({ path: `data/reconciliation/screens-fixes/${role}-mobile-milestone.png` });
    await page.goto(`${server.base}/agenda`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); checks++;
    await page.screenshot({ path: `data/reconciliation/screens-fixes/${role}-mobile-agenda.png` });
    await page.goto(`${server.base}/lineas?m=S0`);
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="expected-S0"]');
      return el && el.getBoundingClientRect().y < 500;
    });
    const result = await page.getByTestId("expected-S0").boundingBox();
    assert.ok(result && result.y < 500); checks++;
    assert.ok(await page.getByTestId("enables-S0").locator("a").count() > 0); checks++;
    await page.screenshot({ path: `data/reconciliation/screens-fixes/${role}-mobile-sprint0.png` });
  }
  console.log(JSON.stringify({ testFiles: 1, casesPassed: checks, database: "copia de prueba" }));
} finally { for (const c of Object.values(contexts)) await c.close(); await browser.close(); server.stop(); }
