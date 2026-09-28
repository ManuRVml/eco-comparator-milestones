import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cliArgs, openDb } from "./lib/common";
import { printSummary } from "./lib/importer";
import { importMilestonesWorkbook } from "./lib/milestones-importer";

const DEFAULT_XLSX = resolve(process.cwd(), "..", "data", "milestones_MANUEL.xlsx");
const RIESGOS_CSV = resolve(process.cwd(), "seed", "riesgos.csv");

async function main() {
  const file = resolve(cliArgs()[0] ?? DEFAULT_XLSX);
  const { client, db } = await openDb();
  try {
    printSummary(await importMilestonesWorkbook(db, file, existsSync(RIESGOS_CSV) ? RIESGOS_CSV : null));
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});