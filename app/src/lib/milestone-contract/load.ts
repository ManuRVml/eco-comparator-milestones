import { sql } from "drizzle-orm";
import type { Db } from "../../db/client";
import { fichasMilestone, criteriosMilestone, decisionesPendientes, metricasMilestone } from "../../db/schema";
import { EMPTY_DEFINITION, type MilestoneContract } from "./domain";
export async function loadMilestoneContracts(db: Db, milestones: { id: string; criterio: string | null }[]): Promise<Record<string, MilestoneContract>> {
  const ready = await db.all(sql`select name from sqlite_master where type='table' and name='metricas_milestone'`);
  const [fichas, criterios, metricas] = ready.length ? await Promise.all([db.select().from(fichasMilestone), db.select().from(criteriosMilestone), db.select().from(metricasMilestone)]) : [[], [], []];
  const decisionsReady = await db.all(sql`select name from sqlite_master where type='table' and name='decisiones_pendientes'`);
  const decisiones = decisionsReady.length ? await db.select().from(decisionesPendientes) : [];
  return Object.fromEntries(milestones.map(m => {
    const f = fichas.find(f => f.milestoneId === m.id), rows = criterios.filter(c => c.milestoneId === m.id);
    const definicion = f ? Object.fromEntries(Object.keys(EMPTY_DEFINITION).map(key => [key, f[key as keyof typeof EMPTY_DEFINITION]])) as unknown as typeof EMPTY_DEFINITION : { ...EMPTY_DEFINITION };
    return [m.id, { definicion, metricas: metricas.filter(v => v.milestoneId === m.id), criterios: rows.length ? rows : m.criterio?.trim() ? [{ id: `${m.id}-C01`, milestoneId: m.id, descripcion: m.criterio, obligatorio: true, evidenciaRequerida: "", metricaId: null, resultadoMedido: null, resultadoCualitativo: "", muestraEvaluada: null, estado: "Pendiente" as const, evidencia: "", aprobador: "", fecha: "" }] : [], decisionesPendientes: decisiones.filter(d => d.milestoneId === m.id) }];
  }));
}
