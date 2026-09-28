/** Utilidades de fecha sobre strings ISO yyyy-mm-dd (sin zona horaria: se tratan como UTC). */

const DAY = 86_400_000;

export function toUtc(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  return fromUtc(toUtc(iso) + n * DAY);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY);
}

/** Día de la semana ISO: 1 = lunes … 7 = domingo. */
export function isoWeekday(iso: string): number {
  const d = new Date(toUtc(iso)).getUTCDay();
  return d === 0 ? 7 : d;
}

/** "Hoy" en Bogotá, o APP_HOY (yyyy-mm-dd) si se fija para demos. */
export function hoyIso(): string {
  const fijo = process.env.APP_HOY;
  if (fijo && /^\d{4}-\d{2}-\d{2}$/.test(fijo)) return fijo;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const DIAS_LARGOS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export function fmtCorta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]}`;
}

export function fmtLarga(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES_LARGOS[m - 1]} de ${y}`;
}

export function fmtDiaSemana(iso: string, largo = false): string {
  return (largo ? DIAS_LARGOS : DIAS)[isoWeekday(iso) - 1];
}

export function mesLargo(iso: string): string {
  return MESES_LARGOS[Number(iso.slice(5, 7)) - 1];
}

export function mesCorto(iso: string): string {
  return MESES[Number(iso.slice(5, 7)) - 1];
}

/** "hoy", "mañana", "en 5 días", "hace 3 días". */
export function relativo(hoy: string, fecha: string): string {
  const n = daysBetween(hoy, fecha);
  if (n === 0) return "hoy";
  if (n === 1) return "mañana";
  if (n === -1) return "ayer";
  return n > 0 ? `en ${n} días` : `hace ${-n} días`;
}

/** Marca de tiempo ISO completa → "28 sep 2026, 14:05" en hora de Bogotá. */
export function fmtMarca(ts: string): string {
  const d = new Date(ts.endsWith("Z") ? ts : `${ts}Z`);
  if (Number.isNaN(d.getTime())) return ts;
  const p = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return p.replace(".", "");
}