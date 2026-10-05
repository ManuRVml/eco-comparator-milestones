import Link from "next/link";
import type { Model } from "../../lib/model";
import { WorkflowForm } from "../editor/workflow-form";
import { fmtCorta } from "../../lib/dates";

export function MilestoneWorkflow({ id, model, editar = false }: { id: string; model: Model; editar?: boolean }) {
  const w = model.workflow;
  if (!w?.activo) return null;
  const m = model.milestoneById.get(id);
  if (!m) return null;
  const ids = new Set(m.tareaIds), blocks = w.bloqueos.filter((b) => ids.has(b.tareaId) && !b.resueltoEn);
  const forecast = w.previsiones.find((p) => p.milestoneId === id);
  const implemented = m.tareaIds.filter((t) => model.tareaById.get(t)?.estado === "Hecha").length;
  const integrated = m.tareaIds.filter((t) => w.validaciones.some((v) => v.tareaId === t && v.etapa === "Integración" && v.resultado === "Verificada")).length;
  return <section className="workflow-summary" data-testid={`workflow-${id}`}>
    <h4>Entregas y trabajo en paralelo</h4>
    <p className="muted small">Los estados heredados conservan su evidencia y corte. <Link href={`/reconciliacion?fuente=${encodeURIComponent(w.fuentes.find((f) => f.nombre === "recursos_refestecp.md")?.id ?? "")}`}>Consultar recursos verificados al 02/10</Link> antes de actualizar riesgos o entregas.</p>
    <p className="small">Base: {fmtCorta(m.fechaObjetivo)} · Previsión: {forecast ? fmtCorta(forecast.fecha) : "Sin actualizar"}</p>
    <p className="small">{implemented}/{ids.size} implementadas · {integrated}/{ids.size} con integración verificada · {m.tareasPublicadas}/{ids.size} publicadas</p>
    {forecast && <p className="small">Entrega mínima: {forecast.entregaMinima} · Responsable: {forecast.responsable}. {forecast.motivo}</p>}
    {blocks.map((b) => <p className="small" key={b.id}><Link href={`/tareas/${b.tareaId}`}>{b.tareaId}</Link> · {b.afecta}: {b.descripcion} · {b.responsable} · revisión {b.revision}</p>)}
    {!blocks.length && <p className="muted small">Sin bloqueos registrados para estas actividades.</p>}
    {w.vinculos.filter((v) => v.milestoneId === id).map((v) => {
      const h = w.compromisos.find((h) => h.id === v.compromisoId);
      return h && <p key={v.compromisoId} className="small">Hito técnico: {h.id.split(":").at(-1)} · {h.resultado} · {h.fechaBase}. Relación: {v.criterio}</p>;
    })}
    <Link className="btn btn-ghost btn-sm" href={`/flujo?milestone=${id}`}>Ver trabajo por equipo →</Link>
    {editar && <details><summary>Actualizar previsión</summary><WorkflowForm title="Previsión del entregable" endpoint="/api/editor/plan" fixed={{ id, accion: "prevision" }} fields={[
      { name: "fecha", label: "Previsión actual", type: "date", value: forecast?.fecha ?? m.fechaObjetivo ?? "" },
      { name: "motivo", label: "Motivo y supuestos", multiline: true }, { name: "entregaMinima", label: "Entrega mínima útil", multiline: true, value: forecast?.entregaMinima ?? "" }, { name: "responsable", label: "Responsable de coordinación", value: forecast?.responsable ?? "" },
    ]} /></details>}
  </section>;
}
