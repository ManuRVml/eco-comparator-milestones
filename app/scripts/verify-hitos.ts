import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createClient } from "@libsql/client";
import { cliArgs, TEST_DB_FILE } from "./lib/common";

/**
 * Informe (solo lectura) 7 hitos del contexto (seed/ctx-hitos.json) vs. los milestones M-xx de la base.
 * Trabaja sobre una COPIA temporal de data/seguimiento.test.db (o la ruta del primer argumento): no escribe nada.
 * Siempre termina con exit 0: es un reporte, no una puerta.
 */

type Hito = {
  id: string;
  nombre_tecnico: string;
  fecha: string;
  sprint: string;
  tareas: string[];
  hu: string[];
  hu_por_tareas: string[];
};
type Ms = { id: string; nombre: string; fecha: string | null };

const R2 = ["HU-007", "HU-009", "HU-011", "HU-034", "HU-038"];
const DAY = 86_400_000;
const dias = (a: string, b: string) =>
  Math.round((Date.parse(a) - Date.parse(b)) / DAY);
const lista = (xs: string[]) => (xs.length ? xs.join(",") : "-");
const sinEn = (a: string[], b: Set<string>) =>
  a.filter((x) => !b.has(x)).sort();

async function main() {
  const src = resolve(cliArgs()[0] ?? resolve(process.cwd(), TEST_DB_FILE));
  if (!existsSync(src))
    throw new Error(
      `No existe la base ${src} (pasa la ruta de seguimiento.test.db como argumento)`,
    );
  const dir = mkdtempSync(join(tmpdir(), "verify-hitos-"));
  const copia = join(dir, "copia.db");
  copyFileSync(src, copia);
  const client = createClient({ url: `file:${copia.replaceAll("\\", "/")}` });

  try {
    const hitos = (
      JSON.parse(
        readFileSync(resolve(process.cwd(), "seed", "ctx-hitos.json"), "utf8"),
      ) as { hitos: Hito[] }
    ).hitos;
    const all = async <T>(sql: string) =>
      (await client.execute(sql)).rows as unknown as T[];
    const ms = await all<Ms>(
      "select id, nombre, fecha_objetivo as fecha from milestones order by orden, id",
    );
    const mHu = new Map<string, Set<string>>();
    for (const r of await all<{ m: string; h: string }>(
      "select milestone_id as m, historia_id as h from milestone_historia",
    ))
      (mHu.get(r.m) ?? mHu.set(r.m, new Set()).get(r.m)!).add(r.h);
    const mTarea = new Map<string, Set<string>>();
    for (const r of await all<{ m: string; t: string }>(
      "select milestone_id as m, tarea_id as t from milestone_tarea",
    ))
      (mTarea.get(r.m) ?? mTarea.set(r.m, new Set()).get(r.m)!).add(r.t);

    console.log(
      `Base: copia temporal de ${src} (solo lectura; ${ms.length} milestones)\n`,
    );

    const usados = new Map<string, string>();
    const filas = hitos.map((h) => {
      // M-xx = el milestone que contiene más tareas del hito; sin tareas en común, el de fecha más cercana.
      const score = (m: Ms) =>
        h.tareas.filter((t) => mTarea.get(m.id)?.has(t)).length;
      const cerca = (m: Ms) =>
        m.fecha ? Math.abs(dias(m.fecha, h.fecha)) : Infinity;
      const best = [...ms].sort(
        (a, b) => score(b) - score(a) || cerca(a) - cerca(b),
      )[0];
      const m =
        best && (score(best) > 0 || cerca(best) <= 7) ? best : undefined;
      if (m)
        usados.set(
          m.id,
          `${usados.get(m.id) ?? ""}${usados.has(m.id) ? "+" : ""}${h.id}`,
        );
      const enM = mHu.get(m?.id ?? "") ?? new Set<string>();
      const enH = new Set(h.hu);
      return {
        hito: `${h.id} ${h.nombre_tecnico}`,
        "M-xx": m
          ? `${m.id} (${score(m)}/${h.tareas.length} tareas)`
          : "(sin M)",
        "fecha hito": h.fecha,
        "fecha M": m?.fecha ?? "-",
        "delta dias": m?.fecha ? dias(m.fecha, h.fecha) : "-",
        "HU en hito, no en M": lista(sinEn(h.hu, enM)),
        "HU en M, no en hito": lista(sinEn([...enM], enH)),
      };
    });
    console.log(
      "hito | M-xx mapeado | delta de fecha (M - hito, dias) | HU del hito que faltan en M | HU de M que no estan en el hito",
    );
    console.table(filas);

    const sinHito = ms.filter((m) => !usados.has(m.id));
    console.log(
      `Milestones M-xx sin hito: ${sinHito.length ? sinHito.map((m) => `${m.id} ${m.nombre} (${m.fecha ?? "sin fecha"})`).join("; ") : "ninguno"}`,
    );
    console.log(`Hitos ${hitos.length} vs milestones ${ms.length}.\n`);

    const todasM = new Set([...mHu.values()].flatMap((s) => [...s]));
    const todasH = new Set(hitos.flatMap((h) => h.hu));
    console.log(
      "R2 (HU-007/009/011/034/038 no deben estar en ningun milestone ni hito):",
    );
    for (const hu of R2) {
      const enM = [...mHu].filter(([, s]) => s.has(hu)).map(([id]) => id);
      const ok = !todasM.has(hu) && !todasH.has(hu);
      console.log(
        `${ok ? "OK  " : "FAIL"} ${hu}: milestones=${lista(enM)} hitos=${todasH.has(hu) ? "si" : "no"}`,
      );
    }
  } finally {
    client.close();
    try {
      rmSync(dir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100,
      });
    } catch {
      /* Windows puede retener el archivo unos instantes: es una copia temporal, no importa */
    }
  }
}

main().catch((e) =>
  console.error(
    "verify:hitos no pudo completarse:",
    e instanceof Error ? e.message : e,
  ),
);
