"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/data";
import { createPendiente, LADOS_PENDIENTE, resolvePendiente, TIPOS_PENDIENTE } from "@/lib/pendientes";
import { HttpError } from "@/lib/http-error";
import { fecha, opcion, texto } from "@/lib/workflow/validation";

function campo(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createPendienteAction(formData: FormData) {
  const session = await requireSession();
  if (!session.canEdit) throw new HttpError(403, "Tu rol es de solo lectura");

  const body = Object.fromEntries(formData.entries());
  const titulo = texto(body, "titulo", 1, 200);
  const lado = opcion(body, "lado", LADOS_PENDIENTE) as (typeof LADOS_PENDIENTE)[number];
  const rawTipo = campo(formData, "tipo") || "otro";
  const tipo = opcion({ tipo: rawTipo }, "tipo", TIPOS_PENDIENTE) as (typeof TIPOS_PENDIENTE)[number];
  const detalle = campo(formData, "detalle").trim() || null;
  const responsable = campo(formData, "responsable").trim() || null;
  const milestoneId = campo(formData, "milestone_id").trim() || null;
  const fechaLimite = campo(formData, "fecha_limite").trim();
  if (fechaLimite) fecha({ fecha_limite: fechaLimite }, "fecha_limite");

  await createPendiente({ titulo, lado, tipo, detalle, responsable, milestoneId, fechaLimite: fechaLimite || null });
  revalidatePath("/pendientes");
}

export async function resolvePendienteAction(formData: FormData) {
  const session = await requireSession();
  if (!session.canEdit) throw new HttpError(403, "Tu rol es de solo lectura");

  const id = texto({ id: campo(formData, "id") }, "id", 1, 100);
  await resolvePendiente(id);
  revalidatePath("/pendientes");
}
