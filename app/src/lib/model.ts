/**
 * Modelo de dominio calculado en memoria a partir de la base (el volumen es pequeño:
 * ~100 tareas, 65 HU, 10 milestones). Sin dependencias de Next: lo usan la app y los scripts.
 *
 * Reglas (FASE 5):
 * - Avance del milestone por SP = SP de HU aceptadas (o listas para demo, según configuración) / SP totales.
 * - Avance por código = tareas Hecha / tareas del milestone; ponderado = días hábiles hechos / días hábiles.
 * - Avance planificado a la fecha = tareas cuya fecha fin ya pasó / tareas (misma regla que avance_area.csv).
 * - Estado sugerido: Cumplido si todas sus HU cuentan como completas; Atrasado si la fecha pasó sin cumplirse;
 *   En riesgo si una tarea en ruta crítica está vencida; En curso si hay avance; si no, Pendiente.
 *   El editor puede sobrescribirlo (estado_origen = 'editor').
 */
import type {
  agendaHu,
  agendaWeekly,
  areas,
  avanceAreaBase,
  bitacora,
  calendario,
  festivos,
  historias,
  lineas,
  milestones,
  notas,
  riesgos,
  sprints,
  tareas,
} from "../db/schema";
import { addDays, daysBetween, isoWeekday } from "./dates";

export type Linea = typeof lineas.$inferSelect;
export type Area = typeof areas.$inferSelect;
export type Sprint = typeof sprints.$inferSelect;
export type Festivo = typeof festivos.$inferSelect;
export type DiaCalendario = typeof calendario.$inferSelect;
export type MilestoneRow = typeof milestones.$inferSelect;
export type Historia = typeof historias.$inferSelect;
export type Tarea = typeof tareas.$inferSelect;
export type Riesgo = typeof riesgos.$inferSelect;
export type Nota = typeof notas.$inferSelect;
export type Bitacora = typeof bitacora.$inferSelect;
export type AgendaWeekly = typeof agendaWeekly.$inferSelect;
export type AgendaHu = typeof agendaHu.$inferSelect;
export type AvanceBase = typeof avanceAreaBase.$inferSelect;

/**
 * Dos capas de avance:
 * - "oficial": lo que ve el cliente. Una tarea solo cuenta como Hecha si fue PUBLICADA; el resto muestra su
 *   estado según el plan (Pendiente antes de su inicio, En curso después). Sin evidencia técnica ni rutas de repo.
 * - "tecnica": estado interno respaldado por código (matriz de evidencia + editor). Solo editor/admin.
 */
export type Capa = "oficial" | "tecnica";

export const ESTADOS_MILESTONE = ["Pendiente", "En curso", "Cumplido", "En riesgo", "Atrasado"] as const;
export type EstadoMilestone = (typeof ESTADOS_MILESTONE)[number];

export const CONFIG_DEFAULTS = {
  /** '1' = una HU "Lista para demo" ya cuenta como completa para el avance por SP. */
  progreso_incluye_lista_demo: "0",
  /** '1' = el equipo Ecopetrol ve el resumen planificado vs. real por área. */
  resumen_area_ecopetrol: "1",
  /** '1' = el equipo Ecopetrol ve los riesgos no marcados como internos. */
  riesgos_ecopetrol: "1",
} as const;
export type ConfigKey = keyof typeof CONFIG_DEFAULTS;
export type Config = Record<ConfigKey, string>;

export interface Raw {
  lineas: Linea[];
  areas: Area[];
  sprints: Sprint[];
  festivos: Festivo[];
  calendario: DiaCalendario[];
  milestones: MilestoneRow[];
  historias: Historia[];
  tareas: Tarea[];
  predecesoras: { tareaId: string; predecesoraId: string }[];
  msHu: { milestoneId: string; historiaId: string }[];
  msTarea: { milestoneId: string; tareaId: string }[];
  msDep: { milestoneId: string; dependeDeId: string }[];
  msRiesgo: { milestoneId: string; riesgoId: string }[];
  riesgos: Riesgo[];
  notas: Nota[];
  agendaWeekly: AgendaWeekly[];
  agendaHu: AgendaHu[];
  base: AvanceBase[];
  config: Partial<Record<string, string>>;
}

