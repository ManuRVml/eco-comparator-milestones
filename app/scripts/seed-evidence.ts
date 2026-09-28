import { and, eq, sql } from "drizzle-orm";
import { bitacora, historias, tareas } from "../src/db/schema";
import { cliArgs, openDb } from "./lib/common";
import { estadoDesdeMatriz, leerMatriz } from "./lib/evidence";

/**
 * Estados iniciales desde la matriz de evidencia del código.
 * Solo toca filas cuyo estado_origen sigue en 'plan': nunca pisa lo que un editor ya cambió
 * ni lo que un seed anterior ya fijó.
 */

async function main() {
  const { file, filas: rows } = leerMatriz(cliArgs()[0]);
  const { client, db } = await openDb();
  const stats = { actualizadas: 0, yaGestionadas: 0, noEncontradas: [] as string[], tipoDesconocido: [] as string[] };

  try {
    await db.transaction(async (tx) => {
      for (const r of rows) {
        const id = r.id;
        if (!id) continue;
        const esHu = r.tipo === "HU";
        const esTarea = r.tipo === "Tarea";
        if (!esHu && !esTarea) {
          stats.tipoDesconocido.push(`${id}:${r.tipo}`);
          continue;
        }
        const table = esHu ? historias : tareas;
        const fijo = estadoDesdeMatriz(r, esHu);
        const nuevo = fijo.estado;
        const [actual] = await tx
          .select({ estado: table.estado, origen: table.estadoOrigen })
          .from(table)
          .where(eq(table.id, id));
        if (!actual) {
          stats.noEncontradas.push(id);
          continue;
        }
        const updated = await tx
          .update(table)
          .set({
            ...fijo,
            actualizadoEn: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`,
          })
          .where(and(eq(table.id, id), eq(table.estadoOrigen, "plan")))
          .returning({ id: table.id });
        if (updated.length === 0) {
          stats.yaGestionadas++;
          continue;
        }
        stats.actualizadas++;
        await tx.insert(bitacora).values({
          entidadTipo: esHu ? "historia" : "tarea",
          entidadId: id,
          campo: "estado",
          valorAnterior: actual.estado,
          valorNuevo: nuevo,
          origen: "codigo",
          actorRol: "seed:evidence",
          detalle: [`evidencia=${r.estado}`, r.confianza && `confianza=${r.confianza}`, r.notas].filter(Boolean).join("; "),
        });
      }
    });
  } finally {
    client.close();
  }

  console.log(`Matriz: ${file} (${rows.length} filas)`);
  console.log(`Estados fijados desde código: ${stats.actualizadas}`);
  console.log(`Omitidas (estado_origen distinto de 'plan'): ${stats.yaGestionadas}`);
  if (stats.noEncontradas.length) console.log(`Ids no encontrados en la base: ${stats.noEncontradas.join(", ")}`);
  if (stats.tipoDesconocido.length) console.log(`Tipos desconocidos: ${stats.tipoDesconocido.join(", ")}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});