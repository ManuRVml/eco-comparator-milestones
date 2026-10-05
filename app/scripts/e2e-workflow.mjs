import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { startTestServer } from "./lib/test-server.mjs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
process.env.TEST_SOURCE_DB = "data/reconciliation/preview.db";
process.env.APP_HOY = "2026-10-05";
const server = await startTestServer(3112), browser = await chromium.launch();
let cases = 0;
function check(value, message) { assert.ok(value, message); cases++; console.log(`OK ${message}`); }
async function login(role) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, locale: "es-CO" });
  const page = await context.newPage();
  await page.goto(`${server.base}/login`);
  await page.fill("#pin", process.env[`PIN_${role.toUpperCase()}`] ?? "");
  await Promise.all([page.waitForURL(`${server.base}/`), page.click("button[type=submit]")]);
  return { context, page };
}
const ready = { accion: "flujo", id: "T-014", ejecucion: "Lista para empezar", responsable: "Equipo frontend", insumos: "Contrato y muestras acordados", criterio: "Recorrido probado con contrato", entregaParcial: "Selector con fixtures", prevision: "2026-10-09", prioridad: 10 };
try {
  const anon = await browser.newContext();
  for (const endpoint of ["/api/editor/flujo", "/api/editor/plan"]) check((await anon.request.post(server.base + endpoint, { data: {} })).status() === 401, `${endpoint} exige sesión`);
  await anon.close();
  const { context: client, page: clientPage } = await login("cliente");
  for (const endpoint of ["/api/editor/flujo", "/api/editor/plan"]) check((await client.request.post(server.base + endpoint, { data: {} })).status() === 403, `${endpoint} rechaza rol de consulta`);
  for (const route of ["/flujo", "/reconciliacion"]) {
    await clientPage.goto(server.base + route);
    check(new URL(clientPage.url()).pathname === "/lineas", `${route} no expone información interna`);
  }
  await clientPage.goto(`${server.base}/lineas?m=M-01`);
  check(await clientPage.locator('[data-testid="ms-panel-M-01"]').count() > 0, "el panel del timeline sigue accesible para consulta");
  check(await clientPage.locator('[data-testid="workflow-M-01"]').count() === 0, "el timeline de consulta oculta bloqueos y evidencia técnica");
  await client.close();
  const { context, page } = await login("editor");
  const post = (url, data) => context.request.post(server.base + url, { data });
  check((await post("/api/editor/flujo", { accion: "bloquear", id: "T-014", tipo: "Bloqueo", afecta: "Integración", descripcion: "App Registration pendiente para integración", responsable: "Infraestructura", revision: "2026-10-06", criterioLiberacion: "Login real verificado", severidad: "Alta", esfuerzoMinutos: 0 })).ok(), "registra un bloqueo de integración");
  check((await post("/api/editor/flujo", ready)).ok(), "permite preparar trabajo con integración pendiente");
  check((await post("/api/editor/flujo", { accion: "validar", id: "T-014", etapa: "Integración", resultado: "Verificada", evidencia: "Todavía no hay acceso al proveedor" })).status() === 409, "no certifica integración bloqueada");
  check((await post("/api/editor/flujo", { ...ready, id: "T-015" })).ok(), "otra actividad puede avanzar");
  check((await post("/api/editor/plan", { accion: "prevision", id: "M-01", fecha: "2026-10-16", motivo: "Acceso pendiente con revisión programada", entregaMinima: "Login con rol real", responsable: "Líder técnico" })).ok(), "registra previsión sin cambiar la fecha base");
  await page.goto(`${server.base}/tareas/T-014`, { waitUntil: "networkidle" });
  check((await page.locator("main").innerText()).includes("App Registration pendiente"), "el detalle identifica el insumo pendiente");
  const form = page.locator("form").filter({ has: page.locator('legend:text-is("Preparar y ejecutar")') });
  await form.locator('[name="responsable"]').fill("Equipo frontend piloto");
  const [saved] = await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/editor/flujo") && r.request().method() === "POST"), form.getByRole("button", { name: "Guardar", exact: true }).click()]);
  const savedBody = await saved.json();
  check(saved.ok(), `el formulario guarda el flujo operativo (${saved.status()}${savedBody.error ? `: ${savedBody.error}` : ""})`);
  await page.reload({ waitUntil: "networkidle" });
  check(await form.locator('[name="responsable"]').inputValue() === "Equipo frontend piloto", "el responsable se conserva al recargar");
  await page.goto(`${server.base}/flujo?area=frontend`, { waitUntil: "networkidle" });
  check(await page.locator('[data-testid="flow-task-T-014"]').count() === 1, "la cola cuenta una sola actividad y conserva el filtro por equipo");
  await page.goto(`${server.base}/lineas?m=M-01`, { waitUntil: "networkidle" });
  check((await page.locator('[data-testid="workflow-M-01"]').innerText()).includes("16 oct"), "el panel muestra la nueva previsión");
  check((await page.locator('[data-testid="workflow-M-01"]').innerText()).includes("15 oct"), "la fecha base permanece visible");
  check(await page.locator('[data-testid="roadmap"]').count() === 1, "se conserva el roadmap de tres líneas");
  mkdirSync("data/reconciliation/screens", { recursive: true });
  await page.screenshot({ path: "data/reconciliation/screens/timeline-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${server.base}/lineas?m=M-01`, { waitUntil: "networkidle" });
  check(await page.locator('[data-testid="ms-panel-M-01"]').count() > 0, "el milestone sigue disponible en móvil");
  await page.screenshot({ path: "data/reconciliation/screens/timeline-mobile.png", fullPage: true });
  await page.goto(`${server.base}/reconciliacion?pendientes=1`, { waitUntil: "networkidle" });
  await page.locator("main details summary").first().click();
  check((await page.locator("main").innerText()).includes("Sin asignación confirmada"), "las actividades de origen pendientes siguen visibles");
  await context.close();
  console.log(`Prueba E2E de flujo: ${cases} casos pasaron; base activa sin modificaciones.`);
} finally { await browser.close(); server.stop(); }