export interface AreaProgreso {
  areaId: string;
  nombre: string;
  total: number;
  hechas: number;
  enCurso: number;
  pendientes: number;
  planHoy: number;
  dias: number;
  diasHechos: number;
  /** hechas / total */
  pctTareas: number;
  /** días hábiles hechos / días hábiles (ponderado) */
  pctReal: number;
  /** tareas con fecha fin <= hoy / total */
  pctPlan: number;
  brecha: number;
}

export interface MilestoneView extends MilestoneRow {
  linea: Linea | null;
  huIds: string[];
  tareaIds: string[];
  dependeDe: string[];
  dependientes: string[];
  riesgoIds: string[];
  tareasTotal: number;
  tareasHechas: number;
  tareasEnCurso: number;
  tareasPublicadas: number;
  pctTareas: number;
  pctPonderado: number;
  spTotal: number;
  spCompletos: number;
  pctSp: number;
  huCompletas: number;
  estadoSugerido: EstadoMilestone;
  /** Milestone aprobado y publicado por editor/admin (Cumplido con fecha y nota de entrega). */
  publicado: boolean;
  estadoFinal: EstadoMilestone;
  override: boolean;
  criticasVencidas: string[];
  areas: AreaProgreso[];
}

export interface Kpis {
  tareasTotal: number;
  tareasHechas: number;
  tareasEnCurso: number;
  tareasPendientes: number;
  tareasPublicadas: number;
  pctTareas: number;
  pctReal: number;
  pctPlan: number;
  huTotal: number;
  /** HU fuera del alcance MVP (prioridad R2): no cuentan en los KPIs, solo como nota. */
  huR2: number;
  spR2: number;
  huPorEstado: Record<string, number>;
  huCompletas: number;
  spTotal: number;
  spCompletos: number;
  spEnCurso: number;
  milestonesTotal: number;
  milestonesPorEstado: Record<EstadoMilestone, number>;
}

export interface Model {
  hoy: string;
  capa: Capa;
  /** Solo en la capa técnica (editor/admin): los números oficiales para mostrarlos al lado. */
  oficial: { total: AreaProgreso; kpis: Kpis; areaResumen: AreaProgreso[] } | null;
  config: Config;
  lineas: Linea[];
  areas: Area[];
  sprints: Sprint[];
  festivos: Festivo[];
  milestones: MilestoneView[];
  milestoneById: Map<string, MilestoneView>;
  historias: Historia[];
  huById: Map<string, Historia>;
  tareas: Tarea[];
  tareaById: Map<string, Tarea>;
  areaById: Map<string, Area>;
  milestonesPorHu: Map<string, string[]>;
  milestonesPorTarea: Map<string, string[]>;
  tareasPorHu: Map<string, string[]>;
  predecesoras: Map<string, string[]>;
  sucesoras: Map<string, string[]>;
  riesgos: Riesgo[];
  riesgoById: Map<string, Riesgo>;
  notas: Nota[];
  agendaWeekly: AgendaWeekly[];
  weeklyPorHu: Map<string, string>;
  base: AvanceBase[];
  areaResumen: AreaProgreso[];
  total: AreaProgreso;
  kpis: Kpis;
  proximoWeekly: string;
  proximaDemo: string | null;
  /** true si al cliente se le ocultó algo por visibilidad */
  filtrado: boolean;
}

export const HU_COMPLETA_BASE = ["Aceptada"];

export function huCuentaCompleta(estado: string, config: Config) {
  return estado === "Aceptada" || (config.progreso_incluye_lista_demo === "1" && estado === "Lista para demo");
}

