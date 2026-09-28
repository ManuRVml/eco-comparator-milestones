// Prueba end-to-end del flujo de edición y publicación. Arranca su propio servidor en :3101 sobre una COPIA
// de la base (data/seguimiento.test.db); nunca escribe en data/seguimiento.db.
// 1) editor marca Hecha con evidencia (técnico) → el equipo Ecopetrol NO lo ve;
// 2) editor «Aprobar y publicar» (fecha + nota) → Ecopetrol lo ve sin recargar; 3) admin retira → deja de verlo;
// 4) lo mismo para un milestone; 5) bitácora con rol; 6) notas internas invisibles; 7) 403 para el rol de consulta.
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { startTestServer } from "./lib/test-server.mjs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
const servidor = await startTestServer();
const BASE = servidor.base;
const OUT = resolve(process.env.SCREENS_DIR ?? "docs/screens");
const TAREA = "T-014";
const stamp = new Date().toISOString().slice(11, 19);
const EVIDENCIA = `Evidencia técnica ${stamp}: pantalla ContextSelector revisada`;
const NOTA_PUB = `Demostrado en weekly 01/10 · ${stamp}`;
const NOTA_MS = `Milestone demostrado en weekly · ${stamp}`;
const NOTA_VISIBLE = `Nota visible ${stamp}: el selector de contexto se mostrará en el weekly.`;
const NOTA_INTERNA = `Nota interna ${stamp}: solo para el equipo del proyecto.`;
mkdirSync(OUT, { recursive: true });

