import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  bitacora,
  configuracion,
  ESTADOS_HISTORIA,
  ESTADOS_TAREA,
  historias,
  milestones,
  notas,
  riesgos,
  tareas,
} from "@/db/schema";
import type { UserRole } from "@/lib/auth-constants";
import { hoyIso } from "@/lib/dates";
import { CONFIG_DEFAULTS, ESTADOS_MILESTONE } from "@/lib/model";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const ahora = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;
export const AUTOMATICO = "Automático";
const MIN_EVIDENCIA = 5;

type EntidadEstado = "tarea" | "historia" | "milestone";

const TABLAS = { tarea: tareas, historia: historias, milestone: milestones } as const;

function str(v: unknown, campo: string, max = 2000): string {
  if (typeof v !== "string") throw new HttpError(400, `Falta ${campo}`);
  const s = v.trim();
  if (s.length > max) throw new HttpError(400, `${campo} supera ${max} caracteres`);
  return s;
}

function tipoEstado(v: unknown): EntidadEstado {
  if (v === "tarea" || v === "historia" || v === "milestone") return v;
  throw new HttpError(400, "Tipo de entidad inválido");
}

/** Estado que exige evidencia para cerrarse: una tarea "Hecha" o una HU "Aceptada". */
export function requiereEvidencia(tipo: EntidadEstado, estado: string) {
  return (tipo === "tarea" && estado === "Hecha") || (tipo === "historia" && estado === "Aceptada");
}

export async function cambiarEstado(rol: UserRole, body: Record<string, unknown>) {
  const tipo = tipoEstado(body.tipo);
  const id = str(body.id, "id", 40);
  const estado = str(body.estado, "estado", 40);
  const evidencia = typeof body.evidencia === "string" ? body.evidencia.trim().slice(0, 2000) : "";
  const permitidos: readonly string[] =
    tipo === "tarea" ? ESTADOS_TAREA : tipo === "historia" ? ESTADOS_HISTORIA : [...ESTADOS_MILESTONE, AUTOMATICO];
  if (!permitidos.includes(estado)) throw new HttpError(400, `Estado "${estado}" no válido para ${tipo}`);
  if (requiereEvidencia(tipo, estado) && evidencia.length < MIN_EVIDENCIA) {
    throw new HttpError(422, "Para marcar como cumplido se requiere evidencia (pantalla, endpoint, job o enlace).");
  }
  const table = TABLAS[tipo];
  const hoy = hoyIso();

  return db.transaction(async (tx) => {
    const [actual] = await tx
      .select({ estado: table.estado, origen: table.estadoOrigen, evidencia: table.evidencia })
      .from(table)
      .where(eq(table.id, id));
    if (!actual) throw new HttpError(404, `${id} no existe`);

    const anterior = tipo === "milestone" && actual.origen !== "editor" ? AUTOMATICO : actual.estado;
    const cambiaEvidencia = evidencia !== "" && evidencia !== (actual.evidencia ?? "");
    if (anterior === estado && !cambiaEvidencia) return { cambiado: false };

    const cerrado = estado === "Hecha" || estado === "Aceptada";
    if (tipo === "milestone" && estado === AUTOMATICO) {
      await tx.update(milestones).set({ estado: "No iniciado", estadoOrigen: "plan", fechaEstado: hoy, actualizadoEn: ahora }).where(eq(milestones.id, id));
    } else {
      await tx
        .update(table)
        .set({
          estado,
          estadoOrigen: "editor",
          fechaEstado: hoy,
          fechaCierre: cerrado ? hoy : null,
          ...(cambiaEvidencia ? { evidencia } : {}),
          actualizadoEn: ahora,
        })
        .where(eq(table.id, id));
    }
    if (anterior !== estado) {
      await tx.insert(bitacora).values({
        entidadTipo: tipo,
        entidadId: id,
        campo: "estado",
        valorAnterior: anterior,
        valorNuevo: estado,
        origen: "editor",
        actorRol: rol,
        detalle: cambiaEvidencia ? `Evidencia: ${evidencia}` : null,
      });
    }
    if (cambiaEvidencia) {
      await tx.insert(bitacora).values({
        entidadTipo: tipo,
        entidadId: id,
        campo: "evidencia",
        valorAnterior: actual.evidencia,
        valorNuevo: evidencia,
        origen: "editor",
        actorRol: rol,
      });
    }
    return { cambiado: true };
  });
}