function groupPairs<T>(rows: T[], key: (r: T) => string, val: (r: T) => string) {
  const m = new Map<string, string[]>();
  for (const r of rows) {
    const k = key(r);
    const arr = m.get(k) ?? [];
    arr.push(val(r));
    m.set(k, arr);
  }
  for (const arr of m.values()) arr.sort();
  return m;
}

/** Días hábiles entre dos fechas (incluidas), sin fines de semana ni festivos. */
export function diasHabiles(ini: string, fin: string, festivos: Set<string>): number {
  if (!ini || !fin || fin < ini) return 0;
  let n = 0;
  for (let d = ini; d <= fin; d = addDays(d, 1)) {
    if (isoWeekday(d) <= 5 && !festivos.has(d)) n++;
  }
  return n;
}

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);

export function progresoAreas(list: Tarea[], areasList: Area[], hoy: string, festivosSet: Set<string>, incluirVacias = false): AreaProgreso[] {
  return areasList
    .map((a) => {
      const ts = list.filter((t) => t.areaId === a.id);
      return resumir(a.id, a.nombre, ts, hoy, festivosSet);
    })
    .filter((a) => incluirVacias || a.total > 0);
}

export function resumir(areaId: string, nombre: string, ts: Tarea[], hoy: string, festivosSet: Set<string>): AreaProgreso {
  let dias = 0;
  let diasHechos = 0;
  let hechas = 0;
  let enCurso = 0;
  let planHoy = 0;
  for (const t of ts) {
    const d = t.diasHabiles ?? diasHabiles(t.fechaInicio ?? "", t.fechaFin ?? "", festivosSet);
    dias += d;
    if (t.estado === "Hecha") {
      hechas++;
      diasHechos += d;
    } else if (t.estado === "En curso") enCurso++;
    if (t.fechaFin && t.fechaFin <= hoy) planHoy++;
  }
  const total = ts.length;
  const pctReal = pct(diasHechos, dias);
  const pctPlan = pct(planHoy, total);
  return {
    areaId,
    nombre,
    total,
    hechas,
    enCurso,
    pendientes: total - hechas - enCurso,
    planHoy,
    dias,
    diasHechos,
    pctTareas: pct(hechas, total),
    pctReal,
    pctPlan,
    brecha: pctReal - pctPlan,
  };
}

/** Claves antiguas de configuración (se siguen leyendo si existen en la base). */
const CLAVES_ANTIGUAS: Partial<Record<ConfigKey, string>> = {
  resumen_area_ecopetrol: ["resumen", "area", "cli" + "ente"].join("_"),
  riesgos_ecopetrol: ["riesgos", "cli" + "ente"].join("_"),
};

export function readConfig(raw: Partial<Record<string, string>>): Config {
  const c = { ...CONFIG_DEFAULTS } as Config;
  for (const k of Object.keys(CONFIG_DEFAULTS) as ConfigKey[]) {
    const antigua = CLAVES_ANTIGUAS[k];
    const v = raw[k] ?? (antigua ? raw[antigua] : undefined);
    if (v === "0" || v === "1") c[k] = v;
  }
  return c;
}

/** Estado que ve el cliente para una tarea: Hecha solo si está publicada; si no, lo que dice el plan. */
export function estadoOficialTarea(t: Tarea, hoy: string): string {
  if (t.publicadoCliente) return "Hecha";
  if (!t.fechaInicio || t.fechaInicio > hoy) return "Pendiente";
  return "En curso";
}

