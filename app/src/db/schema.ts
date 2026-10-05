import { sql } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
export * from "./workflow-schema";
export * from "./milestone-schema";

/**
 * Columnas "de plan": vienen del Excel y el import las sobrescribe.
 * Columnas "de app" (estado, estado_origen, visible_cliente, fecha_estado, evidencia, fecha_cierre)
 * son propiedad de la app: el import las inicializa al insertar y NUNCA las actualiza.
 */

export const ESTADO_ORIGEN = ["plan", "codigo", "editor"] as const;
export type EstadoOrigen = (typeof ESTADO_ORIGEN)[number];

export const ESTADOS_HISTORIA = ["No iniciada", "En curso", "Lista para demo", "Aceptada", "Bloqueada"] as const;
export const ESTADOS_TAREA = ["Pendiente", "En curso", "Hecha", "Bloqueada"] as const;

const creadoEn = () => text("creado_en").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);
const actualizadoEn = () => text("actualizado_en").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);

const appState = (estadoDefault: string) => ({
  estado: text("estado").notNull().default(estadoDefault),
  estadoOrigen: text("estado_origen", { enum: ESTADO_ORIGEN }).notNull().default("plan"),
  visibleCliente: integer("visible_cliente", { mode: "boolean" }).notNull().default(true),
  fechaEstado: text("fecha_estado"),
  evidencia: text("evidencia"),
  fechaCierre: text("fecha_cierre"),
});

export const lineas = sqliteTable("lineas", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  orden: integer("orden").notNull().default(0),
});

export const areas = sqliteTable("areas", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  orden: integer("orden").notNull().default(0),
});

export const sprints = sqliteTable("sprints", {
  id: text("id").primaryKey(), // "Sprint 0"
  numero: integer("numero").notNull(),
  fechaInicio: text("fecha_inicio").notNull(), // ISO yyyy-mm-dd
  fechaFin: text("fecha_fin").notNull(),
  diasHabiles: integer("dias_habiles"),
  objetivo: text("objetivo"),
  epicas: text("epicas"),
  huIncluidas: text("hu_incluidas"),
  spComprometidos: integer("sp_comprometidos"),
});