export async function agregarNota(rol: UserRole, body: Record<string, unknown>) {
  const entidadTipo = tipoEstado(body.entidadTipo);
  const entidadId = str(body.entidadId, "entidadId", 40);
  const texto = str(body.texto, "texto", 2000);
  if (texto.length < 2) throw new HttpError(400, "La nota está vacía");
  const visibleCliente = body.visibleCliente === true;
  const table = TABLAS[entidadTipo];
  return db.transaction(async (tx) => {
    const [existe] = await tx.select({ id: table.id }).from(table).where(eq(table.id, entidadId));
    if (!existe) throw new HttpError(404, `${entidadId} no existe`);
    const [nota] = await tx
      .insert(notas)
      .values({ entidadTipo, entidadId, texto, autorRol: rol, visibleCliente })
      .returning({ id: notas.id });
    await tx.insert(bitacora).values({
      entidadTipo,
      entidadId,
      campo: visibleCliente ? "nota (visible para el equipo Ecopetrol)" : "nota interna",
      valorAnterior: null,
      valorNuevo: texto,
      origen: "editor",
      actorRol: rol,
      detalle: `nota #${nota.id}`,
    });
    return { id: nota.id };
  });
}

const siNo = (b: boolean) => (b ? "Visible" : "Oculto");

export async function cambiarVisibilidad(rol: UserRole, body: Record<string, unknown>) {
  const tipo = body.tipo;
  const visible = body.visible === true;
  return db.transaction(async (tx) => {
    let anterior: boolean;
    let entidadTipo: "tarea" | "historia" | "milestone" | "nota" | "riesgo";
    let entidadId: string;
    if (tipo === "tarea" || tipo === "historia" || tipo === "milestone") {
      const table = TABLAS[tipo];
      entidadTipo = tipo;
      entidadId = str(body.id, "id", 40);
      const [row] = await tx.select({ v: table.visibleCliente }).from(table).where(eq(table.id, entidadId));
      if (!row) throw new HttpError(404, `${entidadId} no existe`);
      anterior = row.v;
      if (anterior !== visible) await tx.update(table).set({ visibleCliente: visible, actualizadoEn: ahora }).where(eq(table.id, entidadId));
    } else if (tipo === "nota") {
      const idNum = Number(body.id);
      if (!Number.isInteger(idNum)) throw new HttpError(400, "id de nota inválido");
      entidadTipo = "nota";
      entidadId = String(idNum);
      const [row] = await tx.select({ v: notas.visibleCliente }).from(notas).where(eq(notas.id, idNum));
      if (!row) throw new HttpError(404, `nota ${idNum} no existe`);
      anterior = row.v;
      if (anterior !== visible) await tx.update(notas).set({ visibleCliente: visible }).where(eq(notas.id, idNum));
    } else if (tipo === "riesgo") {
      entidadTipo = "riesgo";
      entidadId = str(body.id, "id", 40);
      const [row] = await tx.select({ interno: riesgos.interno }).from(riesgos).where(eq(riesgos.id, entidadId));
      if (!row) throw new HttpError(404, `${entidadId} no existe`);
      anterior = !row.interno;
      if (anterior !== visible) await tx.update(riesgos).set({ interno: !visible, actualizadoEn: ahora }).where(eq(riesgos.id, entidadId));
    } else {
      throw new HttpError(400, "Tipo de entidad inválido");
    }
    if (anterior === visible) return { cambiado: false };
    await tx.insert(bitacora).values({
      entidadTipo,
      entidadId,
      campo: "visibilidad para el equipo Ecopetrol",
      valorAnterior: siNo(anterior),
      valorNuevo: siNo(visible),
      origen: "editor",
      actorRol: rol,
    });
    return { cambiado: true };
  });
}

export async function cambiarConfig(rol: UserRole, body: Record<string, unknown>) {
  const clave = str(body.clave, "clave", 60);
  if (!(clave in CONFIG_DEFAULTS)) throw new HttpError(400, "Ajuste desconocido");
  const valor = body.valor === "1" || body.valor === true ? "1" : "0";
  return db.transaction(async (tx) => {
    const [row] = await tx.select({ valor: configuracion.valor }).from(configuracion).where(eq(configuracion.clave, clave));
    const anterior = row?.valor ?? CONFIG_DEFAULTS[clave as keyof typeof CONFIG_DEFAULTS];
    if (anterior === valor && row) return { cambiado: false };
    await tx
      .insert(configuracion)
      .values({ clave, valor })
      .onConflictDoUpdate({ target: configuracion.clave, set: { valor, actualizadoEn: ahora } });
    if (anterior === valor) return { cambiado: false };
    await tx.insert(bitacora).values({
      entidadTipo: "config",
      entidadId: clave,
      campo: "ajuste",
      valorAnterior: anterior === "1" ? "Activado" : "Desactivado",
      valorNuevo: valor === "1" ? "Activado" : "Desactivado",
      origen: "editor",
      actorRol: rol,
    });
    return { cambiado: true };
  });
}