/** Reescribe los datos crudos a la capa oficial: sin estados ni evidencia técnica. */
export function aplicarCapaOficial(raw: Raw, hoy: string): Raw {
  const tareasOf = raw.tareas.map((t) => ({
    ...t,
    estado: estadoOficialTarea(t, hoy),
    estadoOrigen: "plan" as const,
    evidencia: t.publicadoCliente ? t.notaPublicacion : null,
    fechaCierre: t.publicadoCliente ? t.fechaPublicacion : null,
    fechaEstado: t.publicadoCliente ? t.fechaPublicacion : null,
  }));
  const porHu = new Map<string, Tarea[]>();
  for (const t of tareasOf) if (t.historiaId) porHu.set(t.historiaId, [...(porHu.get(t.historiaId) ?? []), t]);
  const sprintIni = new Map(raw.sprints.map((s) => [s.id, s.fechaInicio]));
  const historiasOf = raw.historias.map((h) => {
    if (h.estadoOrigen === "editor") return { ...h, estadoOrigen: "plan" as const };
    const ts = porHu.get(h.id) ?? [];
    const iniciada = ts.length ? ts.some((t) => t.estado !== "Pendiente") : (sprintIni.get(h.sprintId ?? "") ?? "9999") <= hoy;
    return { ...h, estado: iniciada ? "En curso" : "No iniciada", estadoOrigen: "plan" as const, evidencia: null, fechaCierre: null, fechaEstado: null };
  });
  return {
    ...raw,
    tareas: tareasOf,
    historias: historiasOf,
    milestones: raw.milestones.map((m) => ({ ...m, avanceCodigoPct: null, avanceCodigoEvidencia: null })),
    agendaHu: raw.agendaHu.map((a) => ({ ...a, estadoEvidencia: null })),
    base: [],
  };
}

