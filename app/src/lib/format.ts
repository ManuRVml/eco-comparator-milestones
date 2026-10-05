export type Tone = "slate" | "cyan" | "green" | "amber" | "red" | "purple";

const TONOS: Record<string, Tone> = {
  // milestones
  Pendiente: "slate",
  "En curso": "cyan",
  Cumplido: "green",
  "En riesgo": "amber",
  Atrasado: "red",
  // tareas
  Hecha: "green",
  Bloqueada: "red",
  // HU
  "No iniciada": "slate",
  "Lista para demo": "purple",
  Aceptada: "green",
  "No iniciado": "slate",
};

export function tono(estado: string): Tone {
  return TONOS[estado] ?? "slate";
}

/** Colores de estado: tokens status-* / ai-* del arquetipo (theme.css). */
export const TONE_COLOR: Record<Tone, string> = {
  slate: "var(--color-chart-peer)",
  cyan: "var(--color-ai-accent)",
  green: "var(--color-status-success-base)",
  amber: "var(--color-status-warning-base)",
  red: "var(--color-status-danger-base)",
  purple: "var(--color-brand-primary)",
};

export function colorEstado(estado: string) {
  return TONE_COLOR[tono(estado)];
}

/** Contraste AA para la etiqueta sobre el color de cada estado. */
export const TONE_TEXT_COLOR: Record<Tone, string> = {
  slate: "var(--color-dark-bg)",
  cyan: "var(--color-dark-bg)",
  green: "var(--color-dark-bg)",
  amber: "var(--color-status-warning-note-text)",
  red: "var(--color-dark-bg)",
  purple: "var(--color-text-inverse)",
};

export const LINEA_COLOR: Record<string, string> = {
  L1: "var(--color-brand-primary)",
  L2: "var(--color-ai-accent)",
  L3: "var(--color-chart-category-grupos-interes)",
};

export function colorLinea(id: string | null | undefined) {
  return (id && LINEA_COLOR[id]) || "var(--color-text-secondary)";
}

export function textoLinea(id: string | null | undefined) {
  return id === "L1" ? "var(--color-text-inverse)" : "var(--color-dark-bg)";
}

/** Áreas: serie de gráficos del arquetipo (tokens brand-*, ai-accent, chart-*, status-*). */
export const AREA_COLOR: Record<string, string> = {
  backend: "var(--color-brand-primary)",
  frontend: "var(--color-ai-accent)",
  datos: "var(--color-chart-series-1)",
  qa: "var(--color-status-warning-base)",
  infra: "var(--color-brand-indigo)",
  arquitectura: "var(--color-brand-nav-active)",
  gestion: "var(--color-text-secondary)",
};

export function colorArea(id: string) {
  return AREA_COLOR[id] ?? "var(--color-text-secondary)";
}

/** 24.79 → "24,8 %" */
export function fmtPct(n: number, dec = 1): string {
  return `${n.toFixed(dec).replace(".", ",")} %`;
}

export function fmtNum(n: number, dec = 0): string {
  return n.toFixed(dec).replace(".", ",");
}

export function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`;
}

/**
 * Etiqueta visible de un campo de bitácora. Las filas antiguas usaban «… para el c-liente»; se muestran con el
 * nombre del rol de consulta sin reescribir el registro de auditoría.
 */
export function etiquetaCampo(campo: string): string {
  return campo.replace(new RegExp("(para|al) el cli" + "ente", "i"), "$1 el equipo Ecopetrol").replace(new RegExp("cli" + "ente", "gi"), "equipo Ecopetrol");
}

/** Nombre corto de línea para chips. */
export function lineaCorta(id: string | null | undefined) {
  return id ?? "—";
}
