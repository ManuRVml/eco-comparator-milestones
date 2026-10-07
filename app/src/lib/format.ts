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
  return campo
    .replace(
      new RegExp("(para|al) el cli" + "ente", "i"),
      "$1 el equipo Ecopetrol",
    )
    .replace(new RegExp("cli" + "ente", "gi"), "equipo Ecopetrol");
}

/** Nombre corto de línea para chips. */
export function lineaCorta(id: string | null | undefined) {
  return id ?? "—";
}

/**
 * Semáforo de milestone: verde/ámbar/rojo/gris/cumplido según estado y fechas.
 * Umbral de retraso: >5 días hábiles = rojo, 1-5 días hábiles = ámbar.
 * Reglas (en orden de evaluación):
 * 1. cumplido=true → 'cumplido'
 * 2. !iniciado && fechaObjetivo > hoy → 'gris' (sin iniciar, futuro)
 * 3. fechaObjetivo < hoy && !cumplido → 'rojo' (atrasado)
 * 4. prevision > objetivo + >5 días hábiles → 'rojo' (prevision muy lejana)
 * 5. prevision > objetivo + 1-5 días hábiles → 'ambar' (previsión ajustada)
 * 6. else → 'verde' (dentro de plazo)
 */
/**
 * Cuenta los días hábiles (lunes a viernes) entre dos fechas.
 * Cuenta desde `desde` (exclusive) hasta `hasta` (inclusive), en UTC.
 */
export function diasHabilesEntre(desde: string, hasta: string): number {
  const desdeDate = new Date(desde + "T00:00:00Z");
  const hastaDate = new Date(hasta + "T00:00:00Z");
  if (desdeDate >= hastaDate) return 0;

  const diasHabiles = { 1: true, 2: true, 3: true, 4: true, 5: true }; // Mon-Fri
  let count = 0;
  const current = new Date(desdeDate);
  current.setUTCDate(current.getUTCDate() + 1); // desde exclusive

  while (current <= hastaDate) {
    if (diasHabiles[current.getUTCDay()]) count++;
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return count;
}

export function semaforoMilestone(
  m: {
    fechaObjetivo: string;
    fechaPrevision?: string | null;
    cumplido: boolean;
    iniciado: boolean;
  },
  hoy: string,
): "verde" | "ambar" | "rojo" | "gris" | "cumplido" {
  // 1. Cumplido
  if (m.cumplido) return "cumplido";

  // 2. Sin iniciar y objetivo en el futuro
  if (!m.iniciado && new Date(m.fechaObjetivo) > new Date(hoy)) return "gris";

  // 3. Objetivo pasado y no cumplido
  if (new Date(m.fechaObjetivo) < new Date(hoy)) return "rojo";

  // 4-5. Verificar previsión si existe
  if (m.fechaPrevision) {
    const businessDays = diasHabilesEntre(m.fechaObjetivo, m.fechaPrevision);

    if (businessDays > 5) return "rojo";
    if (businessDays >= 1) return "ambar";
  }

  // 6. Dentro de plazo
  return "verde";
}
