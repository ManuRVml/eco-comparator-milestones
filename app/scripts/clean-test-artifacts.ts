import { eq, inArray, sql } from "drizzle-orm";
import { bitacora, historias, notas, tareas } from "../src/db/schema";
import { openDb } from "./lib/common";
import { estadoDesdeMatriz, leerMatriz } from "./lib/evidence";

/**
 * Limpia de la base VIVA los restos de pruebas anteriores al aislamiento (verify:import y check:edit
 * escribían en data/seguimiento.db):
 * - notas de prueba (texto con "E2E" o "prueba de re-import") → se borran;
 * - filas de bitácora de esas pruebas (y todas las de origen editor sobre las entidades afectadas) → se borran;
 * - tareas/HU tocadas por las pruebas con estado_origen = 'editor' → vuelven a estado, estado_origen y
 *   evidencia de matriz_evidencia.csv (mismos valores que pnpm run seed:evidence).
 * Idempotente: una segunda ejecución no cambia nada.
 */

const PRUEBA = /prueba de re-import|\bE2E\b/i;
const esPrueba = (...v: (string | null)[]) => v.some((x) => !!x && PRUEBA.test(x));

async function main() {
  const { porId, file } = leerMatriz();
  const { client, db } = await openDb();
  const url = process.env.DATABASE_URL ?? "file:./data/seguimiento.db";
  console.log(`Base: ${url}\nMatriz: ${file}`);
  let cambios = 0;
  try {
    await db.transaction(async (tx) => {
      const todasNotas = await tx.select().from(notas);
      const notasPrueba = todasNotas.filter((n) => esPrueba(n.texto));
      const idsNotas = new Set(notasPrueba.map((n) => String(n.id)));
      const log = await tx.select().from(bitacora);
      const objetivos = new Set<string>();
      for (const n of notasPrueba) objetivos.add(`${n.entidadTipo}:${n.entidadId}`);
      for (const b of log) if ((b.entidadTipo === "tarea" || b.entidadTipo === "historia") && esPrueba(b.valorAnterior, b.valorNuevo, b.detalle)) objetivos.add(`${b.entidadTipo}:${b.entidadId}`);
      for (const t of await tx.select({ id: tareas.id, ev: tareas.evidencia }).from(tareas)) if (esPrueba(t.ev)) objetivos.add(`tarea:${t.id}`);
      for (const h of await tx.select({ id: historias.id, ev: historias.evidencia }).from(historias)) if (esPrueba(h.ev)) objetivos.add(`historia:${h.id}`);

      const filasLog = log.filter(
        (b) =>
          esPrueba(b.valorAnterior, b.valorNuevo, b.detalle) ||
          (b.entidadTipo === "nota" && idsNotas.has(b.entidadId)) ||
          (b.origen === "editor" && objetivos.has(`${b.entidadTipo}:${b.entidadId}`)),
      );
      if (filasLog.length) {
        await tx.delete(bitacora).where(inArray(bitacora.id, filasLog.map((b) => b.id)));
        console.log(`Bitácora: ${filasLog.length} filas de prueba eliminadas`);
        for (const b of filasLog) console.log(`  - #${b.id} ${b.entidadTipo} ${b.entidadId} · ${b.campo}: ${(b.valorAnterior ?? "—").slice(0, 40)} → ${(b.valorNuevo ?? "—").slice(0, 40)}`);
        cambios += filasLog.length;
      }
      if (notasPrueba.length) {
        await tx.delete(notas).where(inArray(notas.id, notasPrueba.map((n) => n.id)));
        console.log(`Notas: ${notasPrueba.length} notas de prueba eliminadas`);
        for (const n of notasPrueba) console.log(`  - nota #${n.id} en ${n.entidadTipo} ${n.entidadId}: ${n.texto.slice(0, 60)}`);
        cambios += notasPrueba.length;
      }

      for (const clave of [...objetivos].sort()) {
        const [tipo, id] = clave.split(":");
        const esHu = tipo === "historia";
        const table = esHu ? historias : tareas;
        const [actual] = await tx
          .select({ estado: table.estado, origen: table.estadoOrigen, evidencia: table.evidencia })
          .from(table)
          .where(eq(table.id, id));
        const fila = porId.get(id);
        if (!actual || !fila) continue;
        const fijo = estadoDesdeMatriz(fila, esHu);
        if (actual.origen === fijo.estadoOrigen && actual.estado === fijo.estado && actual.evidencia === fijo.evidencia) continue;
        await tx
          .update(table)
          .set({ ...fijo, actualizadoEn: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))` })
          .where(eq(table.id, id));
        console.log(
          `${tipo} ${id}: estado ${actual.estado} → ${fijo.estado}; origen ${actual.origen} → ${fijo.estadoOrigen}; evidencia "${(actual.evidencia ?? "—").slice(0, 45)}" → "${(fijo.evidencia ?? "—").slice(0, 45)}"`,
        );
        cambios++;
      }
    });
  } finally {
    client.close();
  }
  console.log(cambios ? `\n${cambios} cambios aplicados.` : "\nSin restos de pruebas: nada que limpiar.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});