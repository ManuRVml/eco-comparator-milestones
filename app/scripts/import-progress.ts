import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { agendaHu, agendaWeekly, avanceAreaBase, calendario, historias, tareas } from "../src/db/schema";
import { cliArgs, openDb, parseCsv } from "./lib/common";
import { type ImportSummary, printSummary, upsertById } from "./lib/importer";

/**
 * Carga a SQLite los CSV de avance y agenda (la app nunca lee CSV en runtime):
 *   progress/calendario_habil.csv, progress/tareas_dias.csv, progress/avance_area.csv,
 *   agenda/agenda_weekly.csv, agenda/agenda_hu.csv
 * Uso: pnpm run import:progress [-- <carpeta data>]   (por defecto ../data)
 * No destructivo: upsert por clave; nunca toca estados, notas ni bitácora.
 */

const DEFAULT_DIR = resolve(process.cwd(), "..", "data");

function csv(dir: string, rel: string) {
  return parseCsv(readFileSync(resolve(dir, rel), "utf8"));
}

async function main() {
  const dir = resolve(cliArgs()[0] ?? DEFAULT_DIR);
  const { client, db } = await openDb();
  const summary: ImportSummary = { archivo: dir, tablas: [], conflictos: [], avisos: [] };

  const cal = csv(dir, "progress/calendario_habil.csv").map((r) => ({
    fecha: r.fecha,
    diaSemana: r.dia_semana || null,
    esHabil: r.es_habil === "1",
    sprintId: r.sprint || null,
    esJueves: r.es_jueves === "1",
  }));
  const dias = csv(dir, "progress/tareas_dias.csv");
  const base = csv(dir, "progress/avance_area.csv").map((r) => ({
    area: r.area,
    tareasTotal: Number(r.tareas_total),
    tareasPlanificadasHoy: Number(r.tareas_planificadas_a_hoy),
    tareasHechas: Number(r.tareas_hechas),
    tareasParciales: Number(r.tareas_parciales),
    diasHabilesTotal: Number(r.dias_habiles_total),
    diasHabilesHechos: Number(r.dias_habiles_hechos),
    pctPlanificado: Number(r.pct_planificado_a_hoy),
    pctReal: Number(r.pct_real),
    brecha: Number(r.brecha),
  }));
  const weekly = csv(dir, "agenda/agenda_weekly.csv").map((r) => ({
    fecha: r.fecha_weekly,
    nHu: Number(r.n_hu),
    spTotal: Number(r.sp_total),
    epicas: r.epicas || null,
  }));
  const huIds = new Set((await db.select({ id: historias.id }).from(historias)).map((h) => h.id));
  const agenda = csv(dir, "agenda/agenda_hu.csv")
    .filter((r) => {
      if (huIds.has(r.HU_ID)) return true;
      summary.avisos.push(`agenda_hu: ${r.HU_ID} no existe en historias; se ignora`);
      return false;
    })
    .map((r) => ({ historiaId: r.HU_ID, fechaWeekly: r.fecha_weekly, estadoEvidencia: r.estado_evidencia || null }));

  try {
    await db.transaction(async (tx) => {
      await upsertById(tx, calendario, { key: "fecha", column: "fecha" }, cal, summary);
      await upsertById(tx, avanceAreaBase, { key: "area", column: "area" }, base, summary);
      await upsertById(tx, agendaWeekly, { key: "fecha", column: "fecha" }, weekly, summary);
      await upsertById(tx, agendaHu, { key: "historiaId", column: "historia_id" }, agenda, summary);
      let actualizadas = 0;
      for (const r of dias) {
        const res = await tx
          .update(tareas)
          .set({ diasHabiles: Number(r.dias_habiles) })
          .where(eq(tareas.id, r.id))
          .returning({ id: tareas.id });
        if (res.length) actualizadas++;
        else summary.avisos.push(`tareas_dias: ${r.id} no existe en tareas; se ignora`);
      }
      summary.tablas.push({ tabla: "tareas.dias_habiles", enArchivo: dias.length, insertadas: 0, actualizadas });
    });
  } finally {
    client.close();
  }
  printSummary(summary);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});