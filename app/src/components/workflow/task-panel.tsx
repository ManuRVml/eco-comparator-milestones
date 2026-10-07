import { Card } from "../ui";
import { WorkflowForm, type Field } from "../editor/workflow-form";
import type { Model, Tarea } from "../../lib/model";
import { AFECTA, EJECUCIONES, ETAPAS, RELACIONES, RESULTADOS, SEVERIDADES, ejecucionLegada } from "../../lib/workflow/domain";

export function TaskWorkflow({ tarea: t, model }: { tarea: Tarea; model: Model }) {
  const w = model.workflow;
  if (!w?.activo) return null;
  const f = w.flujos.find((f) => f.tareaId === t.id), blocks = w.bloqueos.filter((b) => b.tareaId === t.id);
  const refs = w.correspondencias.filter((r) => r.tareaId === t.id).map((r) => w.referencias.find((v) => v.id === r.referenciaId)).filter((r) => !!r);
  const base: Record<string, unknown> = { id: t.id };
  const execution: Field[] = [
    { name: "ejecucion", label: "Ejecución", options: EJECUCIONES, value: f?.ejecucion ?? ejecucionLegada(t.estado) },
    { name: "responsable", label: "Responsable", value: f?.responsable ?? "" },
    { name: "insumos", label: "Insumos disponibles y limitaciones", multiline: true, value: f?.insumos ?? "" },
    { name: "criterio", label: "Criterio verificable", multiline: true, value: f?.criterio ?? "" },
    { name: "entregaParcial", label: "Entrega mínima útil", multiline: true, value: f?.entregaParcial ?? "" },
    { name: "prevision", label: "Previsión de terminación", type: "date", value: f?.prevision ?? t.fechaFin ?? "" },
    { name: "prioridad", label: "Prioridad (mayor número, primero)", type: "number", value: f?.prioridad ?? 0 },
  ];
  return <Card kicker="TRABAJO EN PARALELO · SOLO EQUIPO" title="Ejecución, validación e insumos">
    <p className="muted small">La fecha base y el estado técnico conservan su historial. Una implementación terminada puede esperar integración o aceptación.</p>
    <WorkflowForm title="Preparar y ejecutar" endpoint="/api/editor/flujo" fixed={{ ...base, accion: "flujo" }} fields={execution} />
    <div className="workflow-validations">{ETAPAS.map((etapa) => {
      const v = w.validaciones.find((v) => v.tareaId === t.id && v.etapa === etapa);
      return <p key={etapa}><b>{etapa}:</b> {v?.resultado ?? "Sin verificar"}{v ? ` · ${v.evidencia}` : ""}</p>;
    })}</div>
    <WorkflowForm title="Registrar validación" endpoint="/api/editor/flujo" fixed={{ ...base, accion: "validar" }} fields={[
      { name: "etapa", label: "Etapa", options: ETAPAS }, { name: "resultado", label: "Resultado", options: RESULTADOS }, { name: "evidencia", label: "Evidencia o justificación de No aplica", multiline: true },
    ]} />
    <h4>Bloqueos e incidentes</h4>
    {blocks.length === 0 && <p className="muted small">Sin bloqueos registrados.</p>}
    {blocks.map((b) => <div className="workflow-block" key={b.id}>
      <p><b>{b.tipo} · {b.severidad} · {b.afecta}</b> — {b.descripcion}</p>
      <p className="small">Responsable: {b.responsable} · Revisión: {b.revision} · Esfuerzo: {b.esfuerzoMinutos} min</p>
      <p className="small">Criterio de liberación: {b.criterioLiberacion}</p>
      {b.resueltoEn ? <p className="small">Resuelto el {b.resueltoEn}: {b.resolucion}</p> : <WorkflowForm title={`Resolver bloqueo ${b.id}`} endpoint="/api/editor/flujo" fixed={{ ...base, accion: "resolver", bloqueoId: b.id }} fields={[{ name: "resolucion", label: "Evidencia de resolución", multiline: true }, { name: "esfuerzoMinutos", label: "Esfuerzo total en minutos", type: "number", value: b.esfuerzoMinutos }]} submit="Resolver" />}
    </div>)}
    <WorkflowForm title="Registrar bloqueo o incidente" endpoint="/api/editor/flujo" fixed={{ ...base, accion: "bloquear" }} fields={[
      { name: "tipo", label: "Tipo", options: ["Bloqueo", "Incidente"] }, { name: "afecta", label: "Qué momento afecta", options: AFECTA },
      { name: "descripcion", label: "Insumo pendiente e impacto", multiline: true }, { name: "responsable", label: "Responsable de resolver", value: "" },
      { name: "revision", label: "Próxima revisión", type: "date", value: model.hoy }, { name: "criterioLiberacion", label: "Qué permite liberar el trabajo", multiline: true },
      { name: "severidad", label: "Severidad", options: SEVERIDADES, value: "Media" }, { name: "esfuerzoMinutos", label: "Esfuerzo en minutos", type: "number", value: 0 },
    ]} />
    <h4>Relaciones operativas</h4>
    <p className="muted small">Las predecesoras del plan siguen disponibles como referencia. Cada relación operativa especifica el insumo requerido.</p>
    {w.relaciones.filter((r) => r.tareaId === t.id).map((r) => <p key={r.id} className="small"><b>{r.proveedorId} · {r.tipo} · {r.afecta}</b> — {r.insumo}. {r.disponible ? `Disponible: ${r.evidencia}` : "Pendiente"}. Criterio: {r.criterio}</p>)}
    <WorkflowForm title="Acordar o actualizar un insumo" endpoint="/api/editor/plan" fixed={{ ...base, accion: "relacion" }} fields={[
      { name: "proveedorId", label: "Actividad proveedora", options: model.tareas.filter((v) => v.id !== t.id).map((v) => ({ value: v.id, label: `${v.id} · ${v.nombre}` })) }, { name: "tipo", label: "Relación", options: RELACIONES, value: "Coordinación" },
      { name: "afecta", label: "Momento requerido", options: AFECTA }, { name: "insumo", label: "Insumo o entrega parcial", multiline: true }, { name: "criterio", label: "Criterio de disponibilidad", multiline: true },
      { name: "disponible", label: "Insumo disponible", type: "checkbox", value: false }, { name: "evidencia", label: "Evidencia si está disponible", multiline: true, required: false },
    ]} />
    <h4>Referencias reconciliadas</h4>
    {refs.map((r) => <p className="small" key={r.id}>{w.fuentes.find((f) => f.id === r.fuenteId)?.nombre} · {r.idOrigen} · {r.nombre}</p>)}
    {!refs.length && <p className="muted small">Actividad conservada; correspondencia pendiente o adicional al plan ({w.referencias.length} referencias reconciliadas).</p>}
  </Card>;
}
