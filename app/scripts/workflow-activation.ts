import { eq } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { bitacora, lotesReconciliacion } from "../src/db/schema";
import { cliArgs } from "./lib/common";

async function main() {
  const args = cliArgs(), i = args.indexOf("--database"), file = args[i + 1], l = args.indexOf("--lote"), id = args[l + 1];
  if (i < 0 || !file || l < 0 || !id || (!args.includes("--activate") && !args.includes("--deactivate"))) throw new Error("Uso: --database <archivo.db> --lote <id> --activate|--deactivate");
  if (args.includes("--activate") && args.includes("--deactivate")) throw new Error("Elija una sola operación");
  if (/^(?:https?|libsql):/.test(file)) throw new Error("Este comando se limita a bases locales explícitas");
  const { resolve } = await import("node:path"), { client, db } = createDb(`file:${resolve(file)}`);
  try {
    await db.transaction(async (tx) => {
      const [lote] = await tx.select().from(lotesReconciliacion).where(eq(lotesReconciliacion.id, id));
      if (!lote) throw new Error("Lote no encontrado");
      const activo = args.includes("--activate");
      if (lote.activo === activo) return;
      await tx.update(lotesReconciliacion).set({ activo }).where(eq(lotesReconciliacion.id, id));
      await tx.insert(bitacora).values({ entidadTipo: "config", entidadId: id, campo: "reconciliacion:activo", valorAnterior: String(lote.activo), valorNuevo: String(activo), origen: "editor", actorRol: "admin", detalle: "Cambio de activación; se conservan notas, actualizaciones y todo el historial" });
    });
    console.log("Activación actualizada; ningún registro fue eliminado");
  } finally { client.close(); }
}
main().catch((e) => { console.error(e instanceof Error ? e.message : "Error de activación"); process.exitCode = 1; });
