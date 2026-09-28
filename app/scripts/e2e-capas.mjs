// Dos capas de avance. Arranca su propio servidor en :3101 sobre una COPIA de la base.
// - Cliente: HTML + payload RSC sin rastros técnicos (código, repos, commits, «técnico interno»); solo números oficiales.
// - Editor: ve la capa oficial y la técnica interna, rotulada.
// Capturas: docs/screens/dashboard-ecopetrol.png, dashboard-admin.png y admin-verificacion.png.
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { startTestServer } from "./lib/test-server.mjs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
const servidor = await startTestServer();
const BASE = servidor.base;
const OUT = resolve(process.env.SCREENS_DIR ?? "docs/screens");
mkdirSync(OUT, { recursive: true });
const PROHIBIDOS = ["respaldadas por código", "eco-comparator-web", "eco-comparator-bff", "commit", "técnico interno"];
const RUTAS = ["/", "/lineas", "/lineas?m=M-01", "/milestones/M-01", "/areas", "/areas?area=frontend", "/historias/HU-001", "/tareas/T-005", "/tareas/T-010", "/agenda"];
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
const limpio = (t) => t.replace(/\s+/g, " ").trim();

const browser = await chromium.launch();
try {
  const cli = await login(browser, "cliente");
  console.log(`Equipo Ecopetrol · HTML + payload RSC · prohibidos: ${PROHIBIDOS.map((p) => `"${p}"`).join(", ")}`);
  for (const ruta of RUTAS) {
    const cuerpo = (await (await cli.context.request.get(`${BASE}${ruta}`)).text()) + (await (await cli.context.request.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text());
    const hits = PROHIBIDOS.map((p) => [p, (cuerpo.match(new RegExp(esc(p), "gi")) ?? []).length]).filter(([, n]) => n > 0);
    check(hits.length === 0, `Ecopetrol ${ruta.padEnd(20)} ${hits.length ? hits.map(([p, n]) => `${p}=${n}`).join(" ") : "0 coincidencias"}`);
  }
  await cli.page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const heroCli = limpio(await cli.page.locator("[data-testid=hero-titulo]").innerText());
  const statsCli = limpio(await cli.page.locator("[data-testid=hero-stats]").innerText());
  console.log(`Equipo Ecopetrol · hero: «${heroCli}» · ${statsCli}`);
  check(/^0 de 99 tareas entregadas al equipo Ecopetrol/.test(heroCli), "Equipo Ecopetrol: avance oficial inicial 0/99 (nada publicado)");
  check((await cli.page.locator("[data-testid=avance-tecnico]").count()) === 0, "Equipo Ecopetrol: sin banda de avance técnico interno");
  await cli.page.waitForTimeout(1200);
  await cli.page.screenshot({ path: resolve(OUT, "dashboard-ecopetrol.png"), fullPage: true });
  console.log(`captura: ${resolve(OUT, "dashboard-ecopetrol.png")}`);

  const ed = await login(browser, "admin");
  await ed.page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const heroEd = limpio(await ed.page.locator("[data-testid=hero-titulo]").innerText());
  const statsEd = limpio(await ed.page.locator("[data-testid=hero-stats]").innerText());
  const tec = limpio(await ed.page.locator("[data-testid=avance-tecnico]").innerText());
  console.log(`Admin · oficial: «${heroEd}» · ${statsEd}`);
  console.log(`Admin · técnico: ${tec}`);
  check(heroEd === heroCli && /Avance técnico interno \(local, no visible para el equipo Ecopetrol\)/.test(tec) && /25\/99/.test(tec), "admin: ve ambas capas (oficial igual a Ecopetrol + técnica sugerida 25/99 rotulada)");
  await ed.page.waitForTimeout(1200);
  await ed.page.screenshot({ path: resolve(OUT, "dashboard-admin.png"), fullPage: true });
  console.log(`captura: ${resolve(OUT, "dashboard-admin.png")}`);
  await ed.page.goto(`${BASE}/verificacion`, { waitUntil: "networkidle" });
  const pendientes = await ed.page.locator("[data-testid=verif-pendientes] tbody tr").count();
  check(pendientes === 25, `admin: cola «Pendiente de verificación» con ${pendientes} tareas Hecha sin publicar`);
  await ed.page.getByRole("button", { name: "Aprobar y publicar" }).first().click();
  await ed.page.waitForTimeout(700);
  await ed.page.screenshot({ path: resolve(OUT, "admin-verificacion.png"), fullPage: true });
  console.log(`captura: ${resolve(OUT, "admin-verificacion.png")}`);
} finally {
  await browser.close();
  servidor.stop();
}
if (fallas) {
  console.error(`\n${fallas} verificaciones fallaron`);
  process.exit(1);
}
console.log("\nCapas de avance verificadas.");