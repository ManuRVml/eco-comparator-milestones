import "server-only";

import { connection } from "next/server";
import { redirect } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { bitacora, type ENTIDADES } from "@/db/schema";
import { getRole } from "@/lib/auth";
import type { UserRole } from "@/lib/auth-constants";
import { hoyIso } from "@/lib/dates";
import { loadRaw } from "@/lib/load";
import { computeModel, type Model, vistaCliente } from "@/lib/model";
import { loadWorkflow } from "@/lib/workflow/load";

export interface Session {
  role: UserRole;
  canEdit: boolean;
  /** Solo el admin verifica y publica al equipo Ecopetrol. */
  isAdmin: boolean;
}

export async function requireSession(): Promise<Session> {
  const role = await getRole();
  if (!role) redirect("/login");
  return { role, canEdit: role === "editor" || role === "admin", isAdmin: role === "admin" };
}

/** Bitácora (solo equipo). */
export async function getBitacora(session: Session, f: { tipo?: string | null; entidadId?: string | null; limit?: number; offset?: number } = {}) {
  if (!session.canEdit) return { rows: [], total: 0 };
  const conds = [];
  if (f.tipo) conds.push(eq(bitacora.entidadTipo, f.tipo as (typeof ENTIDADES)[number]));
  if (f.entidadId) conds.push(eq(bitacora.entidadId, f.entidadId));
  const where = conds.length ? and(...conds) : undefined;
  const [rows, [{ n }]] = await Promise.all([
    db
      .select()
      .from(bitacora)
      .where(where)
      .orderBy(desc(bitacora.id))
      .limit(f.limit ?? 50)
      .offset(f.offset ?? 0),
    db.select({ n: sql<number>`count(*)` }).from(bitacora).where(where),
  ]);
  return { rows, total: n };
}

/**
 * Equipo Ecopetrol: capa OFICIAL (solo lo publicado) filtrada por visibilidad.
 * Editor/admin: capa TÉCNICA completa + números oficiales al lado.
 */
export async function getModel(session: Session): Promise<Model> {
  await connection();
  const raw = await loadRaw(db);
  const hoy = hoyIso();
  if (!session.canEdit) return vistaCliente(computeModel(raw, hoy, "oficial"));
  const tecnico = computeModel(raw, hoy, "tecnica");
  const oficial = computeModel(raw, hoy, "oficial");
  return { ...tecnico, workflow: await loadWorkflow(db), oficial: { total: oficial.total, kpis: oficial.kpis, areaResumen: oficial.areaResumen } };
}
