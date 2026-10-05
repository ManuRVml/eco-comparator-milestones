import { sql } from "drizzle-orm";
import type { Db } from "../../src/db/client";
import { bitacora, compromisosSprint, flujoTarea, fuentesPlan, lotesReconciliacion, referenciasPlan, referenciaTarea, tareas } from "../../src/db/schema";
import { ejecucionLegada, normalizarIdentidad } from "../../src/lib/workflow/domain";
import { digest, parseSources, type Bundle, type SourceTask } from "./reconciliation-sources";

export async function simularReconciliacion(db: Db, bundle: Bundle) {
  if (bundle.version !== 1) throw new Error("Versión de paquete no admitida");
  for (const f of bundle.fuentes) if (digest(f.contenido) !== f.huella) throw new Error(`Fuente alterada: ${f.nombre}`);
  const rebuilt = parseSources(bundle.fuentes.map((f) => ({ nombre: f.nombre, contenido: f.contenido })));
  if (digest(JSON.stringify(rebuilt)) !== digest(JSON.stringify(bundle))) throw new Error("El contenido derivado del paquete no corresponde a sus documentos originales");
  const actuales = await db.select().from(tareas);
  function candidatos(t: SourceTask) {
    return actuales.filter((a) => normalizarIdentidad(a.nombre) === normalizarIdentidad(t.nombre) && normalizarIdentidad(a.descripcion ?? "") === normalizarIdentidad(t.descripcion) && a.historiaId === t.hu && normalizarIdentidad(a.rol ?? "") === normalizarIdentidad(t.rol));
  }
  const correspondencias = bundle.tareas.map((t) => {
    const matches = candidatos(t);
    return { referencia: `${t.fuenteId}:${t.idOrigen}`, origen: t.idOrigen, nombre: t.nombre, tareaId: matches.length === 1 ? matches[0].id : null, fechasBase: matches.length === 1 ? [matches[0].fechaInicio, matches[0].fechaFin] : [], fechasFuente: [t.inicio, t.fin], decision: matches.length === 1 ? "Coincidencia de nombre, descripción, HU y rol" : "Pendiente de revisión" };
  });
  const used = new Set(correspondencias.map((c) => c.tareaId).filter(Boolean));
  return { tareasActuales: actuales.length, tareasFuente: bundle.tareas.length, correspondencias, adicionalesConservadas: actuales.filter((a) => !used.has(a.id)).map((a) => ({ id: a.id, nombre: a.nombre })), prerrequisitosSinAsignar: bundle.prerrequisitos.length, hitos: bundle.hitos.length, cambiosEstados: 0, cambiosPublicaciones: 0, cambiosFechasBase: 0 };
}

export async function aplicarReconciliacion(db: Db, bundle: Bundle, activar = true) {
  const simulation = await simularReconciliacion(db, bundle);
  const huella = digest(JSON.stringify(bundle)), loteId = `reconciliacion:${huella}`;
  return db.transaction(async (tx) => {
    const previous = await tx.all<{ id: string }>(sql`select id from lotes_reconciliacion where id=${loteId}`);
    if (previous.length) return { aplicado: false, loteId, simulation };
    const tables = await tx.all<{ name: string }>(sql`select name from sqlite_master where type='table' and name not like 'sqlite_%' and name not like '__drizzle%' order by name`);
    const inventory: Record<string, unknown> = {};
    for (const { name } of tables) inventory[name] = await tx.all(sql.raw(`select * from "${name}" order by rowid`));
    await tx.insert(lotesReconciliacion).values({ id: loteId, huella, inventario: JSON.stringify(inventory), activo: activar });
    for (const fuente of bundle.fuentes) await tx.insert(fuentesPlan).values(fuente).onConflictDoNothing();
    for (const t of bundle.tareas) {
      const c = simulation.correspondencias.find((m) => m.origen === t.idOrigen && m.referencia.startsWith(t.fuenteId + ":"))!;
      await tx.insert(referenciasPlan).values({ id: c.referencia, fuenteId: t.fuenteId, idOrigen: t.idOrigen, nombre: t.nombre, contenido: t.contenido, decision: c.decision }).onConflictDoNothing();
      if (c.tareaId) await tx.insert(referenciaTarea).values({ referenciaId: c.referencia, tareaId: c.tareaId, criterio: c.decision }).onConflictDoNothing();
    }
    for (const r of bundle.prerrequisitos) await tx.insert(referenciasPlan).values({ id: `${r.fuenteId}:${r.idOrigen}`, ...r }).onConflictDoNothing();
    for (const h of bundle.hitos) await tx.insert(compromisosSprint).values({ id: `${h.fuenteId}:${h.idOrigen}`, fuenteId: h.fuenteId, sprintId: h.sprintId, resultado: h.resultado, criterio: h.criterio, fechaBase: h.fechaBase }).onConflictDoNothing();
    // Solo inicializa ejecución a partir del estado legado. No se crean validaciones ni publicaciones.
    for (const t of await tx.select().from(tareas)) await tx.insert(flujoTarea).values({ tareaId: t.id, ejecucion: ejecucionLegada(t.estado) }).onConflictDoNothing();
    await tx.insert(bitacora).values({ entidadTipo: "config", entidadId: loteId, campo: "reconciliacion", origen: "editor", actorRol: "admin", valorNuevo: JSON.stringify({ tareasFuente: simulation.tareasFuente, conservadas: simulation.tareasActuales, activo: activar }), detalle: "Importación aditiva de fuentes y correspondencias; sin modificación de estados, fechas o publicaciones" });
    return { aplicado: true, loteId, simulation };
  });
}
