import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import type { Db } from "../../src/db/client";
import {
  areas,
  historias,
  lineas,
  milestoneDependencia,
  milestoneHistoria,
  milestoneRiesgo,
  milestones,
  milestoneTarea,
  riesgos,
  sprints,
  tareas,
} from "../../src/db/schema";
import { parseCsv } from "./common";
import {
  fold,
  type ImportSummary,
  int,
  isoDate,
  list,
  pick,
  sheetRows,
  syncPairs,
  text,
  upsertById,
} from "./importer";

/**
 * Import de milestones_MANUEL.xlsx (Tabla_Lineas, Tabla_Milestones, Tabla_Milestone_HU,
 * Tabla_Milestone_Tarea y Tabla_Areas) + catálogo de riesgos (seed/riesgos.csv).
 *
 * Mismas reglas que el import del plan: UPSERT por id que solo toca columnas de plan,
 * relaciones que nunca se borran y conflictos reportados. Las HU y tareas deben existir
 * (se cargan antes con `pnpm run import`).
 */

const REQUIRED = ["Tabla_Lineas", "Tabla_Milestones", "Tabla_Milestone_HU", "Tabla_Milestone_Tarea"];

/** "Sprint 0–1" / "Sprint 4–6" → último sprint del rango ("Sprint 1", "Sprint 6"). */
export function lastSprint(v: string | null): string | null {
  if (!v) return null;
  const nums = v.match(/\d+/g);
  return nums?.length ? `Sprint ${nums[nums.length - 1]}` : null;
}

