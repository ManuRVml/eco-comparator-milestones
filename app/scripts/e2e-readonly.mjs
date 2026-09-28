// Roles de consulta (hoy: Equipo Ecopetrol) estrictamente de solo lectura. Servidor propio en :3101 sobre la COPIA.
// 1) Enumera TODAS las rutas mutantes (src/app/**/route.ts con POST/PUT/PATCH/DELETE) y exige 403 para el observador.
// 2) Enumera las server actions («use server»); solo se admiten las de sesión (login/logout), declaradas abajo.
// 3) Ninguna página muestra controles de edición; el clic en un nodo solo abre el panel de lectura.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "playwright";
import { startTestServer } from "./lib/test-server.mjs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
const OBSERVADORES = ["cliente"]; // claves internas de roles de consulta
const ACCIONES_DE_SESION = { "src/app/login/actions.ts": ["loginWithPin", "logout"] };
const CUERPOS = {
  "/api/editor/estado": { tipo: "tarea", id: "T-014", estado: "Hecha", evidencia: "intento de solo lectura" },
  "/api/editor/nota": { entidadTipo: "tarea", entidadId: "T-014", texto: "intento de solo lectura", visibleCliente: true },
  "/api/editor/visibilidad": { tipo: "tarea", id: "T-014", visible: false },
  "/api/editor/config": { clave: "resumen_area_ecopetrol", valor: "0" },
  "/api/editor/publicacion": { tipo: "tarea", id: "T-005", publicar: true, nota: "intento de solo lectura" },
};
const EDICION = "select, textarea, input, .estado-control, .nota-form, .pub-control, .vis-toggle, .switch, .btn-primary";

function* archivos(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* archivos(p);
    else if (/\.(tsx?|mjs|js)$/.test(n)) yield p;
  }
}
const rutas = [];
const acciones = [];
for (const f of archivos("src")) {
  const rel = relative(".", f).replaceAll("\\", "/");
  const src = readFileSync(f, "utf8");
  if (/\/route\.ts$/.test(rel)) {
    const metodos = [...src.matchAll(/export\s+(?:const|async\s+function|function)\s+(POST|PUT|PATCH|DELETE)\b/g)].map((m) => m[1]);
    const url = "/" + rel.replace(/^src\/app\//, "").replace(/\/route\.ts$/, "").replace(/\([^)]*\)\//g, "");
    for (const m of metodos) rutas.push({ url, metodo: m, archivo: rel });
  }
  if (/^\s*["']use server["']/m.test(src)) {
    for (const m of src.matchAll(/export\s+async\s+function\s+(\w+)/g)) acciones.push({ archivo: rel, nombre: m[1] });
  }
}

let fallas = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "OK  " : "FAIL"} ${msg}`);
  if (!ok) fallas++;
};

console.log(`Rutas mutantes encontradas: ${rutas.length}`);
console.log(`Server actions encontradas: ${acciones.map((a) => `${a.archivo}#${a.nombre}`).join(", ")}`);
for (const a of acciones) {
  const permitida = (ACCIONES_DE_SESION[a.archivo] ?? []).includes(a.nombre);
  check(permitida, `server action ${a.nombre} (${a.archivo}): ${permitida ? "de sesión (login/logout), no modifica datos" : "NO declarada: debe exigir rol editor/admin y cubrirse aquí"}`);
}

const servidor = await startTestServer();
const BASE = servidor.base;
const browser = await chromium.launch();
try {
  for (const rol of OBSERVADORES) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-CO" });
    const page = await context.newPage();
    await page.goto(`${BASE}/login`);
    await page.fill("#pin", process.env[`PIN_${rol.toUpperCase()}`] ?? "");
    await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
    for (const r of rutas) {
      const res = await context.request.fetch(`${BASE}${r.url}`, { method: r.metodo, data: CUERPOS[r.url] ?? {} });
      check(res.status() === 403, `observador ${r.metodo} ${r.url} → HTTP ${res.status()}${CUERPOS[r.url] ? "" : " (sin cuerpo de ejemplo)"}`);
    }
    for (const ruta of ["/", "/lineas", "/lineas?m=M-01", "/milestones/M-01", "/areas", "/areas?area=frontend", "/historias/HU-001", "/tareas/T-005", "/tareas/T-014", "/agenda", "/editor", "/bitacora", "/verificacion"]) {
      await page.goto(`${BASE}${ruta}`, { waitUntil: "networkidle" });
      const n = await page.locator(`main ${EDICION.split(", ").join(`, main `)}`).count();
      check(n === 0, `observador ${ruta.padEnd(20)} sin controles de edición (${n})`);
    }
    await page.goto(`${BASE}/lineas`, { waitUntil: "networkidle" });
    await page.click("[data-testid=node-M-01]");
    await page.locator("[data-testid=slot-L1].is-open [data-testid=ms-panel-M-01]").waitFor({ timeout: 5000 });
    check((await page.locator("[data-testid=slot-L1] .pub-control, [data-testid=slot-L1] select").count()) === 0 && new URL(page.url()).pathname === "/lineas", "observador: clic en M01 solo abre el panel de lectura");
    await context.close();
  }
} finally {
  await browser.close();
  servidor.stop();
}
if (fallas) {
  console.error(`\n${fallas} verificaciones fallaron`);
  process.exit(1);
}
console.log("\nRoles de consulta: solo lectura verificada.");