import { readFileSync } from "node:fs";
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable, SQLiteUpdateSetSource } from "drizzle-orm/sqlite-core";
import * as XLSX from "xlsx";
import type { Db } from "../../src/db/client";
import { normalizarIdentidad } from "../../src/lib/workflow/domain";
import {
  areas,
  festivos,
  historias,
  lineas,
  milestoneHistoria,
  milestones,
  milestoneTarea,
  sprints,
  tareaPredecesora,
  tareas,
} from "../../src/db/schema";

export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type Row = Record<string, unknown>;

/** Columnas gestionadas por la app: el import JAMÁS las incluye en el SET del upsert. */
export const APP_COLUMNS = new Set([
  "estado",
  "estado_origen",
  "visible_cliente",
  "fecha_estado",
  "evidencia",
  "fecha_cierre",
  "creado_en",
  "interno",
  "publicado_cliente",
  "fecha_publicacion",
  "nota_publicacion",
]);

export const AREAS_SEED = [
  { id: "backend", nombre: "Backend", orden: 1 },
  { id: "frontend", nombre: "Frontend", orden: 2 },
  { id: "datos", nombre: "Datos", orden: 3 },
  { id: "qa", nombre: "Calidad (QA)", orden: 4 },
  { id: "infra", nombre: "Infraestructura", orden: 5 },
  { id: "arquitectura", nombre: "Arquitectura", orden: 6 },
  { id: "gestion", nombre: "Gestión", orden: 7 },
] as const;

const TIPO_TAREA_AREA: Record<string, string> = {
  backend: "backend",
  frontend: "frontend",
  datos: "datos",
  pruebas: "qa",
  qa: "qa",
  infraestructura: "infra",
  arquitectura: "arquitectura",
  gestion: "gestion",
};

const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);

export interface TableSummary {
  tabla: string;
  enArchivo: number;
  insertadas: number;
  actualizadas: number;
}

export interface ImportSummary {
  archivo: string;
  tablas: TableSummary[];
  conflictos: string[];
  avisos: string[];
}

// ---------- helpers de celdas ----------

export function fold(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

export function text(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "" || fold(s) === "n/a") return null;
  return s;
}

