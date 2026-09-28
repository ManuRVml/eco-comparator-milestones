import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { cargarTokenDesdeArchivo, loadEnv, openDb } from "./lib/common";

/**
 * db:bootstrap — prepara la base indicada por DATABASE_URL (+ DATABASE_AUTH_TOKEN o DATABASE_AUTH_TOKEN_FILE):
 *   1) migraciones drizzle  2) import del plan (Excel)  3) import de milestones  4) avance y agenda (CSV)
 *   5) estados iniciales desde la matriz de evidencia (capa técnica)  6) nada publicado (avance oficial 0/99)
 * Cada paso es idempotente y no destructivo (UPSERT por id; nunca borra estados, notas ni bitácora).
 * Se ejecuta desde la máquina del dueño: los Excel/CSV nunca se necesitan en runtime.
 *
 *   PLAN_XLSX   (por defecto ../working_plan_BenchHub_v2 2 EQUIPO.xlsx)
 *   MILESTONES_XLSX (por defecto ../data/milestones_MANUEL.xlsx)   DATA_DIR (por defecto ../data)
 */

loadEnv();
cargarTokenDesdeArchivo();
const url = process.env.DATABASE_URL ?? "";
if (!url) {
  console.error("Defina DATABASE_URL (libsql://… o file:…) antes de ejecutar db:bootstrap.");
  process.exit(2);
}
const destino = url.startsWith("file:") ? url : url.replace(/^(\w+:\/\/[^/?]+).*/, "$1");
console.log(`Destino: ${destino}${url.startsWith("file:") ? "" : process.env.DATABASE_AUTH_TOKEN ? " (con token)" : " (SIN token)"}`);

const plan = resolve(process.env.PLAN_XLSX ?? resolve(process.cwd(), "..", "working_plan_BenchHub_v2 2 EQUIPO.xlsx"));
const milestones = resolve(process.env.MILESTONES_XLSX ?? resolve(process.cwd(), "..", "data", "milestones_MANUEL.xlsx"));
const dataDir = resolve(process.env.DATA_DIR ?? resolve(process.cwd(), "..", "data"));
for (const f of [plan, milestones, dataDir]) if (!existsSync(f)) throw new Error(`No existe: ${f}`);

const tsx = resolve(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
const pasos: [string, string[]][] = [
  ["Migraciones", ["scripts/migrate.ts"]],
  ["Plan (sprints, festivos, HU, tareas)", ["scripts/import.ts", plan]],
  ["Milestones, líneas y riesgos", ["scripts/import-milestones.ts", milestones]],
  ["Calendario, días hábiles y agenda", ["scripts/import-progress.ts", dataDir]],
  ["Estados iniciales desde la matriz de evidencia (capa técnica)", ["scripts/seed-evidence.ts"]],
  ["Sin publicaciones iniciales", ["scripts/sin-publicaciones-iniciales.ts"]],
];
for (const [titulo, args] of pasos) {
  console.log(`\n== ${titulo}`);
  execFileSync(process.execPath, [tsx, ...args], { stdio: "inherit", env: process.env });
}

async function conteos() {
  const { client, db } = await openDb();
  try {
    const n = async (q: string) => (await db.all<{ n: number }>(sql.raw(q)))[0].n;
    const c = {
      sprints: await n("select count(*) as n from sprints"),
      festivos: await n("select count(*) as n from festivos"),
      historias: await n("select count(*) as n from historias"),
      tareas: await n("select count(*) as n from tareas"),
      areas: await n("select count(*) as n from areas"),
      lineas: await n("select count(*) as n from lineas"),
      milestones: await n("select count(*) as n from milestones"),
      milestone_historia: await n("select count(*) as n from milestone_historia"),
      milestone_tarea: await n("select count(*) as n from milestone_tarea"),
      riesgos: await n("select count(*) as n from riesgos"),
      calendario: await n("select count(*) as n from calendario"),
      agenda_weekly: await n("select count(*) as n from agenda_weekly"),
      agenda_hu: await n("select count(*) as n from agenda_hu"),
      tareas_publicadas: await n("select count(*) as n from tareas where publicado_cliente = 1"),
      milestones_publicados: await n("select count(*) as n from milestones where estado_origen = 'editor' and estado = 'Cumplido' and fecha_cierre is not null"),
    };
    console.log("\nConteos finales:");
    console.table(c);
    const ok = c.sprints === 7 && c.festivos === 4 && c.historias === 65 && c.tareas === 99 && c.milestones === 10 && c.lineas === 3 && c.milestone_historia === 60;
    console.log(ok ? "OK: 7 sprints / 4 festivos / 65 HU / 99 tareas / 10 milestones / 3 líneas / 60 HU en milestones" : "ATENCIÓN: los conteos no coinciden con lo esperado");
    if (!ok) process.exitCode = 1;
  } finally {
    client.close();
  }
}

conteos().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});