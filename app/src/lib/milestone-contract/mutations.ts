import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Db } from "../../db/client";
import { bitacora, criteriosMilestone, fichasMilestone, metricasMilestone, milestones, TIPOS_METRICA, COMPARADORES_METRICA } from "../../db/schema";
import type { MilestoneDefinition } from "../../db/milestone-schema";
import type { UserRole } from "../auth-constants";
import { hoyIso } from "../dates";
import { HttpError } from "../http-error";
import { fecha, opcion, texto } from "../workflow/validation";
import { EMPTY_DEFINITION, contractPending, metricSatisfied } from "./domain";
import { loadMilestoneContracts } from "./load";
import { booleano, numeroOpcional } from "./validation";
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Context = { tx: Tx; body: Record<string, unknown>; id: string };
const optionalText = (b: Record<string, unknown>, k: string) => texto({ ...b, [k]: b[k] ?? "" }, k, 0);
async function reopen(tx: Tx, id: string) { await tx.update(criteriosMilestone).set({ estado:"Pendiente" }).where(eq(criteriosMilestone.milestoneId,id)); }
async function ficha({ tx, body, id }: Context) {
  const definicion = Object.fromEntries(Object.keys(EMPTY_DEFINITION).map(key => [key, optionalText(body,key)])) as unknown as MilestoneDefinition;
  if (definicion.fechaPrevision) { fecha(body,"fechaPrevision"); texto(body,"motivoPrevision",5); }
  if (!definicion.fechaPrevision && definicion.motivoPrevision) throw new HttpError(422,"El motivo de previsión requiere una fecha");
  const [anterior] = await tx.select().from(fichasMilestone).where(eq(fichasMilestone.milestoneId,id));
  const acceptanceFields = Object.keys(EMPTY_DEFINITION).filter(k => !["fechaPrevision","motivoPrevision","responsable"].includes(k)) as (keyof MilestoneDefinition)[];
  if (acceptanceFields.some(k => anterior?.[k] !== definicion[k])) await reopen(tx,id);
  // No se sobrescribe el JSON heredado; queda como respaldo de su versión original.
  await tx.insert(fichasMilestone).values({ milestoneId:id, contenido:EMPTY_DEFINITION, ...definicion }).onConflictDoUpdate({ target:fichasMilestone.milestoneId, set:definicion });
  return { anterior:anterior ?? null, nuevo:definicion };
}
async function metrica({ tx, body, id }: Context) {
  const metricId = body.metricaId ? texto(body,"metricaId",1,100) : `${id}-${randomUUID()}`;
  const [anterior] = await tx.select().from(metricasMilestone).where(eq(metricasMilestone.id,metricId));
  if (anterior && anterior.milestoneId !== id) throw new HttpError(409,"La métrica pertenece a otro milestone");
  const values = { id:metricId, milestoneId:id, nombre:texto(body,"nombre",3), tipo:opcion(body,"tipo",TIPOS_METRICA) as typeof TIPOS_METRICA[number], unidad:optionalText(body,"unidad"), comparador:opcion(body,"comparador",COMPARADORES_METRICA) as typeof COMPARADORES_METRICA[number], objetivo:numeroOpcional(body,"objetivo"), objetivoCualitativo:optionalText(body,"objetivoCualitativo"), metodo:optionalText(body,"metodo"), tolerancia:numeroOpcional(body,"tolerancia",0), muestraMinima:numeroOpcional(body,"muestraMinima",1,1000000,true), activa:booleano(body,"activa") };
  if (values.tipo === "Cualitativa" && (values.objetivo !== null || values.tolerancia !== null)) throw new HttpError(422,"Una métrica cualitativa utiliza resultado esperado; no meta numérica ni tolerancia");
  if (values.tipo === "Cuantitativa" && values.objetivoCualitativo) throw new HttpError(422,"Una métrica cuantitativa utiliza meta numérica");
  if (!anterior || Object.keys(values).some(k => values[k as keyof typeof values] !== anterior[k as keyof typeof values])) await reopen(tx,id);
  await tx.insert(metricasMilestone).values(values).onConflictDoUpdate({ target:metricasMilestone.id,set:values });
  return { anterior:anterior ?? null,nuevo:values };
}
async function criterio({ tx, body, id }: Context) {
  const criterioId = body.criterioId ? texto(body,"criterioId",1,100) : `${id}-${randomUUID()}`;
  const [anterior] = await tx.select().from(criteriosMilestone).where(eq(criteriosMilestone.id,criterioId));
  if (anterior && anterior.milestoneId !== id) throw new HttpError(409,"El criterio pertenece a otro milestone");
  const estado = opcion(body,"estado",["Pendiente","Verificado"]) as "Pendiente" | "Verificado";
  const metricaId = optionalText(body,"metricaId") || null;
  const contract = (await loadMilestoneContracts(tx as unknown as Db,[{id,criterio:null}]))[id];
  const metric = metricaId ? contract.metricas.find(m => m.id === metricaId) : undefined;
  if (metricaId && !metric) throw new HttpError(422,"La métrica debe pertenecer al mismo milestone");
  const values = { id:criterioId,milestoneId:id,descripcion:texto(body,"descripcion",5),obligatorio:booleano(body,"obligatorio"),evidenciaRequerida:optionalText(body,"evidenciaRequerida"),metricaId,resultadoMedido:numeroOpcional(body,"resultadoMedido"),resultadoCualitativo:optionalText(body,"resultadoCualitativo"),muestraEvaluada:numeroOpcional(body,"muestraEvaluada",1,1000000,true),estado,evidencia:texto(body,"evidencia",estado === "Verificado" ? 5 : 0),aprobador:texto(body,"aprobador",estado === "Verificado" ? 2 : 0,200),fecha:optionalText(body,"fecha") };
  if (!metric && (values.resultadoMedido !== null || values.resultadoCualitativo || values.muestraEvaluada !== null)) throw new HttpError(422,"Vincula una métrica antes de registrar la medición");
  if (metric?.tipo === "Cualitativa" && values.resultadoMedido !== null || metric?.tipo === "Cuantitativa" && values.resultadoCualitativo) throw new HttpError(422,"El resultado debe corresponder al tipo de métrica");
  if (values.fecha) fecha(body,"fecha");
  if (estado === "Verificado") {
    const pending = contractPending({ ...contract,criterios:[...contract.criterios.filter(c=>c.id!==criterioId),values] });
    if (pending.length) throw new HttpError(422,`Completa la configuración antes de aceptar: ${pending.join(", ")}`);
    if (!values.evidenciaRequerida.trim()) throw new HttpError(422,"Define la evidencia requerida del criterio");
    if (values.aprobador !== contract.definicion.aprobador) throw new HttpError(422,"El aprobador debe coincidir con la ficha del milestone");
    if (fecha(body,"fecha") > hoyIso()) throw new HttpError(422,"La aceptación no puede tener fecha futura");
    if (metric && !metricSatisfied(metric,values)) throw new HttpError(422,"La medición no cumple la meta, tolerancia o muestra configurada");
  }
  const definitionKeys = ["descripcion","obligatorio","evidenciaRequerida","metricaId"] as const;
  if (anterior?.estado === "Verificado" && definitionKeys.some(k=>anterior[k]!==values[k])) values.estado="Pendiente";
  await tx.insert(criteriosMilestone).values(values).onConflictDoUpdate({target:criteriosMilestone.id,set:values});
  return { anterior:anterior ?? null,nuevo:values };
}
const handlers: Record<string,(c:Context)=>Promise<{anterior:unknown;nuevo:unknown}>> = { ficha,metrica,criterio };
export async function mutarContrato(db: Db, rol: UserRole, body: Record<string,unknown>) {
  if (rol !== "admin") throw new HttpError(403,"Solo el administrador configura y acepta milestones");
  const id=texto(body,"id",1,40),accion=texto(body,"accion",1,40),handler=handlers[accion];
  if (!handler) throw new HttpError(422,"Acción desconocida");
  return db.transaction(async tx=>{
    const [m]=await tx.select({id:milestones.id}).from(milestones).where(eq(milestones.id,id));
    if (!m) throw new HttpError(404,"Milestone no encontrado");
    const result=await handler({tx,body,id});
    await tx.insert(bitacora).values({entidadTipo:"milestone",entidadId:id,campo:`contrato:${accion}`,valorAnterior:JSON.stringify(result.anterior),valorNuevo:JSON.stringify(result.nuevo),origen:"editor",actorRol:rol});
    return {cambiado:true};
  });
}
