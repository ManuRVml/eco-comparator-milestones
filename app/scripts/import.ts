import { resolve } from "node:path";
import { cliArgs, openDb } from "./lib/common";
import { importWorkbook, printSummary } from "./lib/importer";

async function main() {
  const [file] = cliArgs();
  if (!file) {
    console.error('Uso: pnpm run import -- "<ruta>\\working_plan.xlsx"');
    process.exit(2);
  }
  const { client, db } = await openDb();
  try {
    printSummary(await importWorkbook(db, resolve(file)));
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});