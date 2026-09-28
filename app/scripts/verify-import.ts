import { resolve } from "node:path";
import { eq, isNull, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { areas, bitacora, festivos, historias, notas, sprints, tareas } from "../src/db/schema";
import { cliArgs, openDb, todayIso, useTestDbCopy } from "./lib/common";
import { importWorkbook, printSummary } from "./lib/importer";

/**
 * Prueba de no destrucción: T-010 queda 'Hecha' por un editor, se altera su nombre (columna de plan)
 * y se re-importa. Debe conservar estado/estado_origen/evidencia y recuperar el nombre del Excel.
 */

type Handle = Awaited<ReturnType<typeof openDb>>["db"];
const count = async (db: Handle, table: SQLiteTable) => (await db.select({ n: sql<number>`count(*)` }).from(table))[0].n;

async function main() {
  const [file] = cliArgs();
  if (!file) {
    console.error('Uso: pnpm run verify:import -- "<ruta>\\working_plan.xlsx"');
    process.exit(2);
  }
  useTestDbCopy();
  const { client, db } = await openDb();
  const fail: string[] = [];
  const check = (ok: boolean, msg: string) => {
    console.log(`${ok ? "OK  " : "FAIL"} ${msg}`);
    if (!ok) fail.push(msg);
  };
  const t010 = async () =>
    (
      await db
        .select({
          id: tareas.id,
          nombre: tareas.nombre,
          estado: tareas.estado,
          estado_origen: tareas.estadoOrigen,
          fecha_estado: tareas.fechaEstado,
          evidencia: tareas.evidencia,
          area_id: tareas.areaId,
        })
        .from(tareas)
        .where(eq(tareas.id, "T-010"))
    )[0];

  try {
    const counts = {
      sprints: await count(db, sprints),
      festivos: await count(db, festivos),
      historias: await count(db, historias),
      tareas: await count(db, tareas),
      areas: await count(db, areas),
    };
    console.log("Conteos:", counts);
    check(counts.sprints === 7, "7 sprints");
    check(counts.festivos === 4, "4 festivos");
    check(counts.historias === 65, "65 HU");
    check(counts.tareas === 99, "99 tareas");
    check(counts.areas === 7, "7 áreas");
    const sinArea = (await db.select({ n: sql<number>`count(*)` }).from(tareas).where(isNull(tareas.areaId)))[0].n;
    const areaInvalida = (
      await db.all<{ n: number }>(sql`select count(*) as n from tareas where area_id not in (select id from areas)`)
    )[0].n;
    check(sinArea === 0 && areaInvalida === 0, `tareas sin área válida: ${sinArea + areaInvalida}`);

    const evidencia = "Verificado por editor en la app (prueba de re-import)";
    await db
      .update(tareas)
      .set({ estado: "Hecha", estadoOrigen: "editor", fechaEstado: todayIso(), fechaCierre: todayIso(), evidencia, nombre: "NOMBRE ALTERADO" })
      .where(eq(tareas.id, "T-010"));
    const pubs = async () =>
      JSON.stringify(
        await db
          .select({ id: tareas.id, p: tareas.publicadoCliente, f: tareas.fechaPublicacion, n: tareas.notaPublicacion })
          .from(tareas)
          .where(eq(tareas.publicadoCliente, true))
          .orderBy(tareas.id),
      );
    // Nada empieza publicado: la prueba publica T-010 en la copia para comprobar que el re-import no lo toca.
    await db.update(tareas).set({ publicadoCliente: true, fechaPublicacion: todayIso(), notaPublicacion: "Demostrado en weekly (prueba de re-import)" }).where(eq(tareas.id, "T-010"));
    const pubsAntes = await pubs();
    const notasAntes = await count(db, notas);
    const bitacoraAntes = await count(db, bitacora);
    console.log("T-010 ANTES del re-import:", await t010());

    printSummary(await importWorkbook(db, resolve(file)));

    const after = await t010();
    console.log("T-010 DESPUÉS del re-import:", after);
    check(after.estado === "Hecha", "estado sigue 'Hecha'");
    check(after.estado_origen === "editor", "estado_origen sigue 'editor'");
    check(after.evidencia === evidencia, "evidencia intacta");
    check(after.nombre === "Construir pantalla de Login UI", "nombre (columna de plan) restaurado desde el Excel");
    check((await count(db, notas)) === notasAntes, "notas intactas");
    const pubsDespues = await pubs();
    check(pubsAntes === pubsDespues && JSON.parse(pubsAntes).length > 0, `publicaciones intactas tras el re-import: ${JSON.parse(pubsDespues).map((x: { id: string }) => x.id).join(", ")}`);
    check((await count(db, bitacora)) === bitacoraAntes, "bitácora intacta");
  } finally {
    client.close();
  }
  if (fail.length) {
    console.error(`\n${fail.length} verificaciones fallaron`);
    process.exit(1);
  }
  console.log("\nTodas las verificaciones pasaron.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});