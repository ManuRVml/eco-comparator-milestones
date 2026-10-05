// Copia consistente de SQLite, incluso si hay WAL. Los respaldos quedan fuera de Git.
import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const args = process.argv.slice(2).filter((a) => a !== "--");
const index = args.indexOf("--database");
if (index < 0 || !args[index + 1]) throw new Error("Indique --database <archivo.db>");
const source = resolve(args[index + 1]);
if (/^(?:https?|libsql):/.test(args[index + 1])) throw new Error("Use una copia local consistente para este procedimiento");
const folder = resolve("data/reconciliation"); mkdirSync(folder, { recursive: true });
const target = resolve(folder, `backup-${Date.now()}.db`);
const db = new DatabaseSync(source, { readOnly: true });
function inventory(conn) {
  return Object.fromEntries(conn.prepare("select name from sqlite_master where type='table' and name not like 'sqlite_%' order by name").all().map(({ name }) => {
    const rows = conn.prepare(`select * from "${name}" order by rowid`).all();
    const json = JSON.stringify(rows, (_, value) => typeof value === "bigint" ? value.toString() : value);
    return [name, { count: rows.length, sha256: createHash("sha256").update(json).digest("hex") }];
  }));
}
try {
  await backup(db, target);
  const restored = new DatabaseSync(target, { readOnly: true });
  try {
    const before = inventory(db), after = inventory(restored);
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error("La base cambió durante la verificación. Repita el respaldo en una ventana sin escrituras");
    if (restored.prepare("pragma integrity_check").get().integrity_check !== "ok") throw new Error("La copia no pasa integridad");
    writeFileSync(`${target}.inventory.json`, JSON.stringify({ source, backup: target, verified: true, tables: after }, null, 2) + "\n");
    console.log(`Respaldo consistente y restauración verificada: ${target}`);
  } finally { restored.close(); }
} finally { db.close(); }
