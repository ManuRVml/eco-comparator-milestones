import type { MilestoneView, Model } from "@/lib/model";
import { definitionPending } from "@/lib/milestone-contract/domain";
import { fmtCorta } from "@/lib/dates";
import { CompletionCheck } from "./completion-check";

export function MilestoneDelivery({ m, model }: { m: MilestoneView; model: Model }) {
  const contract = model.contratosMilestone?.[m.id], d = contract?.definicion;
  const pending = d ? definitionPending(d) : ["definición"];
  return <section className="milestone-delivery" data-testid={`delivery-${m.id}`} aria-label="Cumplimiento del milestone">
    <div className="delivery-heading"><h3>{m.cierreVerificado ? "Milestone cumplido" : "Milestone pendiente"}</h3><CompletionCheck complete={!!m.cierreVerificado} label="Criterios aceptados y cumplimiento publicado" id={`delivery-${m.id}`} /><span className={`chip tone-${m.cierreVerificado ? "green" : "slate"}`}>{m.id}</span></div>
    <p className="delivery-result"><b>Resultado esperado:</b> {m.valorCliente || m.nombre}</p>
    <dl className="delivery-dates"><div><dt>Fecha comprometida</dt><dd>{fmtCorta(m.fechaObjetivo)}</dd></div><div><dt>Previsión actual</dt><dd>{d?.fechaPrevision ? fmtCorta(d.fechaPrevision) : "Sin previsión registrada"}</dd></div><div><dt>Aceptación publicada</dt><dd>{m.cierreVerificado ? fmtCorta(m.fechaCierre) : "Pendiente"}</dd></div></dl>
    {d?.fechaPrevision && <p><b>Motivo de la previsión:</b> {d.motivoPrevision}</p>}
    {pending.length > 0 && <p className="definition-pending" role="status">Definición de valor pendiente: {pending.length} campo(s) por completar. El cumplimiento no se certifica hasta completar la ficha y aceptar los criterios obligatorios.</p>}
    <h4>Criterios de aceptación y evidencia</h4>
    <ol className="acceptance-list">
      {(contract?.criterios ?? []).map((c) => <li key={c.id} data-testid={`criterion-${c.id}`}>
        <div className="delivery-heading"><b>{c.descripcion}</b><span className={`chip tone-${c.estado === "Verificado" ? "green" : "slate"}`}>{c.estado === "Verificado" ? "Aceptado" : "Pendiente"}</span><small>{c.obligatorio ? "Obligatorio" : "Complementario"}</small></div>
        {c.estado === "Verificado" ? <p><b>Evidencia:</b> {c.evidencia} · <b>Aprobó:</b> {c.aprobador} · <b>Fecha:</b> {fmtCorta(c.fecha)}</p> : <p className="muted small">Sin aceptación vigente. {c.evidencia && "Hay una evidencia anterior pendiente de revisión."}</p>}
      </li>)}
    </ol>
    {!contract?.criterios.length && <p>Por definir; el milestone no puede certificarse.</p>}
    <details className="delivery-context"><summary>Job, outcome, responsables y alcance</summary>
      <dl className="definition-grid">
        {[["Job del usuario (JTBD)", d?.job], ["Outcome medible", d?.outcome], ["Métrica y meta acordada", d?.meta], ["Responsable", d?.responsable], ["Aprobador del negocio", d?.aprobador], ["Fuera de alcance", d?.fueraAlcance]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Por definir"}</dd></div>)}
        <div><dt>Alcance relacionado</dt><dd>{m.huIds.length} historias · {m.tareaIds.length} tareas · {m.epicas?.replaceAll(";", " · ") || "Épicas sin registrar"}</dd></div>
      </dl>
    </details>
    {m.publicado && <p className="muted small"><b>{m.cierreVerificado ? "Registro de publicación" : "Registro anterior; aceptación por criterios pendiente de confirmar"}:</b> {m.evidencia}</p>}
  </section>;
}
