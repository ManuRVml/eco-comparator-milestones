import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb } from "../src/db/client";
import { cliArgs } from "./lib/common";
import { aplicarReconciliacion, simularReconciliacion } from "./lib/reconciliation";
import type { Bundle } from "./lib/reconciliation-sources";

async function main() {
  const args = cliArgs(), index = args.indexOf("--database"), file = args[index + 1];
  if (index < 0 || !file || file.startsWith("--")) throw new Error("Indique --database <copia.db>. Por defecto se simula; --apply aplica sobre ese archivo explícito.");
  if (/^(?:https?|libsql):/.test(file)) throw new Error("Este comando opera sobre una copia local. La activación remota debe seguir el procedimiento documentado de respaldo y despliegue.");
  const { client, db } = createDb(`file:${resolve(file)}`);
  try {
    const bundle = JSON.parse(readFileSync(resolve("seed/reconciliation.json"), "utf8")) as Bundle;
    const result = args.includes("--apply") ? (await migrate(db, { migrationsFolder: resolve("drizzle") }), await aplicarReconciliacion(db, bundle)) : await simularReconciliacion(db, bundle);
    const outIndex = args.indexOf("--report");
    if (outIndex >= 0) writeFileSync(resolve(args[outIndex + 1]), JSON.stringify(result, null, 2) + "\n");
    const sim = "simulation" in result ? result.simulation : result;
    console.log(JSON.stringify({ modo: args.includes("--apply") ? "aplicar" : "simular", tareasConservadas: sim.tareasActuales, tareasFuente: sim.tareasFuente, vinculadas: sim.correspondencias.filter((r) => r.tareaId).length, pendientes: sim.correspondencias.filter((r) => !r.tareaId).length, actividadesMvpSinAsignar: sim.prerrequisitosSinAsignar, cambiosEstados: 0, cambiosPublicaciones: 0, ...( "aplicado" in result ? { aplicado: result.aplicado } : {}) }, null, 2));
  } finally { client.close(); }
}
main().catch((e) => { console.error(e instanceof Error ? e.message : "Error de reconciliación"); process.exitCode = 1; });
