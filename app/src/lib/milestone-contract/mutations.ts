import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Db } from "../../db/client";
import { bitacora, criteriosMilestone, fichasMilestone, milestones } from "../../db/schema";
import type { MilestoneDefinition } from "../../db/milestone-schema";
import type { UserRole } from "../auth-constants";
import { hoyIso } from "../dates";
import { HttpError } from "../http-error";
import { fecha, opcion, texto } from "../workflow/validation";
import { EMPTY_DEFINITION, definitionPending } from "./domain";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Context = { tx: Tx; rol: UserRole; body: Record<string, unknown>; id: string };
async function ficha({ tx, body, id }: Context) {
  const definicion = Object.fromEntries(Object.keys(EMPTY_DEFINITION).map((key) => [key, texto(body, key, 0)])) as unknown as MilestoneDefinition;
  if (definicion.fechaPrevision) {
    fecha(body, "fechaPrevision"); texto(body, "motivoPrevision", 5);
  }
  const [anterior] = await tx.select().from(fichasMilestone).where(eq(fichasMilestone.milestoneId, id));
  const changesAcceptance = ["job", "outcome", "meta", "fueraAlcance", "aprobador"].some((key) => anterior?.contenido[key as keyof MilestoneDefinition] !== definicion[key as keyof MilestoneDefinition]);
  if (changesAcceptance) await tx.update(criteriosMilestone).set({ estado: "Pendiente" }).where(eq(criteriosMilestone.milestoneId, id));
  await tx.insert(fichasMilestone).values({ milestoneId: id, contenido: definicion }).onConflictDoUpdate({ target: fichasMilestone.milestoneId, set: { contenido: definicion } });
  return { anterior: anterior?.contenido ?? EMPTY_DEFINITION, nuevo: definicion };
}
async function criterio({ tx, rol, body, id }: Context) {
  const criterioId = typeof body.criterioId === "string" && body.criterioId ? texto(body, "criterioId", 1, 100) : `${id}-${randomUUID()}`;
  const [anterior] = await tx.select().from(criteriosMilestone).where(eq(criteriosMilestone.id, criterioId));
  if (anterior && anterior.milestoneId !== id) throw new HttpError(409, "El criterio pertenece a otro milestone");
  const estado = opcion(body, "estado", ["Pendiente", "Verificado"]) as "Pendiente" | "Verificado";
  if (rol !== "admin" && (estado === "Verificado" || anterior?.estado === "Verificado")) throw new HttpError(403, "Solo el administrador registra o revisa la aceptación del negocio");
  const values = { id: criterioId, milestoneId: id, descripcion: texto(body, "descripcion", 5), obligatorio: body.obligatorio !== false, estado, evidencia: texto(body, "evidencia", estado === "Verificado" ? 5 : 0), aprobador: texto(body, "aprobador", estado === "Verificado" ? 2 : 0, 200), fecha: texto(body, "fecha", 0, 10) };
  if (estado === "Verificado") {
    const [f] = await tx.select().from(fichasMilestone).where(eq(fichasMilestone.milestoneId, id));
    if (!f || definitionPending(f.contenido).length) throw new HttpError(422, "Completa job, outcome, meta, alcance, responsable y aprobador antes de aceptar");
    if (values.aprobador !== f.contenido.aprobador) throw new HttpError(422, "El aprobador debe coincidir con la ficha del milestone");
    if (fecha(body, "fecha") > hoyIso()) throw new HttpError(422, "La aceptación no puede tener fecha futura");
  }
  if (anterior?.estado === "Verificado" && (anterior.descripcion !== values.descripcion || anterior.obligatorio !== values.obligatorio)) values.estado = "Pendiente";
  await tx.insert(criteriosMilestone).values(values).onConflictDoUpdate({ target: criteriosMilestone.id, set: values });
  return { anterior: anterior ?? null, nuevo: values };
}
const handlers: Record<string, (c: Context) => Promise<{ anterior: unknown; nuevo: unknown }>> = { ficha, criterio };
export async function mutarContrato(db: Db, rol: UserRole, body: Record<string, unknown>) {
  if (!["admin", "editor"].includes(rol)) throw new HttpError(403, "Rol de consulta");
  const id = texto(body, "id", 1, 40), accion = texto(body, "accion", 1, 40), handler = handlers[accion];
  if (!handler) throw new HttpError(422, "Acción desconocida");
  return db.transaction(async (tx) => {
    const [m] = await tx.select({ id: milestones.id }).from(milestones).where(eq(milestones.id, id));
    if (!m) throw new HttpError(404, "Milestone no encontrado");
    const result = await handler({ tx, rol, body, id });
    await tx.insert(bitacora).values({ entidadTipo: "milestone", entidadId: id, campo: `contrato:${accion}`, valorAnterior: JSON.stringify(result.anterior), valorNuevo: JSON.stringify(result.nuevo), origen: "editor", actorRol: rol });
    return { cambiado: true };
  });
}
