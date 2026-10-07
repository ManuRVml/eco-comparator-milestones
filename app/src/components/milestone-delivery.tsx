import type { MilestoneView, Model } from "@/lib/model";
import { contractPending, criterionAccepted } from "@/lib/milestone-contract/domain";
import { fmtCorta } from "@/lib/dates";
import { CompletionCheck } from "./completion-check";

export function MilestoneDelivery({ m, model }: { m: MilestoneView; model: Model }) {
  const contract = model.contratosMilestone?.[m.id], d = contract?.definicion;
  const pending = contract ? contractPending(contract) : ["definición"];
  const abiertas = (contract?.decisionesPendientes ?? []).filter((dec) => !dec.resuelta);
  return <section className="milestone-delivery" data-testid={`delivery-${m.id}`} aria-label="Cumplimiento del milestone">
    <div className="delivery-heading"><h3>{m.cierreVerificado ? "Milestone cumplido" : "Milestone pendiente"}</h3><CompletionCheck complete={!!m.cierreVerificado} label="Criterios aceptados y cumplimiento publicado" id={`delivery-${m.id}`} /><span className={`chip tone-${m.cierreVerificado ? "green" : "slate"}`}>{m.id}</span></div>
    <p className="delivery-result"><b>Resultado esperado:</b> {d?.outcome || m.valorCliente || m.nombre}</p>
    <dl className="delivery-dates"><div><dt>Fecha comprometida</dt><dd>{fmtCorta(m.fechaObjetivo)}</dd></div><div><dt>Previsión actual</dt><dd>{d?.fechaPrevision ? fmtCorta(d.fechaPrevision) : "Sin previsión registrada"}</dd></div><div><dt>Aceptación publicada</dt><dd>{m.cierreVerificado ? fmtCorta(m.fechaCierre) : "Pendiente"}</dd></div></dl>
    {d?.fechaPrevision && <p><b>Motivo de la previsión:</b> {d.motivoPrevision}</p>}
    {pending.length > 0 && <p className="definition-pending" role="status">Definición de valor pendiente: {pending.length} campo(s) por completar. El cumplimiento no se certifica hasta completar la ficha y aceptar los criterios obligatorios.</p>}
    {abiertas.length > 0 && <><h4>Lo que necesitamos de ti</h4>
    <ul className="acceptance-list" data-testid={`needs-${m.id}`}>{abiertas.map((dec)=><li key={dec.id}>
      <div className="delivery-heading"><b>{dec.texto}</b>{dec.borrador&&<span className="chip tone-slate">borrador</span>}{!!dec.fechaLimite&&dec.fechaLimite<model.hoy&&<span className="chip tone-red">Vencida</span>}</div>
      <p className="muted small">Responsable: {dec.responsableCliente||"—"}{dec.fechaLimite&&<> · Antes del {fmtCorta(dec.fechaLimite)}</>}</p>
    </li>)}</ul></>}
    <h4>Métricas y metas acordadas</h4>
    <ul className="acceptance-list">{contract?.metricas.filter(v=>v.activa).map(v=><li key={v.id}><b>{v.nombre}</b> · Meta: {v.tipo==="Cuantitativa"?`${v.comparador} ${v.objetivo??"Por definir"} ${v.unidad}`:v.objetivoCualitativo||"Por definir"}<p className="small">Método: {v.metodo||"Por definir"}{v.tolerancia!==null&&` · Tolerancia: ${v.tolerancia} ${v.unidad}`}{v.muestraMinima!==null&&` · Muestra mínima: ${v.muestraMinima}`}</p></li>)}</ul>
    {!contract?.metricas.some(v=>v.activa)&&<p className="muted small">Métricas por definir.</p>}
    <h4>Criterios de aceptación y evidencia</h4>
    <ol className="acceptance-list">
      {(contract?.criterios ?? []).map((c) => <li key={c.id} data-testid={`criterion-${c.id}`}>
        <div className="delivery-heading"><b>{c.descripcion}</b><span className={`chip tone-${contract && criterionAccepted(c, contract, model.hoy) ? "green" : "slate"}`}>{contract && criterionAccepted(c, contract, model.hoy) ? "Aceptado" : "Pendiente"}</span><small>{c.obligatorio ? "Obligatorio" : "Complementario"}</small></div>
        <p className="muted small">Evidencia requerida: {c.evidenciaRequerida||"Por definir"}</p>
        {contract && criterionAccepted(c, contract, model.hoy) ? <p><b>Evidencia:</b> {c.evidencia} · <b>Aprobó:</b> {c.aprobador} · <b>Fecha:</b> {fmtCorta(c.fecha)}{c.resultadoMedido!==null&&` · Valor medido: ${c.resultadoMedido}`}{c.resultadoCualitativo&&` · Resultado: ${c.resultadoCualitativo}`}{c.muestraEvaluada!==null&&` · Muestra evaluada: ${c.muestraEvaluada}`}</p> : <p className="muted small">Sin aceptación vigente. {c.evidencia && "Hay una evidencia anterior pendiente de revisión."}</p>}
      </li>)}
    </ol>
    {!contract?.criterios.length && <p>Por definir; el milestone no puede certificarse.</p>}
    <details className="delivery-context"><summary>Necesidad del usuario, resultado, responsables y alcance</summary>
      <dl className="definition-grid">
        {[["Necesidad del usuario (JTBD)", d?.job], ["Resultado esperado", d?.outcome], ["Objetivo de negocio", d?.meta], ["Responsable", d?.responsable], ["Aprobador del negocio", d?.aprobador], ["Incluido en la entrega", d?.alcanceIncluido], ["Fuera de alcance", d?.fueraAlcance]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Por definir"}</dd></div>)}
        <div><dt>Alcance relacionado</dt><dd>{m.huIds.length} historias · {m.tareaIds.length} tareas · {m.epicas?.replaceAll(";", " · ") || "Épicas sin registrar"}</dd></div>
      </dl>
    </details>
    {m.publicado && <p className="muted small"><b>{m.cierreVerificado ? "Registro de publicación" : "Registro anterior; aceptación por criterios pendiente de confirmar"}:</b> {m.evidencia}</p>}
  </section>;
}
