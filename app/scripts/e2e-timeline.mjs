// Panel de entregables en la línea de tiempo (rol cliente), contra el servidor en marcha.
// Clic en M01 abre el panel en la misma vista (URL igual o con ?m=), Esc lo cierra, clic en otro nodo
// cambia el contenido, ?m= abre el panel al cargar y ningún riesgo interno aparece (DOM ni payload RSC).
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { startTestServer } from "./lib/test-server.mjs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
const servidor = await startTestServer();
const BASE = servidor.base;
const OUT = resolve(process.env.SCREENS_DIR ?? "docs/screens");
mkdirSync(OUT, { recursive: true });
// Riesgos internos (seed/riesgos.csv, interno=1): ids y fragmentos de su texto.
const INTERNOS = ["R-N1", "R-N2", "R-N3", "R-N4", "modo mock/contrato", "van atrasados frente al plan", "Concentración de demos", "Ventana corta de salida"];

let fallas = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "OK  " : "FAIL"} ${msg}`);
  if (!ok) fallas++;
};

async function login(browser, viewport) {
  if (!process.env.PIN_CLIENTE) throw new Error("Falta PIN_CLIENTE en .env.local");
  const context = await browser.newContext({ viewport, locale: "es-CO" });
  const page = await context.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill("#pin", process.env.PIN_CLIENTE);
  await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
  return { context, page };
}
const abierto = (page, linea) => page.locator(`[data-testid=slot-${linea}].is-open`);

const browser = await chromium.launch();
try {
  const { context, page } = await login(browser, { width: 1440, height: 900 });
  await page.goto(`${BASE}/lineas`, { waitUntil: "networkidle" });
  await page.evaluate(() => (window.__sinRecarga = true));

  await page.click("[data-testid=node-M-01]");
  const panel = page.locator("[data-testid=slot-L1].is-open [data-testid=ms-panel-M-01]");
  await panel.waitFor({ state: "visible", timeout: 5000 });
  const url = new URL(page.url());
  check(url.pathname === "/lineas" && [...url.searchParams.keys()].every((k) => k === "m") && url.searchParams.get("m") === "M-01", `URL tras clic: ${url.pathname}${url.search} (misma vista, solo ?m)`);
  check(await page.evaluate(() => window.__sinRecarga === true), "sin recarga ni cambio de página (mismo documento)");
  const texto = await panel.innerText();
  const hu = ["HU-001", "HU-002", "HU-003", "HU-004", "HU-005", "HU-006", "HU-008", "HU-010", "HU-018", "HU-019"];
  check(hu.every((h) => texto.includes(h)), `panel M-01 muestra sus 10 HU (${hu[0]} … ${hu[hu.length - 1]})`);
  const tareas = ["T-001", "T-004", "T-005", "T-006", "T-010", "T-021"];
  check(tareas.every((t) => texto.includes(t)), `panel M-01 muestra sus tareas por área (${tareas.join(", ")} …)`);
  check(/Qué recibe el equipo Ecopetrol/i.test(texto) && texto.includes("identidad corporativa"), "panel: «Qué recibe el cliente» con la declaración de valor");
  check(/Faltan 17 días/.test(texto) && /0\/20 tareas entregadas/.test(texto), "panel: cabecera con días restantes y avance oficial 0/20 (nada publicado)");
  check(texto.includes("Ver detalle completo"), "panel: enlace «Ver detalle completo»");
  const dom = await page.content();
  check(INTERNOS.every((t) => !dom.includes(t)), "DOM del cliente: sin texto de riesgos internos");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(450);
  await page.screenshot({ path: resolve(OUT, "timeline-m01.png"), fullPage: true });
  console.log(`captura: ${resolve(OUT, "timeline-m01.png")}`);

  await page.keyboard.press("Escape");
  await abierto(page, "L1").waitFor({ state: "detached", timeout: 3000 });
  check((await abierto(page, "L1").count()) === 0 && !new URL(page.url()).searchParams.has("m"), "Esc cierra el panel y quita ?m");

  await page.click("[data-testid=node-M-01]");
  await panel.waitFor({ state: "visible" });
  await page.click("[data-testid=node-M-05]");
  await page.locator("[data-testid=slot-L1].is-open [data-testid=ms-panel-M-05]").waitFor({ state: "visible" });
  check(new URL(page.url()).searchParams.get("m") === "M-05", "clic en otro nodo cambia el contenido (M-05)");
  await page.click("[data-testid=node-M-02]");
  await page.locator("[data-testid=slot-L2].is-open [data-testid=ms-panel-M-02]").waitFor({ state: "visible" });
  check((await abierto(page, "L1").count()) === 0, "nodo de otra línea: se cierra L1 y se abre bajo L2");
  await page.click("[data-testid=node-M-02]");
  await abierto(page, "L2").waitFor({ state: "detached", timeout: 3000 });
  check(true, "clic en el mismo nodo cierra el panel");
  await page.click("[data-testid=node-M-01]");
  await panel.locator(".panel-x").click();
  await abierto(page, "L1").waitFor({ state: "detached", timeout: 3000 });
  check(true, "botón X cierra el panel");

  await page.goto(`${BASE}/lineas?m=M-03`, { waitUntil: "networkidle" });
  check(await page.locator("[data-testid=slot-L3].is-open [data-testid=ms-panel-M-03]").isVisible(), "deep link ?m=M-03 abre el panel al cargar");

  for (const ruta of ["/lineas", "/lineas?m=M-01", "/lineas?m=M-10"]) {
    const html = await (await context.request.get(`${BASE}${ruta}`)).text();
    const rsc = await (await context.request.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text();
    const fuga = INTERNOS.filter((t) => html.includes(t) || rsc.includes(t));
    check(fuga.length === 0 && rsc.length > 1000, `cliente ${ruta}: HTML + payload RSC (${rsc.length} bytes) sin riesgos internos${fuga.length ? ` — FUGA: ${fuga.join(", ")}` : ""}`);
  }
  await context.close();

  const movil = await login(browser, { width: 390, height: 844 });
  await movil.page.goto(`${BASE}/lineas`, { waitUntil: "networkidle" });
  await movil.page.locator(".roadmap-scroll").evaluate((el) => (el.scrollLeft = 170));
  await movil.page.click("[data-testid=node-M-01]");
  await movil.page.locator("[data-testid=slot-L1].is-open [data-testid=ms-panel-M-01]").waitFor({ state: "visible" });
  await movil.page.waitForTimeout(500);
  const box = await movil.page.locator("[data-testid=slot-L1]").boundingBox();
  check(!!box && box.width <= 390 && box.y + box.height <= 845, `móvil 390 px: bottom sheet ${Math.round(box?.width ?? 0)}×${Math.round(box?.height ?? 0)} anclado abajo`);
  await movil.page.screenshot({ path: resolve(OUT, "timeline-m01-mobile.png") });
  console.log(`captura: ${resolve(OUT, "timeline-m01-mobile.png")}`);
  await movil.page.keyboard.press("Escape");
  await abierto(movil.page, "L1").waitFor({ state: "detached", timeout: 3000 });
  check(true, "móvil: Esc cierra el bottom sheet");
  await movil.context.close();
} finally {
  await browser.close();
  servidor.stop();
}
if (fallas) {
  console.error(`\n${fallas} verificaciones fallaron`);
  process.exit(1);
}
console.log("\nPanel de entregables verificado.");