function pct(v: unknown): number | null {
  const s = text(v);
  if (s === null) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function importMilestonesWorkbook(db: Db, file: string, riesgosCsv: string | null): Promise<ImportSummary> {
  const wb = XLSX.read(readFileSync(file), { type: "buffer" });
  const summary: ImportSummary = { archivo: file, tablas: [], conflictos: [], avisos: [] };
  const missing = REQUIRED.filter((s) => !wb.Sheets[s]);
  if (missing.length) throw new Error(`Faltan hojas requeridas: ${missing.join(", ")}`);

  const huIds = new Set((await db.select({ id: historias.id }).from(historias)).map((r) => r.id));
  const tareaArea = new Map((await db.select({ id: tareas.id, area: tareas.areaId }).from(tareas)).map((r) => [r.id, r.area]));
  if (huIds.size === 0 || tareaArea.size === 0) {
    throw new Error("La base no tiene HU ni tareas: ejecute primero `pnpm run import -- <working_plan.xlsx>`");
  }
  const sprintIds = new Set((await db.select({ id: sprints.id }).from(sprints)).map((r) => r.id));
  const areaRows = await db.select({ id: areas.id, nombre: areas.nombre }).from(areas);
  const areaByName = new Map<string, string>();
  for (const a of areaRows) {
    areaByName.set(fold(a.nombre), a.id);
    areaByName.set(fold(a.id), a.id);
  }
  areaByName.set("qa", "qa");
  areaByName.set("infraestructura", "infra");
  areaByName.set("gestion", "gestion");

  // --- Tabla_Areas: solo se valida contra las áreas canónicas; no crea ids nuevos ---
  for (const r of sheetRows(wb, "Tabla_Areas") ?? []) {
    const nombre = text(pick(r, "Nombre", "Area"));
    if (nombre && !areaByName.has(fold(nombre))) summary.avisos.push(`Tabla_Areas: "${nombre}" no corresponde a un área de la app`);
  }

  // --- Líneas ---
  const lineaRows = sheetRows(wb, "Tabla_Lineas")!
    .map((r, i) => ({
      id: text(pick(r, "ID", "ID_Linea", "Linea_ID")),
      nombre: text(pick(r, "Nombre", "Linea")),
      descripcion: text(pick(r, "Descripcion")),
      orden: int(pick(r, "Orden")) ?? i + 1,
    }))
    .filter((r): r is { id: string; nombre: string; descripcion: string | null; orden: number } => !!r.id && !!r.nombre);
  const lineaIds = new Set(lineaRows.map((l) => l.id));

  // --- Milestones ---
  const msSheet = sheetRows(wb, "Tabla_Milestones")!;
  const msRows = msSheet
    .map((r, i) => {
      const id = text(pick(r, "ID", "ID_Milestone", "Milestone_ID"));
      let lineaId = text(pick(r, "Linea", "Linea_ID"));
      if (lineaId && !lineaIds.has(lineaId)) {
        summary.avisos.push(`${id}: línea "${lineaId}" no existe; se deja sin línea`);
        lineaId = null;
      }
      const sprintsTexto = text(pick(r, "Sprints", "Sprint"));
      let sprintId = lastSprint(sprintsTexto);
      if (sprintId && !sprintIds.has(sprintId)) sprintId = null;
      return {
        id,
        nombre: text(pick(r, "Nombre", "Milestone")),
        descripcion: null,
        lineaId,
        sprintId,
        sprintsTexto,
        fechaObjetivo: isoDate(pick(r, "Fecha_Objetivo_iso", "Fecha_Objetivo")),
        criterio: text(pick(r, "Criterio_Aceptacion", "Criterio")),
        valorCliente: text(pick(r, "Valor_Cliente")),
        epicas: text(pick(r, "Epicas")),
        avanceCodigoPct: pct(pick(r, "Avance_Codigo_Pct")),
        avanceCodigoEvidencia: text(pick(r, "Avance_Codigo_Evidencia")),
        orden: int(pick(r, "Orden")) ?? i + 1,
      };
    })
    .filter((r): r is typeof r & { id: string; nombre: string } => !!r.id && !!r.nombre);
  for (const m of msRows) if (!m.fechaObjetivo) throw new Error(`${m.id}: Fecha_Objetivo inválida`);
  const msIds = new Set(msRows.map((m) => m.id));

  const depPairs: [string, string][] = [];
  const riesgoRefs: [string, string][] = [];
  for (const r of msSheet) {
    const id = text(pick(r, "ID", "ID_Milestone"));
    if (!id) continue;
    for (const d of list(pick(r, "Dependencias"))) {
      if (!msIds.has(d)) summary.avisos.push(`${id}: dependencia "${d}" no existe; se ignora`);
      else depPairs.push([id, d]);
    }
    for (const rk of list(pick(r, "Riesgos"))) riesgoRefs.push([id, rk]);
  }

  // --- Riesgos (catálogo versionado en seed/riesgos.csv) ---
  const riesgoRows = riesgosCsv
    ? parseCsv(readFileSync(riesgosCsv, "utf8"))
        .filter((r) => r.id)
        .map((r) => ({
          id: r.id,
          descripcion: r.descripcion,
          categoria: r.categoria || null,
          probabilidad: r.probabilidad || null,
          impacto: r.impacto || null,
          mitigacion: r.mitigacion || null,
          fuente: r.fuente || null,
          interno: r.interno === "1",
        }))
    : [];
  const riesgoIds = new Set(riesgoRows.map((r) => r.id));
  const riesgoPairs = riesgoRefs.filter(([m, rk]) => {
    if (riesgoIds.has(rk)) return true;
    summary.avisos.push(`${m}: riesgo "${rk}" no está en el catálogo de riesgos; se ignora`);
    return false;
  });

  // --- Relaciones ---
  const huPairs: [string, string][] = [];
  for (const r of sheetRows(wb, "Tabla_Milestone_HU")!) {
    const m = text(pick(r, "Milestone_ID", "ID_Milestone"));
    const h = text(pick(r, "HU_ID", "Historia_ID"));
    if (!m || !h) continue;
    if (!msIds.has(m) || !huIds.has(h)) summary.avisos.push(`milestone_historia ${m}→${h}: referencia inexistente; se ignora`);
    else huPairs.push([m, h]);
  }
  const tareaPairs: [string, string][] = [];
  for (const r of sheetRows(wb, "Tabla_Milestone_Tarea")!) {
    const m = text(pick(r, "Milestone_ID", "ID_Milestone"));
    const t = text(pick(r, "ID_Tarea", "Tarea_ID"));
    if (!m || !t) continue;
    if (!msIds.has(m) || !tareaArea.has(t)) {
      summary.avisos.push(`milestone_tarea ${m}→${t}: referencia inexistente; se ignora`);
      continue;
    }
    const areaNombre = text(pick(r, "Area"));
    const areaId = areaNombre ? areaByName.get(fold(areaNombre)) : null;
    if (areaId && areaId !== tareaArea.get(t)) {
      summary.avisos.push(`${t}: el área "${areaNombre}" del archivo difiere de la del plan (${tareaArea.get(t)}); se conserva la del plan`);
    }
    tareaPairs.push([m, t]);
  }

  await db.transaction(async (tx) => {
    await upsertById(tx, lineas, { key: "id", column: "id" }, lineaRows, summary);
    if (riesgoRows.length) await upsertById(tx, riesgos, { key: "id", column: "id" }, riesgoRows, summary, { insertOnly: ["interno"] });
    await upsertById(tx, milestones, { key: "id", column: "id" }, msRows, summary);
    await syncPairs(tx, milestoneHistoria, ["milestone_id", "historia_id"], huPairs, summary);
    await syncPairs(tx, milestoneTarea, ["milestone_id", "tarea_id"], tareaPairs, summary);
    await syncPairs(tx, milestoneDependencia, ["milestone_id", "depende_de_id"], depPairs, summary);
    await syncPairs(tx, milestoneRiesgo, ["milestone_id", "riesgo_id"], riesgoPairs, summary);
  });
  return summary;
}