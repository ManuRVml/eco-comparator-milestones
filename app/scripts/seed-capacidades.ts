import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { capacidadHistoria, capacidades } from "../src/db/schema";
import {
  openDb,
  parseCsv,
  useTestDbCopy as copiarBasePrueba,
} from "./lib/common";
import { upsertById, printSummary, type ImportSummary } from "./lib/importer";

/**
 * Capacidades por milestone (qué podrá hacer el usuario), versionadas en seed/capacidades.csv. Entran como borrador.
 * UPSERT por id: `borrador` se inicializa al insertar y nunca se actualiza. Los vínculos HU se agregan sin duplicar.
 * Valida antes de escribir: cada HU MVP en exactamente una capacidad de su milestone, máx. 8 por milestone, título ≤ 8 palabras y sin jerga.
 * Con --copia trabaja sobre una copia fresca de data/seguimiento.test.db (nunca toca la base viva).
 */
const CSV = resolve(process.cwd(), "seed", "capacidades.csv");
const JERGA = /\b(HU|SP|sprint|épica|epica|feature|backlog|BFF|RBAC|KVI)\b/i;

async function main() {
  if (process.argv.includes("--copia")) copiarBasePrueba();
  const { client, db } = await openDb();
  try {
    const csv = parseCsv(readFileSync(CSV, "utf8"));
    const rows = csv.map((r) => ({
      id: r.id,
      milestoneId: r.milestone_id,
      titulo: r.titulo,
      descripcion: r.descripcion,
      orden: Number(r.orden),
      borrador: true,
    }));
    const links = csv.flatMap((r) =>
      r.historias
        .split(";")
        .map((h) => ({ capacidadId: r.id, historiaId: h.trim() })),
    );

    const errores: string[] = [];
    const mvp = (
      await db.all<{ id: string }>(
        sql`select id from historias where prioridad != 'R2'`,
      )
    ).map((h) => h.id);
    const msDeHu = new Map(
      (
        await db.all<{ h: string; m: string }>(
          sql`select historia_id as h, milestone_id as m from milestone_historia`,
        )
      ).map((r) => [r.h, r.m]),
    );
    const msDeCap = new Map(rows.map((r) => [r.id, r.milestoneId]));
    const veces = new Map<string, number>();
    for (const l of links) {
      veces.set(l.historiaId, (veces.get(l.historiaId) ?? 0) + 1);
      if (msDeHu.get(l.historiaId) !== msDeCap.get(l.capacidadId))
        errores.push(
          `${l.historiaId} está en ${l.capacidadId} (${msDeCap.get(l.capacidadId)}) pero su milestone es ${msDeHu.get(l.historiaId) ?? "ninguno"}`,
        );
    }
    for (const id of mvp)
      if (veces.get(id) !== 1)
        errores.push(`${id} aparece ${veces.get(id) ?? 0} veces (debe ser 1)`);
    for (const id of veces.keys())
      if (!mvp.includes(id)) errores.push(`${id} no es una HU MVP`);
    const porMs = new Map<string, number>();
    for (const r of rows) {
      porMs.set(r.milestoneId, (porMs.get(r.milestoneId) ?? 0) + 1);
      if (r.titulo.split(/\s+/).length > 8)
        errores.push(`${r.id}: título de más de 8 palabras`);
      if (JERGA.test(r.titulo) || /\bHU-\d+/.test(r.descripcion))
        errores.push(`${r.id}: jerga en título o descripción`);
    }
    for (const [m, n] of porMs)
      if (n > 8) errores.push(`${m}: ${n} capacidades (máx. 8)`);
    if (errores.length)
      throw new Error(`capacidades.csv inválido:\n- ${errores.join("\n- ")}`);

    const summary: ImportSummary = {
      archivo: CSV,
      tablas: [],
      conflictos: [],
      avisos: [],
    };
    await db.transaction(async (tx) => {
      await upsertById(
        tx,
        capacidades,
        { key: "id", column: "id" },
        rows,
        summary,
        { insertOnly: ["borrador"] },
      );
      await tx.insert(capacidadHistoria).values(links).onConflictDoNothing();
    });
    printSummary(summary);

    const res = await db.all<{
      m: string;
      id: string;
      titulo: string;
      hus: string;
    }>(sql`
      select c.milestone_id as m, c.id, c.titulo, group_concat(ch.historia_id, ',') as hus
      from capacidades c join capacidad_historia ch on ch.capacidad_id = c.id
      group by c.id order by c.milestone_id, c.orden`);
    let actual = "";
    for (const r of res) {
      if (r.m !== actual)
        console.log(`\n${(actual = r.m)} (${porMs.get(r.m)} capacidades)`);
      console.log(`  ${r.id} ${r.titulo}  [${r.hus}]`);
    }
    const n = (
      await db.all<{ n: number }>(
        sql`select count(*) as n from capacidad_historia`,
      )
    )[0].n;
    console.log(`\nVínculos capacidad→HU: ${n} (HU MVP: ${mvp.length})`);
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
