import { createHash } from "node:crypto";
export interface Source { id: string; nombre: string; fecha: string; huella: string; contenido: string }
export interface SourceTask { fuenteId: string; idOrigen: string; nombre: string; descripcion: string; hu: string | null; rol: string; inicio: string; fin: string; contenido: string }
export interface SourceReference { fuenteId: string; idOrigen: string; nombre: string; contenido: string }
export interface SourceCommitment { fuenteId: string; idOrigen: string; sprintId: string; resultado: string; criterio: string; fechaBase: string; tareas: string[] }
export interface Bundle { version: number; fuentes: Source[]; tareas: SourceTask[]; prerrequisitos: SourceReference[]; hitos: SourceCommitment[] }
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export function parseSources(documents: { nombre: string; contenido: string }[]): Bundle {
  const bundle: Bundle = { version: 1, fuentes: [], tareas: [], prerrequisitos: [], hitos: [] };
  for (const doc of documents) {
    const huella = digest(doc.contenido), fuenteId = `${doc.nombre}:${huella.slice(0, 16)}`;
    bundle.fuentes.push({ id: fuenteId, ...doc, fecha: "2026-10-02", huella });
    for (const line of doc.contenido.split(/\r?\n/)) {
      const cols = line.split("|").slice(1, -1).map((x) => x.trim());
      if (doc.nombre.startsWith("02_") && /^T-\d{3}$/.test(cols[0] ?? "") && cols.length === 15) {
        bundle.tareas.push({ fuenteId, idOrigen: cols[0], nombre: cols[5], descripcion: cols[6], hu: cols[4] === "N/A" ? null : cols[4], rol: cols[7], inicio: cols[9], fin: cols[10], contenido: JSON.stringify({ columnas: cols }) });
      }
      if (doc.nombre.startsWith("02_") && /^H-\d{2}$/.test(cols[0] ?? "") && cols.length === 6) {
        bundle.hitos.push({ fuenteId, idOrigen: cols[0], resultado: cols[1], fechaBase: cols[2].slice(0, 10), sprintId: cols[3], criterio: cols[4], tareas: cols[5].split(";") });
      }
      if (doc.nombre.startsWith("03_") && /^\d+$/.test(cols[0] ?? "") && cols.length === 5 && cols[1] !== "*(vacía)*") {
        bundle.prerrequisitos.push({ fuenteId, idOrigen: cols[0], nombre: cols[1], contenido: JSON.stringify({ descripcion: cols[2], entregable: cols[3], estado: cols[4], responsable: null, fechas: null }) });
      }
    }
  }
  if (bundle.tareas.length !== 80 || bundle.hitos.length !== 7) throw new Error("El paquete no contiene las 80 tareas y 7 hitos esperados; revise la conversión antes de aplicarlo");
  return bundle;
}