/**
 * Capa oficial (editor o admin): «Aprobar y publicar» una tarea o un milestone para el equipo Ecopetrol, con la
 * fecha en que se completó (por defecto hoy, nunca futura) y una nota de entrega; o retirar la publicación.
 * Una tarea solo se publica si su estado técnico es Hecha. Todo queda en la bitácora con rol y fecha.
 */
export async function cambiarPublicacion(rol: UserRole, body: Record<string, unknown>) {
  const tipo = body.tipo === "milestone" ? "milestone" : "tarea";
  const id = str(body.id, "id", 40);
  const publicar = body.publicar === true;
  const nota = typeof body.nota === "string" ? body.nota.trim().slice(0, 300) : "";
  const hoy = hoyIso();
  const fecha = typeof body.fecha === "string" && body.fecha ? body.fecha : hoy;
  if (publicar && (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha > hoy)) throw new HttpError(422, "La fecha de entrega debe ser válida y no futura.");
  if (publicar && nota.length < 5) throw new HttpError(422, "Escribe la nota de entrega para el equipo Ecopetrol (p. ej. «Demostrado en weekly 15/10»).");

  return db.transaction(async (tx) => {
    let antes: string;
    if (tipo === "tarea") {
      const [t] = await tx.select({ estado: tareas.estado, pub: tareas.publicadoCliente, nota: tareas.notaPublicacion }).from(tareas).where(eq(tareas.id, id));
      if (!t) throw new HttpError(404, `${id} no existe`);
      if (publicar === t.pub) return { cambiado: false };
      if (publicar && t.estado !== "Hecha") throw new HttpError(422, "Solo se publican tareas en estado Hecha.");
      antes = t.nota ?? "";
      await tx
        .update(tareas)
        .set(publicar ? { publicadoCliente: true, fechaPublicacion: fecha, notaPublicacion: nota, actualizadoEn: ahora } : { publicadoCliente: false, fechaPublicacion: null, notaPublicacion: null, actualizadoEn: ahora })
        .where(eq(tareas.id, id));
    } else {
      const [m] = await tx.select({ estado: milestones.estado, origen: milestones.estadoOrigen, ev: milestones.evidencia, cierre: milestones.fechaCierre }).from(milestones).where(eq(milestones.id, id));
      if (!m) throw new HttpError(404, `${id} no existe`);
      const publicado = m.origen === "editor" && m.estado === "Cumplido" && !!m.cierre;
      if (publicar === publicado) return { cambiado: false };
      antes = m.ev ?? "";
      await tx
        .update(milestones)
        .set(
          publicar
            ? { estado: "Cumplido", estadoOrigen: "editor", fechaCierre: fecha, fechaEstado: hoy, evidencia: nota, actualizadoEn: ahora }
            : { estado: "No iniciado", estadoOrigen: "plan", fechaCierre: null, fechaEstado: hoy, evidencia: null, actualizadoEn: ahora },
        )
        .where(eq(milestones.id, id));
    }
    await tx.insert(bitacora).values({
      entidadTipo: tipo,
      entidadId: id,
      campo: CAMPO_PUBLICACION,
      valorAnterior: publicar ? "No publicada" : "Publicada",
      valorNuevo: publicar ? "Publicada" : "Retirada",
      origen: "editor",
      actorRol: rol,
      detalle: publicar ? `${nota} · completada el ${fecha}` : `Se retira: ${antes}`,
    });
    return { cambiado: true };
  });
}

export const CAMPO_PUBLICACION = "publicación al equipo Ecopetrol";

/** Versión de datos para el polling de la vista de consulta: cambia con cada escritura en la bitácora. */
export async function versionDatos(): Promise<string> {
  const [row] = await db.select({ v: sql<number>`coalesce(max(${bitacora.id}), 0)` }).from(bitacora);
  return String(row?.v ?? 0);
}