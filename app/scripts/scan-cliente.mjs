// Escaneo de solo lectura: entra como cliente y busca términos en el HTML y en el payload RSC servidos.
// Uso: node scripts/scan-cliente.mjs [término ...]   (BASE_URL por defecto http://localhost:3100; solo GET)
// Sale con código 1 si hay alguna coincidencia.
import { existsSync } from "node:fs";
import { chromium } from "playwright";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const TERMINOS = process.argv.slice(2).filter((a) => a !== "--");
const RUTAS = (process.env.SCAN_PATHS ?? "/,/lineas,/lineas?m=M-01,/milestones/M-01,/areas,/areas?area=frontend,/tareas/T-010,/tareas/T-014,/historias/HU-001,/agenda").split(",");
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const browser = await chromium.launch();
let total = 0;
try {
  const page = await browser.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill("#pin", process.env.PIN_CLIENTE ?? "");
  await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
  const req = page.context().request;
  console.log(`Cliente en ${BASE} · HTML + payload RSC · términos (sin distinguir mayúsculas): ${TERMINOS.map((t) => `"${t}"`).join(", ")}`);
  for (const ruta of RUTAS) {
    const cuerpo = (await (await req.get(`${BASE}${ruta}`)).text()) + (await (await req.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text());
    const hits = TERMINOS.map((t) => [t, (cuerpo.match(new RegExp(esc(t), "gi")) ?? []).length]);
    const suma = hits.reduce((s, [, n]) => s + n, 0);
    total += suma;
    console.log(`${suma === 0 ? "OK  " : "HIT "} ${ruta.padEnd(22)} ${hits.map(([t, n]) => `${t}=${n}`).join("  ")}`);
    if (process.env.SCAN_CONTEXT && suma) {
      const vistos = new Set();
      for (const t of TERMINOS)
        for (const m of cuerpo.matchAll(new RegExp(`.{0,40}${esc(t)}.{0,40}`, "gi"))) vistos.add(m[0].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
      for (const s of vistos) console.log(`       · ${s}`);
    }
  }
} finally {
  await browser.close();
}
console.log(`Total de coincidencias: ${total}`);
process.exit(total === 0 ? 0 : 1);