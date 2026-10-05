export const EJECUCIONES = ["Pendiente", "Lista para empezar", "En curso", "Bloqueada", "Terminada"] as const;
export const ETAPAS = ["Implementación", "Integración", "Aceptación"] as const;
export const RESULTADOS = ["Verificada", "Sin verificar", "No aplica"] as const;
export const AFECTA = ["Inicio", "Ejecución", "Integración", "Aceptación"] as const;
export const RELACIONES = ["Bloqueo real", "Entrega parcial", "Coordinación", "Integración o aceptación"] as const;
export const SEVERIDADES = ["Crítica", "Alta", "Media", "Baja"] as const;

export function ejecucionLegada(estado: string): string {
  return ({ Hecha: "Terminada", "En curso": "En curso", Bloqueada: "Bloqueada" } as Record<string, string>)[estado] ?? "Pendiente";
}

export function normalizarIdentidad(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export interface RelacionDura { tareaId: string; proveedorId: string; tipo: string; disponible: boolean }
export function tieneCicloDuro(relaciones: RelacionDura[]): boolean {
  const edges = new Map<string, string[]>();
  for (const r of relaciones) {
    if (r.tipo === "Coordinación" || r.disponible) continue;
    edges.set(r.tareaId, [...(edges.get(r.tareaId) ?? []), r.proveedorId]);
  }
  const visitados = new Set<string>(), pendientes = new Set<string>();
  function visitar(id: string): boolean {
    if (pendientes.has(id)) return true;
    if (visitados.has(id)) return false;
    pendientes.add(id);
    if ((edges.get(id) ?? []).some(visitar)) return true;
    pendientes.delete(id); visitados.add(id); return false;
  }
  return [...edges.keys()].some(visitar);
}

export function ultimasPor<T>(rows: T[], key: (r: T) => string): T[] {
  return [...new Map(rows.map((r) => [key(r), r])).values()];
}