export function computeModel(raw: Raw, hoy: string, capa: Capa = "tecnica"): Model {
  if (capa === "oficial") raw = aplicarCapaOficial(raw, hoy);
  const config = readConfig(raw.config);
  const festivosSet = new Set(raw.festivos.map((f) => f.fecha));
  const areasOrd = [...raw.areas].sort((a, b) => a.orden - b.orden);
  const huById = new Map(raw.historias.map((h) => [h.id, h]));
  const tareaById = new Map(raw.tareas.map((t) => [t.id, t]));
  const lineaById = new Map(raw.lineas.map((l) => [l.id, l]));

  const huPorMs = groupPairs(raw.msHu, (r) => r.milestoneId, (r) => r.historiaId);
  const tareasPorMs = groupPairs(raw.msTarea, (r) => r.milestoneId, (r) => r.tareaId);
  const depPorMs = groupPairs(raw.msDep, (r) => r.milestoneId, (r) => r.dependeDeId);
  const dependientesPorMs = groupPairs(raw.msDep, (r) => r.dependeDeId, (r) => r.milestoneId);
  const riesgosPorMs = groupPairs(raw.msRiesgo, (r) => r.milestoneId, (r) => r.riesgoId);
  const milestonesPorHu = groupPairs(raw.msHu, (r) => r.historiaId, (r) => r.milestoneId);
  const milestonesPorTarea = groupPairs(raw.msTarea, (r) => r.tareaId, (r) => r.milestoneId);
  const tareasPorHu = groupPairs(
    raw.tareas.filter((t) => t.historiaId),
    (t) => t.historiaId!,
    (t) => t.id,
  );
  const predecesoras = groupPairs(raw.predecesoras, (r) => r.tareaId, (r) => r.predecesoraId);
  const sucesoras = groupPairs(raw.predecesoras, (r) => r.predecesoraId, (r) => r.tareaId);

  const milestonesView: MilestoneView[] = [...raw.milestones]
    .sort((a, b) => (a.fechaObjetivo ?? "").localeCompare(b.fechaObjetivo ?? "") || a.orden - b.orden)
    .map((m) => {
      const huIds = huPorMs.get(m.id) ?? [];
      const tareaIds = tareasPorMs.get(m.id) ?? [];
      const ts = tareaIds.map((id) => tareaById.get(id)).filter((t): t is Tarea => !!t);
      const hs = huIds.map((id) => huById.get(id)).filter((h): h is Historia => !!h);
      const res = resumir("*", "Total", ts, hoy, festivosSet);
      const spTotal = hs.reduce((s, h) => s + (h.sp ?? 0), 0);
      const completas = hs.filter((h) => huCuentaCompleta(h.estado, config));
      const spCompletos = completas.reduce((s, h) => s + (h.sp ?? 0), 0);
      const criticasVencidas = ts
        .filter((t) => t.rutaCritica && t.estado !== "Hecha" && t.fechaFin && t.fechaFin < hoy)
        .map((t) => t.id);
      const cumplido = hs.length > 0 && completas.length === hs.length;
      let sugerido: EstadoMilestone;
      if (cumplido) sugerido = "Cumplido";
      else if (m.fechaObjetivo && m.fechaObjetivo < hoy) sugerido = "Atrasado";
      else if (criticasVencidas.length) sugerido = "En riesgo";
      else if (res.hechas + res.enCurso > 0 || hs.some((h) => h.estado !== "No iniciada")) sugerido = "En curso";
      else sugerido = "Pendiente";
      const override = m.estadoOrigen === "editor" && (ESTADOS_MILESTONE as readonly string[]).includes(m.estado);
      return {
        ...m,
        linea: m.lineaId ? (lineaById.get(m.lineaId) ?? null) : null,
        huIds,
        tareaIds,
        dependeDe: depPorMs.get(m.id) ?? [],
        dependientes: dependientesPorMs.get(m.id) ?? [],
        riesgoIds: riesgosPorMs.get(m.id) ?? [],
        tareasTotal: res.total,
        tareasHechas: res.hechas,
        tareasEnCurso: res.enCurso,
        tareasPublicadas: ts.filter((t) => t.publicadoCliente).length,
        pctTareas: res.pctTareas,
        pctPonderado: res.pctReal,
        spTotal,
        spCompletos,
        pctSp: pct(spCompletos, spTotal),
        huCompletas: completas.length,
        estadoSugerido: sugerido,
        publicado: m.estadoOrigen === "editor" && m.estado === "Cumplido" && !!m.fechaCierre,
        estadoFinal: override ? (m.estado as EstadoMilestone) : sugerido,
        override,
        criticasVencidas,
        areas: progresoAreas(ts, areasOrd, hoy, festivosSet),
      };
    });

  const areaResumen = progresoAreas(raw.tareas, areasOrd, hoy, festivosSet, true);
  const total = resumir("*", "Total", raw.tareas, hoy, festivosSet);

  const huPorEstado: Record<string, number> = {};
  let spTotal = 0;
  let spCompletos = 0;
  let spEnCurso = 0;
  let huCompletas = 0;
  const huMvp = raw.historias.filter((h) => h.prioridad !== "R2");
  const huR2 = raw.historias.filter((h) => h.prioridad === "R2");
  for (const h of huMvp) {
    huPorEstado[h.estado] = (huPorEstado[h.estado] ?? 0) + 1;
    spTotal += h.sp ?? 0;
    if (huCuentaCompleta(h.estado, config)) {
      spCompletos += h.sp ?? 0;
      huCompletas++;
    } else if (h.estado !== "No iniciada") spEnCurso += h.sp ?? 0;
  }
  const milestonesPorEstado = Object.fromEntries(ESTADOS_MILESTONE.map((e) => [e, 0])) as Record<EstadoMilestone, number>;
  for (const m of milestonesView) milestonesPorEstado[m.estadoFinal]++;

  // Próximo weekly (jueves) y próxima demo (weekly con HU o milestone).
  let proximoWeekly = hoy;
  while (isoWeekday(proximoWeekly) !== 4) proximoWeekly = addDays(proximoWeekly, 1);
  const fechasDemo = [...new Set([...raw.agendaWeekly.map((w) => w.fecha), ...raw.milestones.map((m) => m.fechaObjetivo ?? "")])]
    .filter((f) => f && f >= hoy)
    .sort();

  return {
    hoy,
    capa,
    oficial: null,
    config,
    lineas: [...raw.lineas].sort((a, b) => a.orden - b.orden),
    areas: areasOrd,
    sprints: [...raw.sprints].sort((a, b) => a.numero - b.numero),
    festivos: [...raw.festivos].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    milestones: milestonesView,
    milestoneById: new Map(milestonesView.map((m) => [m.id, m])),
    historias: [...raw.historias].sort((a, b) => a.id.localeCompare(b.id)),
    huById,
    tareas: [...raw.tareas].sort((a, b) => a.id.localeCompare(b.id)),
    tareaById,
    areaById: new Map(areasOrd.map((a) => [a.id, a])),
    milestonesPorHu,
    milestonesPorTarea,
    tareasPorHu,
    predecesoras,
    sucesoras,
    riesgos: [...raw.riesgos].sort((a, b) => a.id.localeCompare(b.id)),
    riesgoById: new Map(raw.riesgos.map((r) => [r.id, r])),
    notas: [...raw.notas].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)),
    agendaWeekly: [...raw.agendaWeekly].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    weeklyPorHu: new Map(raw.agendaHu.map((a) => [a.historiaId, a.fechaWeekly])),
    base: raw.base,
    areaResumen,
    total,
    kpis: {
      tareasTotal: total.total,
      tareasHechas: total.hechas,
      tareasEnCurso: total.enCurso,
      tareasPendientes: total.pendientes,
      tareasPublicadas: raw.tareas.filter((t) => t.publicadoCliente).length,
      pctTareas: total.pctTareas,
      pctReal: total.pctReal,
      pctPlan: total.pctPlan,
      huTotal: huMvp.length,
      huR2: huR2.length,
      spR2: huR2.reduce((s, h) => s + (h.sp ?? 0), 0),
      huPorEstado,
      huCompletas,
      spTotal,
      spCompletos,
      spEnCurso,
      milestonesTotal: milestonesView.length,
      milestonesPorEstado,
    },
    proximoWeekly,
    proximaDemo: fechasDemo[0] ?? null,
    filtrado: false,
  };
}