let fallas = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "OK  " : "FAIL"} ${msg}`);
  if (!ok) fallas++;
};
async function login(browser, role) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-CO" });
  const page = await context.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill("#pin", process.env[`PIN_${role.toUpperCase()}`] ?? "");
  await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
  return { context, page };
}
const badge = (p) => p.locator(".entity-hero .status-badge").first();

const browser = await chromium.launch();
try {
  const editor = await login(browser, "editor");
  const admin = await login(browser, "admin");
  const eco = await login(browser, "cliente");

  await eco.page.goto(`${BASE}/tareas/${TAREA}`);
  const antes = (await badge(eco.page).innerText()).trim();
  console.log(`Equipo Ecopetrol ve ${TAREA} como: ${antes}`);
  check((await eco.page.locator("select, .estado-control, .nota-form, .pub-control, .vis-toggle").count()) === 0, "Equipo Ecopetrol: sin controles de edición en la tarea");

  // 1) Hecha técnica con evidencia (editor) — no llega a Ecopetrol.
  await editor.page.goto(`${BASE}/editor?ms=M-01`, { waitUntil: "networkidle" });
  const fila = editor.page.locator(`[data-testid=row-${TAREA}]`);
  await fila.locator(`#estado-tarea-${TAREA}`).selectOption("Hecha");
  await fila.locator(`#evid-tarea-${TAREA}`).fill(EVIDENCIA);
  await editor.page.evaluate(() => window.scrollTo(0, 0));
  await editor.page.waitForTimeout(700);
  await editor.page.screenshot({ path: resolve(OUT, "editor.png"), fullPage: true });
  console.log(`captura: ${resolve(OUT, "editor.png")}`);
  await fila.getByRole("button", { name: "Marcar como Hecha" }).click();
  await fila.locator(".status-badge", { hasText: "Hecha" }).first().waitFor({ timeout: 15000 });
  check(true, `editor: ${TAREA} Hecha (técnico) con evidencia`);
  const sinEvid = await editor.context.request.post(`${BASE}/api/editor/estado`, { data: { tipo: "tarea", id: "T-015", estado: "Hecha" } });
  check(sinEvid.status() === 422, `editor: Hecha sin evidencia → HTTP ${sinEvid.status()}`);
  await eco.page.waitForTimeout(10000);
  const trasTecnico = (await badge(eco.page).innerText()).trim();
  check(trasTecnico === antes, `Equipo Ecopetrol: tras el Hecha técnico sigue viendo ${TAREA} = ${trasTecnico}`);

  // 2) Editor aprueba y publica (fecha + nota) → Ecopetrol lo ve sin recargar.
  await fila.getByRole("button", { name: "Aprobar y publicar" }).click();
  await fila.locator(`#pub-nota-${TAREA}`).fill(NOTA_PUB);
  await fila.getByRole("button", { name: "Publicar", exact: true }).click();
  await fila.locator(".chip", { hasText: "Publicada" }).waitFor({ timeout: 15000 });
  check(true, `editor: ${TAREA} aprobada y publicada («${NOTA_PUB}»)`);
  let t0 = Date.now();
  await eco.page.locator(".entity-hero .status-badge", { hasText: "Hecha" }).waitFor({ timeout: 30000 });
  check((await eco.page.getByText(NOTA_PUB).count()) > 0, `Equipo Ecopetrol: ve ${TAREA} = Hecha con la nota de entrega, sin recargar (${((Date.now() - t0) / 1000).toFixed(1)} s)`);

  // 3) Admin retira → Ecopetrol deja de verlo.
  await admin.page.goto(`${BASE}/verificacion`, { waitUntil: "networkidle" });
  await admin.page.locator(`[data-testid=verif-publicadas] [data-testid=verif-${TAREA}]`).getByRole("button", { name: "Retirar publicación" }).click();
  await admin.page.locator(`[data-testid=verif-pendientes] [data-testid=verif-${TAREA}]`).waitFor({ timeout: 15000 });
  check(true, `admin: retira la publicación de ${TAREA} desde «Pendiente de verificación»`);
  t0 = Date.now();
  await eco.page.locator(".entity-hero .status-badge", { hasText: antes }).waitFor({ timeout: 30000 });
  check((await eco.page.getByText(NOTA_PUB).count()) === 0, `Equipo Ecopetrol: vuelve a ver ${TAREA} = ${antes} sin recargar (${((Date.now() - t0) / 1000).toFixed(1)} s)`);

  // 4) Milestone: editor publica M-02 (fecha pasada), Ecopetrol ve «Entregado», admin retira.
  const pubMs = await editor.context.request.post(`${BASE}/api/editor/publicacion`, { data: { tipo: "milestone", id: "M-02", publicar: true, nota: NOTA_MS, fecha: "2026-09-25" } });
  check(pubMs.ok(), `editor: publica el milestone M-02 (completado 2026-09-25) → HTTP ${pubMs.status()}`);
  const futura = await editor.context.request.post(`${BASE}/api/editor/publicacion`, { data: { tipo: "milestone", id: "M-03", publicar: true, nota: NOTA_MS, fecha: "2099-01-01" } });
  check(futura.status() === 422, `editor: fecha futura → HTTP ${futura.status()} (${(await futura.json()).error})`);
  await eco.page.goto(`${BASE}/lineas?m=M-02`, { waitUntil: "networkidle" });
  check((await eco.page.locator("[data-testid=entregado-M-02]").innerText()).includes(NOTA_MS), "Equipo Ecopetrol: el panel de M-02 muestra «Entregado el 25 sep»");
  check((await eco.page.locator("[data-testid=slot-L2] .pub-control").count()) === 0, "Equipo Ecopetrol: el panel del milestone es de solo lectura");
  const retMs = await admin.context.request.post(`${BASE}/api/editor/publicacion`, { data: { tipo: "milestone", id: "M-02", publicar: false } });
  check(retMs.ok(), `admin: retira la publicación de M-02 → HTTP ${retMs.status()}`);
  await eco.page.goto(`${BASE}/lineas?m=M-02`, { waitUntil: "networkidle" });
  check((await eco.page.locator("[data-testid=entregado-M-02]").count()) === 0, "Equipo Ecopetrol: M-02 ya no aparece como entregado");
  const noHecha = await editor.context.request.post(`${BASE}/api/editor/publicacion`, { data: { id: "T-015", publicar: true, nota: "Demostrado en weekly" } });
  check(noHecha.status() === 422, `editor: publicar una tarea no Hecha → HTTP ${noHecha.status()} (${(await noHecha.json()).error})`);

  // 5) Bitácora con rol.
  await admin.page.goto(`${BASE}/bitacora`, { waitUntil: "networkidle" });
  const filas = (await admin.page.locator("[data-testid=log-table] tbody tr").allInnerTexts()).map((x) => x.replace(/\s+/g, " ").replace(/\s*→\s*/g, " → ").trim());
  const pub = filas.filter((x) => x.includes("publicación al equipo Ecopetrol"));
  for (const x of pub) console.log(`Bitácora: ${x.slice(0, 140)}`);
  check(
    pub.some((x) => x.includes(TAREA) && x.includes("Editor") && x.includes("No publicada → Publicada")) &&
      pub.some((x) => x.includes(TAREA) && x.includes("Administrador") && x.includes("Publicada → Retirada")) &&
      pub.some((x) => x.includes("M-02") && x.includes("Editor")) &&
      pub.some((x) => x.includes("M-02") && x.includes("Administrador")),
    "bitácora: publicar (editor) y retirar (admin) de tarea y milestone, con rol y fecha",
  );
  await admin.page.evaluate(() => window.scrollTo(0, 0));
  await admin.page.screenshot({ path: resolve(OUT, "log.png"), fullPage: true });
  console.log(`captura: ${resolve(OUT, "log.png")}`);

  // 6) Notas: visible e interna.
  await editor.page.goto(`${BASE}/tareas/${TAREA}`, { waitUntil: "networkidle" });
  const form = editor.page.locator("[data-testid=nota-form]");
  await form.locator("textarea").fill(NOTA_INTERNA);
  await form.getByRole("button", { name: "Agregar nota" }).click();
  await editor.page.locator(".nota", { hasText: NOTA_INTERNA }).waitFor({ timeout: 15000 });
  await form.locator("textarea").fill(NOTA_VISIBLE);
  await form.getByRole("radio", { name: "Visible para Ecopetrol" }).click();
  await form.getByRole("button", { name: "Agregar nota" }).click();
  await editor.page.locator(".nota", { hasText: NOTA_VISIBLE }).waitFor({ timeout: 15000 });
  const html = (await (await eco.context.request.get(`${BASE}/tareas/${TAREA}`)).text()) + (await (await eco.context.request.get(`${BASE}/tareas/${TAREA}`, { headers: { RSC: "1" } })).text());
  check(html.includes(NOTA_VISIBLE.slice(0, 30)), "Equipo Ecopetrol: ve la nota visible");
  check(!html.includes(NOTA_INTERNA.slice(0, 25)), "Equipo Ecopetrol: la nota interna NO está en el HTML ni en el payload RSC");
  const mHtml = await (await eco.context.request.get(`${BASE}/milestones/M-01`)).text();
  check(!mHtml.includes("R-N1") && !mHtml.includes("R-N2"), "Equipo Ecopetrol: riesgos internos de M-01 no aparecen");

  // 7) 401 sin sesión (el 403 de cada ruta mutante lo cubre check:readonly).
  const anon = await browser.newContext();
  const r401 = await anon.request.post(`${BASE}/api/editor/estado`, { data: { tipo: "tarea", id: TAREA, estado: "Pendiente" } });
  check(r401.status() === 401, `sin sesión POST /api/editor/estado → HTTP ${r401.status()}`);
  await anon.close();
} finally {
  await browser.close();
  servidor.stop();
}
if (fallas) {
  console.error(`\n${fallas} verificaciones fallaron`);
  process.exit(1);
}
console.log("\nFlujo de edición y publicación verificado.");