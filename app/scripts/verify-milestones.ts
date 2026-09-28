import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { loadRaw } from "../src/lib/load";
import { computeModel } from "../src/lib/model";
import { cliArgs, openDb, useTestDbCopy } from "./lib/common";
import { fold, printSummary } from "./lib/importer";
import { importMilestonesWorkbook } from "./lib/milestones-importer";

/**
 * Verifica el import de milestones_MANUEL.xlsx y de los CSV de avance/agenda:
 * - conteos (10 milestones, 3 líneas, 60 vínculos HU, 99 vínculos de tarea);
 * - re-import no destructivo (0 insertadas, sin conflictos, estado de app intacto);
 * - avance planificado vs. real recalculado en vivo = línea base de avance_area.csv al corte 2026-09-28.
 */

const CORTE = "2026-09-28";
const DEFAULT_XLSX = resolve(process.cwd(), "..", "data", "milestones_MANUEL.xlsx");

async function main() {
  const file = resolve(cliArgs()[0] ?? DEFAULT_XLSX);
  useTestDbCopy();
  const { client, db } = await openDb();
  const fail: string[] = [];
  const check = (ok: boolean, msg: string) => {
    console.log(`${ok ? "OK  " : "FAIL"} ${msg}`);
    if (!ok) fail.push(msg);
  };
  const n = async (table: string) => (await db.all<{ n: number }>(sql.raw(`select count(*) as n from "${table}"`)))[0].n;

  try {
    const counts = {
      milestones: await n("milestones"),
      lineas: await n("lineas"),
      milestone_historia: await n("milestone_historia"),
      milestone_tarea: await n("milestone_tarea"),
      milestone_dependencia: await n("milestone_dependencia"),
      milestone_riesgo: await n("milestone_riesgo"),
      riesgos: await n("riesgos"),
      calendario: await n("calendario"),
      agenda_weekly: await n("agenda_weekly"),
      agenda_hu: await n("agenda_hu"),
      areas: await n("areas"),
    };
    console.log("Conteos:", counts);
    check(counts.milestones === 10, "10 milestones");
    check(counts.lineas === 3, "3 líneas");
    check(counts.milestone_historia === 60, "60 vínculos milestone→HU");
    check(counts.milestone_tarea === 99, "99 vínculos milestone→tarea (cada tarea en un milestone)");
    check(counts.areas === 7, "7 áreas (Tabla_Areas no crea ids nuevos)");
    check(counts.agenda_weekly === 5 && counts.agenda_hu === 60, "agenda: 5 weeklies y 60 HU");
    const sinDias = (await db.all<{ n: number }>(sql`select count(*) as n from tareas where dias_habiles is null`))[0].n;
    check(sinDias === 0, `tareas sin días hábiles: ${sinDias}`);

    const antes = await db.all<{ id: string; estado: string; origen: string; visible: number }>(
      sql`select id, estado, estado_origen as origen, visible_cliente as visible from milestones order by id`,
    );
    const again = await importMilestonesWorkbook(db, file, resolve(process.cwd(), "seed", "riesgos.csv"));
    printSummary(again);
    check(again.tablas.every((t) => t.insertadas === 0), "re-import: 0 filas insertadas");
    check(again.conflictos.length === 0, "re-import: sin conflictos");
    const despues = await db.all<{ id: string; estado: string; origen: string; visible: number }>(
      sql`select id, estado, estado_origen as origen, visible_cliente as visible from milestones order by id`,
    );
    check(JSON.stringify(antes) === JSON.stringify(despues), "re-import: estado/origen/visibilidad de milestones intactos");

    const model = computeModel(await loadRaw(db), CORTE);
    const raw = await loadRaw(db);
    const areaNombre = new Map(raw.areas.map((a) => [a.id, a.nombre]));
    console.log(`\nAvance en vivo al ${CORTE} (planificado vs. real ponderado por días hábiles):`);
    console.table(
      model.areaResumen.map((a) => ({
        area: areaNombre.get(a.areaId),
        tareas: a.total,
        hechas: a.hechas,
        dias: a.dias,
        diasHechos: a.diasHechos,
        planificado: a.pctPlan.toFixed(2),
        real: a.pctReal.toFixed(2),
      })),
    );
    const t = model.total;
    console.log(`TOTAL: ${t.hechas}/${t.total} tareas Hecha · planificado ${t.pctPlan.toFixed(2)}% · real ${t.pctReal.toFixed(2)}%`);
    const baseTotal = raw.base.find((b) => b.area === "TOTAL");
    check(!!baseTotal && t.pctPlan.toFixed(2) === baseTotal.pctPlanificado.toFixed(2), `planificado total = línea base (${baseTotal?.pctPlanificado.toFixed(2)}%)`);
    check(!!baseTotal && t.pctReal.toFixed(2) === baseTotal.pctReal.toFixed(2), `real total = línea base (${baseTotal?.pctReal.toFixed(2)}%)`);
    const alias: Record<string, string> = { qa: "qa", infraestructura: "infra", gestion: "gestion" };
    for (const b of raw.base.filter((x) => x.area !== "TOTAL")) {
      const id = alias[fold(b.area)] ?? raw.areas.find((a) => fold(a.nombre) === fold(b.area))?.id;
      const live = model.areaResumen.find((a) => a.areaId === id);
      check(
        !!live && live.pctReal.toFixed(2) === b.pctReal.toFixed(2) && live.pctPlan.toFixed(2) === b.pctPlanificado.toFixed(2),
        `${b.area}: plan ${live?.pctPlan.toFixed(2)} / real ${live?.pctReal.toFixed(2)} = base ${b.pctPlanificado.toFixed(2)} / ${b.pctReal.toFixed(2)}`,
      );
    }
    const m01 = model.milestoneById.get("M-01");
    check(!!m01 && m01.tareasHechas === 5 && m01.tareasTotal === 20, `M-01 avance por código ${m01?.tareasHechas}/${m01?.tareasTotal} (Excel: 25 %)`);
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