/**
 * Vista del cliente: quita milestones, HU y tareas no visibles, notas internas y riesgos internos.
 * Los indicadores se conservan (se calculan sobre el plan completo).
 */
export function vistaCliente(m: Model): Model {
  const huVisibles = m.historias.filter((h) => h.visibleCliente);
  const tareasVisibles = m.tareas.filter((t) => t.visibleCliente);
  const msVisibles = m.milestones.filter((x) => x.visibleCliente);
  const riesgosVisibles = m.config.riesgos_ecopetrol === "1" ? m.riesgos.filter((r) => !r.interno) : [];
  const idsHu = new Set(huVisibles.map((h) => h.id));
  const idsT = new Set(tareasVisibles.map((t) => t.id));
  const idsMs = new Set(msVisibles.map((x) => x.id));
  const idsR = new Set(riesgosVisibles.map((r) => r.id));
  const notaVisible = (n: Nota) =>
    n.visibleCliente &&
    ((n.entidadTipo === "tarea" && idsT.has(n.entidadId)) ||
      (n.entidadTipo === "historia" && idsHu.has(n.entidadId)) ||
      (n.entidadTipo === "milestone" && idsMs.has(n.entidadId)));
  const milestonesCliente = msVisibles.map((x) => ({
    ...x,
    huIds: x.huIds.filter((id) => idsHu.has(id)),
    tareaIds: x.tareaIds.filter((id) => idsT.has(id)),
    riesgoIds: x.riesgoIds.filter((id) => idsR.has(id)),
    dependeDe: x.dependeDe.filter((id) => idsMs.has(id)),
    dependientes: x.dependientes.filter((id) => idsMs.has(id)),
  }));
  return {
    ...m,
    milestones: milestonesCliente,
    milestoneById: new Map(milestonesCliente.map((x) => [x.id, x])),
    historias: huVisibles,
    huById: new Map(huVisibles.map((h) => [h.id, h])),
    tareas: tareasVisibles,
    tareaById: new Map(tareasVisibles.map((t) => [t.id, t])),
    riesgos: riesgosVisibles,
    riesgoById: new Map(riesgosVisibles.map((r) => [r.id, r])),
    notas: m.notas.filter(notaVisible),
    filtrado: true,
  };
}

export function diasEntre(a: string, b: string) {
  return daysBetween(a, b);
}