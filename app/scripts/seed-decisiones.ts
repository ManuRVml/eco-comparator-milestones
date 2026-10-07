import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { decisionesPendientes } from "../src/db/schema";
import { openDb, parseCsv } from "./lib/common";
import { upsertById, printSummary, type ImportSummary } from "./lib/importer";

/**
 * Decisiones que el cliente debe tomar (CTX: riesgos R-xx y supuestos S-xx), versionadas en seed/decisiones.csv.
 * Entran como borrador. UPSERT por id: las columnas de app (resuelta, borrador) se inicializan al insertar y nunca se actualizan.
 */
const CSV = resolve(process.cwd(), "seed", "decisiones.csv");

async function main() {
  const { client, db } = await openDb();
  try {
    const rows = parseCsv(readFileSync(CSV, "utf8")).map((r) => ({
      id: r.id, milestoneId: r.milestone_id, texto: r.texto, responsableCliente: r.responsable_cliente ?? "", fechaLimite: r.fecha_limite ?? "", resuelta: false, borrador: true,
    }));
    const summary: ImportSummary = { archivo: CSV, tablas: [], conflictos: [], avisos: [] };
    await db.transaction(async (tx) => {
      await upsertById(tx, decisionesPendientes, { key: "id", column: "id" }, rows, summary, { insertOnly: ["resuelta", "borrador"] });
    });
    printSummary(summary);
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
