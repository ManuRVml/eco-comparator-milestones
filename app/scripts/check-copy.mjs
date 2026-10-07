// check-copy.mjs - two modes:
// Default (no --vocab): check for "cliente" word only (like origin/main)
// Vocab mode (--vocab or CHECK_VOCAB=1): check for client vocabulary terms
import { existsSync } from "node:fs";
import { argv } from "node:process";
import { createClient } from "@libsql/client";
import { chromium } from "playwright";
import { startTestServer } from "./lib/test-server.mjs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);

const VOCAB_MODE = argv.includes("--vocab") || process.env.CHECK_VOCAB === "1";

const VOCABULARY_TERMS = [
  { term: "HU-", regex: /HU-/gi },
  { term: "SP", regex: /\bSP\b/gi },
  { term: "story point", regex: /\bstory point\b/gi },
  { term: "sprint", regex: /\bsprint\b/gi },
  { term: "épica", regex: /\b(épica|epic)\b/gi },
  { term: "backlog", regex: /\bbacklog\b/gi },
  { term: "ruta crítica", regex: /\bruta crítica\b/gi },
  { term: "velocity", regex: /\bvelocity\b/gi },
  { term: "QA", regex: /\bQA\b/gi },
  { term: "E2E", regex: /\bE2E\b/gi },
  { term: "Gold", regex: /\bGold\b/gi },
  { term: "Silver", regex: /\bSilver\b/gi },
  { term: "Bronze", regex: /\bBronze\b/gi },
];

// Rutas técnicas permitidas (editor, tareas, historias, milestones/[id] team tabs, /detalle)
const RUTAS_TECNICAS = [
  /^\/editor($|\?)/,
  /^\/bitacora($|\?)/,
  /^\/verificacion($|\?)/,
  /^\/tareas\//,
  /^\/historias\//,
  /^\/milestones\/[^/?]+(\?tab=([a-z]+))?($|&)/,
  /^\/detalle/,
];

function esRutaTecnica(ruta) {
  return RUTAS_TECNICAS.some((patron) => patron.test(ruta));
}

async function loadExcepciones(db) {
  const fuentes = [
    ["lineas", "nombre"], ["lineas", "descripcion"], ["milestones", "nombre"], ["milestones", "valor_cliente"], ["milestones", "criterio"],
    ["historias", "nombre"], ["historias", "feature"], ["tareas", "nombre"], ["tareas", "descripcion"], ["riesgos", "descripcion"], ["riesgos", "mitigacion"], ["sprints", "objetivo"],
  ];
  const excepciones = [];
  for (const [t, c] of fuentes) {
    const rows = (await db.execute(`select id, ${c} as v from ${t} where lower(${c}) like '%cliente%'`)).rows;
    for (const r of rows) excepciones.push({ origen: `${t}.${c} ${r.id}`, texto: String(r.v) });
  }
  return excepciones;
}

// Count "cliente" word matches (default mode)
function contarCliente(cuerpo, excepciones) {
  const cubierto = [];
  const bajo = cuerpo.toLowerCase();
  for (const e of excepciones) {
    const t = e.texto.toLowerCase();
    for (let i = bajo.indexOf(t); i >= 0; i = bajo.indexOf(t, i + 1)) cubierto.push([i, i + t.length]);
  }
  const libres = [];
  for (const m of cuerpo.matchAll(/cliente/gi)) {
    if (!cubierto.some(([a, b]) => m.index >= a && m.index < b)) {
      libres.push(cuerpo.slice(Math.max(0, m.index - 40), m.index + 47).replace(/\s+/g, " ").replace(/<[^>]*>/g, " "));
    }
  }
  return libres;
}

