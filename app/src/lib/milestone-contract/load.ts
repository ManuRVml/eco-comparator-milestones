import { sql } from "drizzle-orm";
import type { Db } from "../../db/client";
import { fichasMilestone, criteriosMilestone } from "../../db/schema";
import { EMPTY_DEFINITION, type MilestoneContract } from "./domain";

export async function loadMilestoneContracts(db: Db, milestones: { id: string; criterio: string | null }[]): Promise<Record<string, MilestoneContract>> {
  const exists = await db.all(sql`select name from sqlite_master where type='table' and name='fichas_milestone'`);
  const [fichas, criterios] = exists.length ? await Promise.all([db.select().from(fichasMilestone), db.select().from(criteriosMilestone)]) : [[], []];
  return Object.fromEntries(milestones.map((m) => {
    const rows = criterios.filter((c) => c.milestoneId === m.id);
    return [m.id, { definicion: fichas.find((f) => f.milestoneId === m.id)?.contenido ?? { ...EMPTY_DEFINITION }, criterios: rows.length ? rows : m.criterio?.trim() ? [{ id: `${m.id}-C01`, milestoneId: m.id, descripcion: m.criterio, obligatorio: true, estado: "Pendiente" as const, evidencia: "", aprobador: "", fecha: "" }] : [] }];
  }));
}
