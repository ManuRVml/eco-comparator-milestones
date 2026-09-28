import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsv, todayIso } from "./common";

/** Mapeo único matriz de evidencia → estados de la app (lo usan seed:evidence y db:clean-test-artifacts). */

export const DEFAULT_MATRIZ = resolve(process.cwd(), "..", "data", "evidence", "matriz_evidencia.csv");

export type FilaMatriz = Record<string, string>;

export function leerMatriz(file = process.env.EVIDENCE_CSV ?? DEFAULT_MATRIZ): { file: string; filas: FilaMatriz[]; porId: Map<string, FilaMatriz> } {
  const filas = parseCsv(readFileSync(file, "utf8"));
  return { file, filas, porId: new Map(filas.filter((r) => r.id).map((r) => [r.id, r])) };
}

export function estadoHistoria(e: string) {
  if (e === "Hecho") return "Lista para demo";
  if (e === "Parcial") return "En curso";
  return "No iniciada";
}

export function estadoTarea(e: string) {
  if (e === "Hecho") return "Hecha";
  if (e === "Parcial") return "En curso";
  return "Pendiente";
}

/** Columnas de app que fija el seed para una fila de la matriz. */
export function estadoDesdeMatriz(r: FilaMatriz, esHu: boolean) {
  const fecha = r.fecha_completitud || null;
  const hoy = todayIso();
  return {
    estado: esHu ? estadoHistoria(r.estado) : estadoTarea(r.estado),
    estadoOrigen: "codigo" as const,
    evidencia: r.evidencia || null,
    fechaEstado: fecha ?? hoy,
    fechaCierre: r.estado === "Hecho" ? (fecha ?? hoy) : null,
  };
}