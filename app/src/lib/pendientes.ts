import "server-only";

import { randomUUID } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { pendientes, type NewPendiente } from "@/db/schema";
import type { Session } from "@/lib/data";

export const LADOS_PENDIENTE = ["externo", "interno"] as const;
export const TIPOS_PENDIENTE = ["licencia", "creditos", "acceso", "informacion", "decision", "otro"] as const;
export type LadoPendiente = (typeof LADOS_PENDIENTE)[number];
export type TipoPendiente = (typeof TIPOS_PENDIENTE)[number];

export async function listPendientes(filtros: { lado?: LadoPendiente; estado?: "abierto" | "resuelto" } = {}) {
  const condiciones = [];
  if (filtros.lado) condiciones.push(eq(pendientes.lado, filtros.lado));
  if (filtros.estado) condiciones.push(eq(pendientes.estado, filtros.estado));

  return db
    .select()
    .from(pendientes)
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(sql`case when ${pendientes.estado} = 'abierto' then 0 else 1 end`, asc(pendientes.fechaLimite));
}

export type CreatePendienteInput = Pick<NewPendiente, "titulo" | "lado" | "tipo"> &
  Partial<Pick<NewPendiente, "detalle" | "responsable" | "milestoneId" | "fechaLimite">>;

export async function createPendiente(input: CreatePendienteInput) {
  const values: NewPendiente = { id: randomUUID(), ...input };
  await db.insert(pendientes).values(values);
  return values.id;
}

export async function resolvePendiente(id: string) {
  await db.update(pendientes).set({ estado: "resuelto", resueltoEn: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))` }).where(eq(pendientes.id, id));
}

export async function pendientesVisibles(session: Session) {
  return session.canEdit ? listPendientes() : listPendientes({ lado: "externo" });
}