export const festivos = sqliteTable("festivos", {
  fecha: text("fecha").primaryKey(), // ISO yyyy-mm-dd
  diaSemana: text("dia_semana"),
  festividad: text("festividad").notNull(),
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  lineaId: text("linea_id").references(() => lineas.id),
  sprintId: text("sprint_id").references(() => sprints.id),
  fechaObjetivo: text("fecha_objetivo"),
  criterio: text("criterio"),
  orden: integer("orden").notNull().default(0),
  // Columnas de plan que vienen de milestones_MANUEL.xlsx (Tabla_Milestones).
  valorCliente: text("valor_cliente"),
  sprintsTexto: text("sprints_texto"),
  epicas: text("epicas"),
  avanceCodigoPct: real("avance_codigo_pct"),
  avanceCodigoEvidencia: text("avance_codigo_evidencia"),
  ...appState("No iniciado"),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const historias = sqliteTable(
  "historias",
  {
    id: text("id").primaryKey(), // "HU-001"
    nombre: text("nombre").notNull(),
    epicaId: text("epica_id"),
    epica: text("epica"),
    featureId: text("feature_id"),
    feature: text("feature"),
    prioridad: text("prioridad"),
    sp: integer("sp"),
    sprintId: text("sprint_id").references(() => sprints.id),
    estadoPlan: text("estado_plan"),
    dependencias: text("dependencias"),
    justificacion: text("justificacion"),
    ...appState("No iniciada"),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [index("historias_sprint_idx").on(t.sprintId)],
);

export const tareas = sqliteTable(
  "tareas",
  {
    id: text("id").primaryKey(), // "T-001"
    sprintId: text("sprint_id").references(() => sprints.id),
    fase: text("fase"),
    epicaId: text("epica_id"),
    featureId: text("feature_id"),
    historiaId: text("historia_id").references(() => historias.id),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion"),
    rol: text("rol"),
    tipoTarea: text("tipo_tarea"),
    areaId: text("area_id").notNull().references(() => areas.id),
    fechaInicio: text("fecha_inicio"),
    fechaFin: text("fecha_fin"),
    duracionDias: integer("duracion_dias"),
    rutaCritica: integer("ruta_critica", { mode: "boolean" }).notNull().default(false),
    paraleloCon: text("paralelo_con"),
    /** Días hábiles de la tarea (progress/tareas_dias.csv); pondera el avance por área. */
    diasHabiles: integer("dias_habiles"),
    /**
     * Capa oficial (lo que el cliente ve). Columnas de app: el import nunca las toca.
     * Solo lo publicado cuenta como entregado para el cliente; el estado técnico (estado) es interno.
     */
    publicadoCliente: integer("publicado_cliente", { mode: "boolean" }).notNull().default(false),
    fechaPublicacion: text("fecha_publicacion"),
    notaPublicacion: text("nota_publicacion"),
    ...appState("Pendiente"),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [
    index("tareas_sprint_idx").on(t.sprintId),
    index("tareas_historia_idx").on(t.historiaId),
    index("tareas_area_idx").on(t.areaId),
  ],
);

export const tareaPredecesora = sqliteTable(
  "tarea_predecesora",
  {
    tareaId: text("tarea_id").notNull().references(() => tareas.id),
    predecesoraId: text("predecesora_id").notNull().references(() => tareas.id),
  },
  (t) => [primaryKey({ columns: [t.tareaId, t.predecesoraId] })],
);

export const milestoneHistoria = sqliteTable(
  "milestone_historia",
  {
    milestoneId: text("milestone_id").notNull().references(() => milestones.id),
    historiaId: text("historia_id").notNull().references(() => historias.id),
  },
  (t) => [primaryKey({ columns: [t.milestoneId, t.historiaId] })],
);

export const milestoneTarea = sqliteTable(
  "milestone_tarea",
  {
    milestoneId: text("milestone_id").notNull().references(() => milestones.id),
    tareaId: text("tarea_id").notNull().references(() => tareas.id),
  },
  (t) => [primaryKey({ columns: [t.milestoneId, t.tareaId] })],
);

export const milestoneDependencia = sqliteTable(
  "milestone_dependencia",
  {
    milestoneId: text("milestone_id").notNull().references(() => milestones.id),
    dependeDeId: text("depende_de_id").notNull().references(() => milestones.id),
  },
  (t) => [primaryKey({ columns: [t.milestoneId, t.dependeDeId] })],
);

/**
 * Riesgos del plan (R-0x, Tabla_Riesgos) y de la consolidación (R-N*).
 * `interno` es columna de app: el import solo la inicializa al insertar; el editor la alterna.
 */
export const riesgos = sqliteTable("riesgos", {
  id: text("id").primaryKey(),
  descripcion: text("descripcion").notNull(),
  categoria: text("categoria"),
  probabilidad: text("probabilidad"),
  impacto: text("impacto"),
  mitigacion: text("mitigacion"),
  fuente: text("fuente"),
  interno: integer("interno", { mode: "boolean" }).notNull().default(true),
  actualizadoEn: actualizadoEn(),
});

export const milestoneRiesgo = sqliteTable(
  "milestone_riesgo",
  {
    milestoneId: text("milestone_id").notNull().references(() => milestones.id),
    riesgoId: text("riesgo_id").notNull().references(() => riesgos.id),
  },
  (t) => [primaryKey({ columns: [t.milestoneId, t.riesgoId] })],
);

/** Calendario hábil (progress/calendario_habil.csv): sin fines de semana ni festivos. */
export const calendario = sqliteTable("calendario", {
  fecha: text("fecha").primaryKey(),
  diaSemana: text("dia_semana"),
  esHabil: integer("es_habil", { mode: "boolean" }).notNull(),
  sprintId: text("sprint_id"),
  esJueves: integer("es_jueves", { mode: "boolean" }).notNull().default(false),
});

/** Línea base del avance por área al corte (progress/avance_area.csv). La app recalcula en vivo y la compara. */
export const avanceAreaBase = sqliteTable("avance_area_base", {
  area: text("area").primaryKey(),
  tareasTotal: integer("tareas_total").notNull(),
  tareasPlanificadasHoy: integer("tareas_planificadas_hoy").notNull(),
  tareasHechas: integer("tareas_hechas").notNull(),
  tareasParciales: integer("tareas_parciales").notNull(),
  diasHabilesTotal: integer("dias_habiles_total").notNull(),
  diasHabilesHechos: integer("dias_habiles_hechos").notNull(),
  pctPlanificado: real("pct_planificado").notNull(),
  pctReal: real("pct_real").notNull(),
  brecha: real("brecha").notNull(),
});

/** "Qué verás y cuándo": weeklies de demo (agenda/agenda_weekly.csv). */
export const agendaWeekly = sqliteTable("agenda_weekly", {
  fecha: text("fecha").primaryKey(),
  nHu: integer("n_hu").notNull(),
  spTotal: integer("sp_total").notNull(),
  epicas: text("epicas"),
});

/** HU → weekly en que se demuestra (agenda/agenda_hu.csv). */
export const agendaHu = sqliteTable("agenda_hu", {
  historiaId: text("historia_id").primaryKey().references(() => historias.id),
  fechaWeekly: text("fecha_weekly").notNull(),
  estadoEvidencia: text("estado_evidencia"),
});

/** Ajustes de visibilidad y reglas que controla el editor. */
export const configuracion = sqliteTable("configuracion", {
  clave: text("clave").primaryKey(),
  valor: text("valor").notNull(),
  actualizadoEn: actualizadoEn(),
});

export const ENTIDADES = ["milestone", "historia", "tarea", "nota", "riesgo", "config"] as const;

/** Notas escritas en la app. El import nunca las toca. */
export const notas = sqliteTable(
  "notas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entidadTipo: text("entidad_tipo", { enum: ENTIDADES }).notNull(),
    entidadId: text("entidad_id").notNull(),
    texto: text("texto").notNull(),
    autorRol: text("autor_rol").notNull(),
    visibleCliente: integer("visible_cliente", { mode: "boolean" }).notNull().default(false),
    creadoEn: creadoEn(),
  },
  (t) => [index("notas_entidad_idx").on(t.entidadTipo, t.entidadId)],
);

/** Registro de cambios de estado (app y seed de evidencia). El import nunca la toca. */
export const bitacora = sqliteTable(
  "bitacora",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entidadTipo: text("entidad_tipo", { enum: ENTIDADES }).notNull(),
    entidadId: text("entidad_id").notNull(),
    campo: text("campo").notNull(),
    valorAnterior: text("valor_anterior"),
    valorNuevo: text("valor_nuevo"),
    origen: text("origen", { enum: ESTADO_ORIGEN }).notNull(),
    actorRol: text("actor_rol"),
    detalle: text("detalle"),
    creadoEn: creadoEn(),
  },
  (t) => [index("bitacora_entidad_idx").on(t.entidadTipo, t.entidadId)],
);
