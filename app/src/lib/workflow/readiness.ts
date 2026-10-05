import type { Workflow } from "./types";
export function insumosPendientes(w: Workflow, id: string, momentos: readonly string[]): boolean {
  return w.bloqueos.some((b) => b.tareaId === id && !b.resueltoEn && momentos.includes(b.afecta)) ||
    w.relaciones.some((r) => r.tareaId === id && r.tipo !== "Coordinación" && !r.disponible && momentos.includes(r.afecta));
}
