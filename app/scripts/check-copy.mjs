// Ninguna página dice «cliente»: HTML + payload RSC de cada página, para cada rol (y el login sin sesión),
// con 0 coincidencias sin distinguir mayúsculas. Única excepción: nombres del plan que contienen la palabra
// literalmente (se leen de la base y se listan). Servidor propio en :3101 sobre la COPIA de la base.
import { existsSync } from "node:fs";
import { createClient } from "@libsql/client";
import { chromium } from "playwright";
import { startTestServer } from "./lib/test-server.mjs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
const PALABRA = /cliente/gi;
const servidor = await startTestServer();
const BASE = servidor.base;

// Excepciones: textos del plan (Excel) que contienen la palabra.
const db = createClient({ url: "file:./data/seguimiento.test.db" });
const fuentes = [
  ["lineas", "nombre"], ["lineas", "descripcion"], ["milestones", "nombre"], ["milestones", "valor_cliente"], ["milestones", "criterio"],
  ["historias", "nombre"], ["historias", "feature"], ["tareas", "nombre"], ["tareas", "descripcion"], ["riesgos", "descripcion"], ["riesgos", "mitigacion"], ["sprints", "objetivo"],
];
const excepciones = [];
for (const [t, c] of fuentes) {
  const rows = (await db.execute(`select id, ${c} as v from ${t} where lower(${c}) like '%cliente%'`)).rows;
  for (const r of rows) excepciones.push({ origen: `${t}.${c} ${r.id}`, texto: String(r.v) });
}
db.close();
console.log(`Excepciones (nombres del plan que contienen la palabra): ${excepciones.length}`);
for (const e of excepciones) console.log(`  · ${e.origen}: «${e.texto.length > 90 ? e.texto.slice(0, 90) + "…" : e.texto}»`);

function contar(cuerpo) {
  const cubierto = [];
  const bajo = cuerpo.toLowerCase();
  for (const e of excepciones) {
    const t = e.texto.toLowerCase();
    for (let i = bajo.indexOf(t); i >= 0; i = bajo.indexOf(t, i + 1)) cubierto.push([i, i + t.length]);
  }
  const libres = [];
  for (const m of cuerpo.matchAll(PALABRA)) if (!cubierto.some(([a, b]) => m.index >= a && m.index < b)) libres.push(cuerpo.slice(Math.max(0, m.index - 40), m.index + 47).replace(/\s+/g, " "));
  return libres;
}

const PAGINAS = ["/", "/lineas", "/lineas?m=M-01", "/lineas?m=M-04", "/milestones/M-01", "/milestones/M-04", "/areas", "/areas?area=frontend", "/historias/HU-001", "/tareas/T-005", "/tareas/T-014", "/agenda"];
const EQUIPO = ["/editor", "/editor?vista=hu", "/editor?vista=milestones", "/editor?vista=visibilidad", "/bitacora", "/bitacora?tipo=tarea", "/verificacion"];
let total = 0;
let fallas = 0;
const browser = await chromium.launch();
try {
  const anon = await browser.newContext();
  const login = (await (await anon.request.get(`${BASE}/login`)).text()) + (await (await anon.request.get(`${BASE}/login`, { headers: { RSC: "1" } })).text());
  const l = contar(login);
  console.log(`${l.length ? "FAIL" : "OK  "} sin sesión  /login                 ${l.length}`);
  if (l.length) fallas++;
  await anon.close();
  for (const rol of ["cliente", "editor", "admin"]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}/login`);
    await page.fill("#pin", process.env[`PIN_${rol.toUpperCase()}`] ?? "");
    await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
    for (const ruta of [...PAGINAS, ...EQUIPO]) {
      const cuerpo = (await (await context.request.get(`${BASE}${ruta}`)).text()) + (await (await context.request.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text());
      const libres = contar(cuerpo);
      total += libres.length;
      console.log(`${libres.length ? "FAIL" : "OK  "} ${rol.padEnd(8)} ${ruta.padEnd(26)} ${libres.length}`);
      for (const x of libres.slice(0, 3)) console.log(`       · …${x}…`);
      if (libres.length) fallas++;
    }
    await context.close();
  }
} finally {
  await browser.close();
  servidor.stop();
}
console.log(`\nCoincidencias de «cliente» fuera de las excepciones: ${total}`);
if (fallas) process.exit(1);
console.log("OK: ninguna página muestra «cliente».");