// Count vocabulary terms (vocab mode)
function contarVocabulario(cuerpo, excepciones) {
  const cubierto = [];
  const bajo = cuerpo.toLowerCase();
  for (const e of excepciones) {
    const t = e.texto.toLowerCase();
    for (let i = bajo.indexOf(t); i >= 0; i = bajo.indexOf(t, i + 1)) cubierto.push([i, i + t.length]);
  }
  const terminos = [];
  for (const { term, regex } of VOCABULARY_TERMS) {
    const matches = [...cuerpo.matchAll(regex)];
    for (const m of matches) {
      if (!cubierto.some(([a, b]) => m.index >= a && m.index < b)) {
        terminos.push({ term, snippet: cuerpo.slice(Math.max(0, m.index - 40), m.index + 47).replace(/\s+/g, " ").replace(/<[^>]*>/g, " ") });
      }
    }
  }
  return terminos;
}

// Group vocab hits by route and get top 10 per route
function agruparVocabPorRuta(hits) {
  const porRuta = new Map();
  for (const h of hits) {
    if (!porRuta.has(h.ruta)) porRuta.set(h.ruta, []);
    porRuta.get(h.ruta).push(h);
  }
  const resultado = [];
  for (const [ruta, terms] of porRuta) {
    const resumen = new Map();
    for (const t of terms) {
      resumen.set(t.term, (resumen.get(t.term) || 0) + 1);
    }
    const top10 = [...resumen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    resultado.push({ ruta, terms: top10, total: terms.length });
  }
  return resultado;
}

const servidor = await startTestServer();
const BASE = servidor.base;

// Excepciones: textos del plan (Excel) que contienen la palabra.
const db = createClient({ url: "file:./data/seguimiento.test.db" });
const excepciones = await loadExcepciones(db);
db.close();
console.log(`Excepciones (nombres del plan que contienen la palabra): ${excepciones.length}`);
for (const e of excepciones) console.log(`  · ${e.origen}: «${e.texto.length > 90 ? e.texto.slice(0, 90) + "…" : e.texto}»`);

const PAGINAS_CLIENTE = ["/", "/lineas", "/lineas?m=M-01", "/lineas?m=M-04", "/milestones/M-01", "/milestones/M-04", "/areas", "/areas?area=frontend", "/historias/HU-001", "/tareas/T-005", "/tareas/T-014", "/agenda"];
const EQUIPO = ["/editor", "/editor?vista=hu", "/editor?vista=milestones", "/editor?vista=visibilidad", "/bitacora", "/bitacora?tipo=tarea", "/verificacion"];

if (VOCAB_MODE) {
  // Vocab mode: check vocabulary terms
  console.log("\n=== VOCABULARY MODE ===\n");
  const hits = [];
  
  const browser = await chromium.launch();
  try {
    const anon = await browser.newContext();
    
    // Login sin sesión (anónimo)
    const login = (await (await anon.request.get(`${BASE}/login`)).text()) + (await (await anon.request.get(`${BASE}/login`, { headers: { RSC: "1" } })).text());
    const l = contarVocabulario(login, excepciones);
    if (l.length > 0) hits.push({ ruta: "/login", term: "multiple", snippet: l[0].snippet });
    console.log(`${l.length ? "FAIL" : "OK  "} sin sesión  /login                 vocab=${l.length}`);
    
    await anon.close();
    
    // Solo el rol cliente debe acceder a las páginas de cara al cliente
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}/login`);
    await page.fill("#pin", process.env.PIN_CLIENTE ?? "");
    await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
    const req = context.request;
    
    // Verificar páginas de cara al cliente
    for (const ruta of PAGINAS_CLIENTE) {
      const cuerpo = (await (await req.get(`${BASE}${ruta}`)).text()) + (await (await req.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text());
      const vocabulario = contarVocabulario(cuerpo, excepciones);
      for (const v of vocabulario) hits.push({ ruta, term: v.term, snippet: v.snippet });
      if (vocabulario.length > 0) {
        if (esRutaTecnica(ruta)) {
          console.log(`OK   cliente ${ruta.padEnd(26)} vocab=${vocabulario.length} [técnica, permitido]`);
        } else {
          console.log(`FAIL cliente ${ruta.padEnd(26)} vocab=${vocabulario.length} [NO PERMITIDO]`);
          for (const x of vocabulario.slice(0, 3)) console.log(`       · …${x.snippet}…`);
        }
      } else {
        console.log(`OK   cliente ${ruta.padEnd(26)} vocab=0`);
      }
    }
    
    // Verificar páginas técnicas
    for (const ruta of EQUIPO) {
      const cuerpo = (await (await req.get(`${BASE}${ruta}`)).text()) + (await (await req.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text());
      const vocabulario = contarVocabulario(cuerpo, excepciones);
      for (const v of vocabulario) hits.push({ ruta, term: v.term, snippet: v.snippet });
      console.log(`OK   cliente ${ruta.padEnd(26)} vocab=${vocabulario.length} [técnica, permitido]`);
    }
    
    await context.close();
  } finally {
    await browser.close();
    servidor.stop();
  }
  
  // Print summary per route (top 10 per route)
  console.log("\n=== VOCABULARY SUMMARY ===");
  const porRuta = agruparVocabPorRuta(hits);
  let totalViolations = 0;
  for (const r of porRuta) {
    console.log(`\n${r.ruta}: ${r.total} hits`);
    for (const [term, count] of r.terms) {
      console.log(`  ${term.padEnd(12)} | ${count}`);
    }
    // Only count as violation if not a technical route
    if (!esRutaTecnica(r.ruta)) totalViolations += r.total;
  }
  console.log(`\nTotal vocab violations (client-facing only): ${totalViolations}`);
  if (totalViolations > 0) process.exit(1);
  console.log("OK: vocabulario permitido solo en rutas técnicas.");
  
} else {
  // Default mode: check for "cliente" word only (like origin/main)
  let totalCliente = 0;
  let fallasCliente = 0;
  
  const browser = await chromium.launch();
  try {
    const anon = await browser.newContext();
    
    // Login sin sesión (anónimo)
    const login = (await (await anon.request.get(`${BASE}/login`)).text()) + (await (await anon.request.get(`${BASE}/login`, { headers: { RSC: "1" } })).text());
    const l = contarCliente(login, excepciones);
    console.log(`${l.length ? "FAIL" : "OK  "} sin sesión  /login                 cliente=${l.length}`);
    if (l.length) fallasCliente++;
    
    await anon.close();
    
    // Solo el rol cliente debe acceder a las páginas de cara al cliente
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}/login`);
    await page.fill("#pin", process.env.PIN_CLIENTE ?? "");
    await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
    const req = context.request;
    
    // Verificar páginas de cara al cliente
    for (const ruta of PAGINAS_CLIENTE) {
      const cuerpo = (await (await req.get(`${BASE}${ruta}`)).text()) + (await (await req.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text());
      const cliente = contarCliente(cuerpo, excepciones);
      if (cliente.length > 0) {
        totalCliente += cliente.length;
        console.log(`FAIL cliente ${ruta.padEnd(26)} cliente=${cliente.length} [NO PERMITIDO]`);
        for (const x of cliente.slice(0, 3)) console.log(`       · …${x}…`);
        fallasCliente++;
      } else {
        console.log(`OK   cliente ${ruta.padEnd(26)} cliente=0`);
      }
    }
    
    // Verificar páginas técnicas
    for (const ruta of EQUIPO) {
      const cuerpo = (await (await req.get(`${BASE}${ruta}`)).text()) + (await (await req.get(`${BASE}${ruta}`, { headers: { RSC: "1" } })).text());
      const cliente = contarCliente(cuerpo, excepciones);
      totalCliente += cliente.length;
      console.log(`OK   cliente ${ruta.padEnd(26)} cliente=${cliente.length} [técnica, permitido]`);
    }
    
    await context.close();
  } finally {
    await browser.close();
    servidor.stop();
  }
  
  console.log(`\nCoincidencias de «cliente» detectadas: ${totalCliente}`);
  if (fallasCliente) process.exit(1);
  console.log("OK: la palabra «cliente» solo aparece en páginas técnicas permitidas.");
}