export function int(v: unknown): number | null {
  const s = text(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Fecha Excel (serial con época 1899-12-30), Date o texto ISO → "yyyy-mm-dd". */
export function isoDate(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return new Date(EXCEL_EPOCH_MS + Math.floor(v) * 86_400_000).toISOString().slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return isoDate(Number(s));
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return null;
}

function bool(v: unknown): boolean {
  const s = text(v);
  return s !== null && ["si", "yes", "true", "1", "x"].includes(fold(s));
}

export function list(v: unknown): string[] {
  const s = text(v);
  if (!s) return [];
  return s
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter((x) => x && fold(x) !== "n/a");
}

/** Primer valor no vacío entre varios nombres posibles de columna. */
export function pick(row: Row, ...names: string[]): unknown {
  for (const n of names) {
    if (row[n] !== undefined && row[n] !== null && row[n] !== "") return row[n];
  }
  return null;
}

export function areaFromTipo(tipo: string | null): string | null {
  if (!tipo) return null;
  return TIPO_TAREA_AREA[fold(tipo)] ?? null;
}

// ---------- upsert que solo toca columnas de plan ----------

function planSet<T extends SQLiteTable>(table: T, keys: string[]): SQLiteUpdateSetSource<T> {
  const cols = getTableColumns(table) as Record<string, SQLiteColumn>;
  const set: Record<string, SQL> = {};
  for (const key of keys) {
    const col = cols[key];
    if (!col) throw new Error(`Columna desconocida ${key}`);
    if (APP_COLUMNS.has(col.name)) {
      throw new Error(`El import intentó sobrescribir la columna de app "${col.name}"`);
    }
    set[key] = sql.raw(`excluded."${col.name}"`);
  }
  set.actualizadoEn = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;
  if (!cols.actualizadoEn) delete set.actualizadoEn;
  return set as SQLiteUpdateSetSource<T>;
}

async function existingIds(tx: Tx, table: SQLiteTable, pkColumn: string): Promise<Set<string>> {
  const rows = await tx.all<{ id: string }>(sql.raw(`select "${pkColumn}" as id from "${tableName(table)}"`));
  return new Set(rows.map((r) => r.id));
}

function tableName(table: SQLiteTable): string {
  return (table as unknown as Record<symbol, string>)[Symbol.for("drizzle:Name")];
}

export async function upsertById<T extends SQLiteTable>(
  tx: Tx,
  table: T,
  pk: { key: string; column: string },
  rows: T["$inferInsert"][],
  summary: ImportSummary,
  opts: { reportMissing?: boolean; label?: string; insertOnly?: string[] } = {},
) {
  const label = opts.label ?? tableName(table);
  if (["tareas", "historias"].includes(tableName(table))) {
    const identities = await tx.all<{ id: string; nombre: string }>(sql.raw(`select id, nombre from "${tableName(table)}"`));
    const byId = new Map(identities.map((r) => [r.id, r.nombre]));
    const conflicts = rows.filter((row) => {
      const r = row as Row, old = byId.get(String(r[pk.key]));
      return old !== undefined && typeof r.nombre === "string" && normalizarIdentidad(old) !== normalizarIdentidad(r.nombre);
    });
    if (conflicts.length) throw new Error(`Conflicto de identidad en ${label}: ${conflicts.map((r) => String((r as Row)[pk.key])).join(", ")}. Use correspondencias de reconciliación; los estados y la evidencia no se transfieren por ID.`);
  }
  const before = await existingIds(tx, table, pk.column);
  const fileIds = new Set(rows.map((r) => String((r as Row)[pk.key])));
  let insertadas = 0;
  let actualizadas = 0;
  for (const id of fileIds) {
    if (before.has(id)) actualizadas++;
    else insertadas++;
  }
  if (rows.length) {
    // insertOnly: columnas de app que el import inicializa al insertar pero nunca actualiza.
    const keys = [...new Set(rows.flatMap((r) => Object.keys(r as Row)))].filter((k) => k !== pk.key && !opts.insertOnly?.includes(k));
    const cols = getTableColumns(table) as Record<string, SQLiteColumn>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx.insert(table) as any).values(rows).onConflictDoUpdate({ target: cols[pk.key], set: planSet(table, keys) });
  }
  if (opts.reportMissing !== false) {
    for (const id of before) {
      if (!fileIds.has(id)) summary.conflictos.push(`${label}: "${id}" existe en la base pero no en el archivo (se conserva)`);
    }
  }
  summary.tablas.push({ tabla: label, enArchivo: fileIds.size, insertadas, actualizadas });
}

/** Relaciones N:M: inserta las nuevas, nunca borra; reporta las que ya no están en el archivo. */
export async function syncPairs(
  tx: Tx,
  table: SQLiteTable,
  cols: [string, string],
  pairs: [string, string][],
  summary: ImportSummary,
) {
  const name = tableName(table);
  const existing = await tx.all<{ a: string; b: string }>(sql.raw(`select "${cols[0]}" as a, "${cols[1]}" as b from "${name}"`));
  const key = (a: string, b: string) => `${a}→${b}`;
  const before = new Set(existing.map((r) => key(r.a, r.b)));
  const inFile = new Set(pairs.map(([a, b]) => key(a, b)));
  let insertadas = 0;
  for (const [a, b] of pairs) {
    if (before.has(key(a, b))) continue;
    await tx.run(sql`insert or ignore into ${sql.identifier(name)} (${sql.identifier(cols[0])}, ${sql.identifier(cols[1])}) values (${a}, ${b})`);
    before.add(key(a, b));
    insertadas++;
  }
  for (const r of existing) {
    if (!inFile.has(key(r.a, r.b))) summary.conflictos.push(`${name}: relación ${key(r.a, r.b)} existe en la base pero no en el archivo (se conserva)`);
  }
  summary.tablas.push({ tabla: name, enArchivo: inFile.size, insertadas, actualizadas: 0 });
}

// ---------- import principal ----------

export function sheetRows(wb: XLSX.WorkBook, name: string): Row[] | null {
  const ws = wb.Sheets[name];
  if (!ws) return null;
  return XLSX.utils.sheet_to_json<Row>(ws, { defval: null, raw: true });
}

export async function importWorkbook(db: Db, file: string): Promise<ImportSummary> {
  // Lectura en memoria: el archivo original nunca se abre en modo escritura.
  const wb = XLSX.read(readFileSync(file), { type: "buffer" });
  const summary: ImportSummary = { archivo: file, tablas: [], conflictos: [], avisos: [] };

  const required = ["Tabla_Sprints", "Tabla_Festivos", "Tabla_Asignacion_HU", "Tabla_Cronograma"];
  const missingSheets = required.filter((s) => !wb.Sheets[s]);
  if (missingSheets.length) throw new Error(`Faltan hojas requeridas: ${missingSheets.join(", ")}`);

  // --- Sprints (solo filas "Sprint N") ---
  const sprintRows = sheetRows(wb, "Tabla_Sprints")!
    .filter((r) => /^Sprint \d+$/.test(String(r.Sprint ?? "").trim()))
    .map((r) => {
      const id = String(r.Sprint).trim();
      return {
        id,
        numero: Number(id.replace("Sprint ", "")),
        fechaInicio: isoDate(pick(r, "Fecha_Inicio", "Fecha_Inicio_iso"))!,
        fechaFin: isoDate(pick(r, "Fecha_Fin", "Fecha_Fin_iso"))!,
        diasHabiles: int(r.Dias_Habiles),
        objetivo: text(r.Objetivo),
        epicas: text(r.Epicas),
        huIncluidas: text(r.HU_Incluidas),
        spComprometidos: int(r.SP_Comprometidos),
      };
    });
  for (const s of sprintRows) {
    if (!s.fechaInicio || !s.fechaFin) throw new Error(`${s.id}: fechas inválidas`);
  }
  const sprintIds = new Set(sprintRows.map((s) => s.id));

  // --- Festivos ---
  const festivoRows = sheetRows(wb, "Tabla_Festivos")!
    .map((r) => ({
      fecha: isoDate(pick(r, "Fecha", "Fecha_iso")),
      diaSemana: text(r.Dia_Semana),
      festividad: text(r.Festividad) ?? "Festivo",
    }))
    .filter((r): r is { fecha: string; diaSemana: string | null; festividad: string } => r.fecha !== null);

  // --- Historias ---
  const sprintOrNull = (v: unknown, ctx: string) => {
    const s = text(v);
    if (s && !sprintIds.has(s)) {
      summary.avisos.push(`${ctx}: sprint "${s}" no existe en Tabla_Sprints; se deja sin sprint`);
      return null;
    }
    return s;
  };
  const huRows = sheetRows(wb, "Tabla_Asignacion_HU")!
    .filter((r) => text(r.HU_ID))
    .map((r) => {
      const id = text(r.HU_ID)!;
      return {
        id,
        nombre: text(r.HU_Nombre) ?? id,
        epicaId: text(r.Epica_ID),
        epica: text(r.Epica),
        featureId: text(r.Feature_ID),
        feature: text(r.Feature),
        prioridad: text(r.Prioridad),
        sp: int(r.SP),
        sprintId: sprintOrNull(r.Sprint, id),
        estadoPlan: text(r.Estado_Plan),
        dependencias: text(r.Dependencias_HU),
        justificacion: text(r.Justificacion),
      };
    });
  const huIds = new Set(huRows.map((h) => h.id));

  // --- Tareas ---
  const cronograma = sheetRows(wb, "Tabla_Cronograma")!.filter((r) => text(r.ID_Tarea));
  const tipoDesconocido = new Set<string>();
  const tareaRows = cronograma.map((r) => {
    const id = text(r.ID_Tarea)!;
    const tipo = text(r.Tipo_Tarea);
    const areaId = areaFromTipo(tipo);
    if (!areaId) tipoDesconocido.add(`${id}:${tipo ?? "(vacío)"}`);
    let historiaId = text(r.HU_ID);
    if (historiaId && !huIds.has(historiaId)) {
      summary.avisos.push(`${id}: HU "${historiaId}" no existe en Tabla_Asignacion_HU; se deja sin HU`);
      historiaId = null;
    }
    return {
      id,
      sprintId: sprintOrNull(r.Sprint, id),
      fase: text(r.Fase),
      epicaId: text(r.Epica_ID),
      featureId: text(r.Feature_ID),
      historiaId,
      nombre: text(r.Tarea) ?? id,
      descripcion: text(r.Descripcion),
      rol: text(r.Rol),
      tipoTarea: tipo,
      areaId: areaId ?? "",
      fechaInicio: isoDate(pick(r, "Fecha_Inicio", "Fecha_Inicio_iso")),
      fechaFin: isoDate(pick(r, "Fecha_Fin", "Fecha_Fin_iso")),
      duracionDias: int(r.Duracion_Dias),
      rutaCritica: bool(r.Ruta_Critica),
      paraleloCon: text(r.Paralelo_Con),
    };
  });
  if (tipoDesconocido.size) {
    throw new Error(`Tipo_Tarea sin área asignable: ${[...tipoDesconocido].join(", ")}`);
  }
  const tareaIds = new Set(tareaRows.map((t) => t.id));
  const predPairs: [string, string][] = [];
  for (const r of cronograma) {
    const id = text(r.ID_Tarea)!;
    for (const p of list(r.Predecesoras)) {
      if (!tareaIds.has(p)) summary.avisos.push(`${id}: predecesora "${p}" no existe; se ignora`);
      else predPairs.push([id, p]);
    }
  }

  // --- Hojas opcionales (milestones / líneas / áreas) ---
  const areaSheet = sheetRows(wb, "Tabla_Areas");
  const lineaSheet = sheetRows(wb, "Tabla_Lineas");
  const milestoneSheet = sheetRows(wb, "Tabla_Milestones");
  const msHuSheet = sheetRows(wb, "Tabla_Milestone_HU");
  const msTareaSheet = sheetRows(wb, "Tabla_Milestone_Tarea");

  await db.transaction(async (tx) => {
    // Áreas base: se crean si faltan; sus nombres no se pisan salvo que venga Tabla_Areas.
    await tx.insert(areas).values([...AREAS_SEED]).onConflictDoNothing();
    if (areaSheet) {
      const rows = areaSheet
        .map((r, i) => ({
          id: text(pick(r, "ID_Area", "Area_ID", "Id", "id")),
          nombre: text(pick(r, "Area", "Nombre", "nombre")),
          orden: int(pick(r, "Orden", "orden")) ?? i + 1,
        }))
        .filter((r): r is { id: string; nombre: string; orden: number } => !!r.id && !!r.nombre);
      await upsertById(tx, areas, { key: "id", column: "id" }, rows, summary);
    }

    await upsertById(tx, sprints, { key: "id", column: "id" }, sprintRows, summary);
    await upsertById(tx, festivos, { key: "fecha", column: "fecha" }, festivoRows, summary);
    await upsertById(tx, historias, { key: "id", column: "id" }, huRows, summary);
    await upsertById(tx, tareas, { key: "id", column: "id" }, tareaRows, summary);
    await syncPairs(tx, tareaPredecesora, ["tarea_id", "predecesora_id"], predPairs, summary);

    if (lineaSheet) {
      const rows = lineaSheet
        .map((r, i) => ({
          id: text(pick(r, "ID_Linea", "Linea_ID", "Id", "id")),
          nombre: text(pick(r, "Linea", "Nombre", "nombre")),
          descripcion: text(pick(r, "Descripcion", "descripcion")),
          orden: int(pick(r, "Orden", "orden")) ?? i + 1,
        }))
        .filter((r): r is { id: string; nombre: string; descripcion: string | null; orden: number } => !!r.id && !!r.nombre);
      await upsertById(tx, lineas, { key: "id", column: "id" }, rows, summary);
    }

    const msIds = new Set<string>();
    if (milestoneSheet) {
      const lineaIds = new Set((await tx.select({ id: lineas.id }).from(lineas)).map((l) => l.id));
      const rows = milestoneSheet
        .map((r, i) => {
          const id = text(pick(r, "ID_Milestone", "Milestone_ID", "Id", "id"));
          let lineaId = text(pick(r, "Linea_ID", "ID_Linea", "Linea"));
          if (lineaId && !lineaIds.has(lineaId)) {
            summary.avisos.push(`${id}: línea "${lineaId}" no existe; se deja sin línea`);
            lineaId = null;
          }
          return {
            id,
            nombre: text(pick(r, "Milestone", "Nombre", "nombre")),
            descripcion: text(pick(r, "Descripcion", "descripcion")),
            lineaId,
            sprintId: sprintOrNull(pick(r, "Sprint", "Sprint_ID"), id ?? "milestone"),
            fechaObjetivo: isoDate(pick(r, "Fecha_Objetivo", "Fecha", "Fecha_iso")),
            criterio: text(pick(r, "Criterio", "Criterio_Cumplimiento")),
            orden: int(pick(r, "Orden", "orden")) ?? i + 1,
          };
        })
        .filter((r): r is typeof r & { id: string; nombre: string } => !!r.id && !!r.nombre);
      rows.forEach((r) => msIds.add(r.id));
      await upsertById(tx, milestones, { key: "id", column: "id" }, rows, summary);
    }
    if (msIds.size === 0) {
      for (const m of await tx.select({ id: milestones.id }).from(milestones)) msIds.add(m.id);
    }

    if (msHuSheet) {
      const pairs: [string, string][] = [];
      for (const r of msHuSheet) {
        const m = text(pick(r, "Milestone_ID", "ID_Milestone"));
        const h = text(pick(r, "HU_ID", "Historia_ID"));
        if (!m || !h) continue;
        if (!msIds.has(m) || !huIds.has(h)) summary.avisos.push(`milestone_historia ${m}→${h}: referencia inexistente; se ignora`);
        else pairs.push([m, h]);
      }
      await syncPairs(tx, milestoneHistoria, ["milestone_id", "historia_id"], pairs, summary);
    }
    if (msTareaSheet) {
      const pairs: [string, string][] = [];
      for (const r of msTareaSheet) {
        const m = text(pick(r, "Milestone_ID", "ID_Milestone"));
        const t = text(pick(r, "ID_Tarea", "Tarea_ID"));
        if (!m || !t) continue;
        if (!msIds.has(m) || !tareaIds.has(t)) summary.avisos.push(`milestone_tarea ${m}→${t}: referencia inexistente; se ignora`);
        else pairs.push([m, t]);
      }
      await syncPairs(tx, milestoneTarea, ["milestone_id", "tarea_id"], pairs, summary);
    }
  });

  return summary;
}

export function printSummary(s: ImportSummary) {
  console.log(`Importado: ${s.archivo}`);
  console.table(s.tablas);
  if (s.avisos.length) {
    console.log(`Avisos (${s.avisos.length}):`);
    for (const a of s.avisos) console.log(`  - ${a}`);
  }
  if (s.conflictos.length) {
    console.log(`CONFLICTOS (${s.conflictos.length}) — no se borró nada:`);
    for (const c of s.conflictos) console.log(`  - ${c}`);
  } else {
    console.log("Sin conflictos: todos los ids de la base están en el archivo.");
  }
}
