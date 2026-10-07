import Link from "next/link";
import { riesgosParaCliente, type MilestoneView, type Model } from "@/lib/model";
import { tono } from "@/lib/format";
import { contractPending, criterionAccepted } from "@/lib/milestone-contract/domain";
import { fmtCorta } from "@/lib/dates";
import { CompletionCheck } from "./completion-check";

function ddmm(iso: string | null | undefined) {
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "—";
}

function Necesidades({ m, model }: { m: MilestoneView; model: Model }) {
  const abiertas = (model.contratosMilestone?.[m.id]?.decisionesPendientes ?? []).filter((dec) => !dec.resuelta);
  return <>
    {abiertas.length > 0 && <><h4>Lo que necesitamos de ti</h4>
    <ul className="acceptance-list" data-testid={`needs-${m.id}`}>{abiertas.map((dec)=><li key={dec.id}>
      <div className="delivery-heading"><b>{dec.texto}</b>{dec.borrador&&<span className="chip tone-slate">borrador</span>}{!!dec.fechaLimite&&dec.fechaLimite<model.hoy&&<span className="chip tone-red">Vencida</span>}</div>
      <p className="muted small">Responsable: {dec.responsableCliente||"—"}{dec.fechaLimite&&<> · Antes del {fmtCorta(dec.fechaLimite)}</>}</p>
    </li>)}</ul></>}
  </>;
}

/** Riesgos que podrían mover la fecha, solo si el hito está en riesgo/atrasado o tiene riesgos vinculados. */
export function MilestoneRiesgos({ m, model }: { m: MilestoneView; model: Model }) {
  const items = riesgosParaCliente(m, model.riesgoById);
  const enRiesgo = m.estadoFinal === "En riesgo" || m.estadoFinal === "Atrasado";
  if (!enRiesgo && items.length === 0) return null;
  return <>
    <h4>Riesgos que podrían mover la fecha</h4>
    {items.length === 0
      ? <p data-testid={`riesgos-${m.id}`}>Estamos evaluando el efecto en la fecha.</p>
      : <ul className="acceptance-list" data-testid={`riesgos-${m.id}`}>{items.map((r) => <li key={r.id}>
        <b>{r.consecuencia}</b>
        {r.mitigacion && <p className="muted small">Qué hacemos al respecto: {r.mitigacion}</p>}
      </li>)}</ul>}
  </>;
}

const ETIQUETA_CAPACIDAD = { pendiente: "Pendiente", "en curso": "En curso", entregada: "Entregada" } as const;

/** Panel de valor para el cliente: qué obtienes, estado, evidencia, qué necesitamos, riesgos y qué sigue. */
export function MilestoneValor({ m, model }: { m: MilestoneView; model: Model }) {
  const d = model.contratosMilestone?.[m.id]?.definicion;
  const capacidades = model.capacidadesPorMilestone.get(m.id) ?? [];
  const siguiente = model.milestones.find((x) => x.lineaId === m.lineaId && x.id !== m.id && (x.fechaObjetivo ?? "") > (m.fechaObjetivo ?? ""));
  const evidencia = m.publicado && m.evidencia ? m.evidencia : null;
  return <section className="milestone-delivery" data-testid={`valor-${m.id}`} aria-label="Valor del milestone">
    <h4>Qué obtienes</h4>
    <p className="delivery-result">{d?.outcome || m.valorCliente || m.nombre}</p>
    {capacidades.length > 0 && <ul className="acceptance-list">{capacidades.map((c) => <li key={c.id}><b>{c.titulo}</b> <span className={`chip tone-${c.estado === "entregada" ? "green" : c.estado === "en curso" ? "amber" : "slate"}`}>{ETIQUETA_CAPACIDAD[c.estado]}</span></li>)}</ul>}
    <h4>Estado</h4>
    <p><span className={`chip tone-${tono(m.estadoFinal)}`}>{m.estadoFinal}</span> comprometido {ddmm(m.fechaObjetivo)} · previsto {ddmm(d?.fechaPrevision || m.fechaObjetivo)}</p>
    <h4>Evidencia</h4>
    <p>{evidencia ? (/^https?:\/\//.test(evidencia) ? <a href={evidencia}>{evidencia}</a> : evidencia) : "Disponible al cierre"}</p>
    <Necesidades m={m} model={model} />
    <MilestoneRiesgos m={m} model={model} />
    <h4>Qué sigue</h4>
    <p>{siguiente ? `${siguiente.id} · ${siguiente.nombre} · ${ddmm(siguiente.fechaObjetivo)}` : "Es el último hito de esta línea."}</p>
    <Link href={`/milestones/${m.id}`} className="btn btn-sm">Ver detalles</Link>
  </section>;
}

export function MilestoneDelivery({ m, model, canEdit }: { m: MilestoneView; model: Model; canEdit: boolean }) {
  const contract = model.contratosMilestone?.[m.id], d = contract?.definicion;
  const pending = contract ? contractPending(contract) : ["definición"];
  return <section className="milestone-delivery" data-testid={`delivery-${m.id}`} aria-label="Cumplimiento del milestone">
    <div className="delivery-heading"><h3>{m.cierreVerificado ? "Milestone cumplido" : "Milestone pendiente"}</h3><CompletionCheck complete={!!m.cierreVerificado} label="Criterios aceptados y cumplimiento publicado" id={`delivery-${m.id}`} /><span className={`chip tone-${m.cierreVerificado ? "green" : "slate"}`}>{m.id}</span></div>
    <p className="delivery-result"><b>Resultado esperado:</b> {d?.outcome || m.valorCliente || m.nombre}</p>
    <dl className="delivery-dates"><div><dt>Fecha comprometida</dt><dd>{fmtCorta(m.fechaObjetivo)}</dd></div><div><dt>Previsión actual</dt><dd>{fmtCorta(d?.fechaPrevision || m.fechaObjetivo)}</dd></div><div><dt>Aceptación publicada</dt><dd>{m.cierreVerificado ? fmtCorta(m.fechaCierre) : "Pendiente"}</dd></div></dl>
    {d?.fechaPrevision && <p><b>Motivo de la previsión:</b> {d.motivoPrevision}</p>}
    {canEdit && pending.length > 0 && <p className="definition-pending" role="status">Definición de valor pendiente: {pending.length} campo(s) por completar. El cumplimiento no se certifica hasta completar la ficha y aceptar los criterios obligatorios.</p>}
    <Necesidades m={m} model={model} />
    <h4>Métricas y metas acordadas</h4>
    <ul className="acceptance-list">{contract?.metricas.filter(v=>v.activa).map(v=><li key={v.id}><b>{v.nombre}</b> · Meta: {v.tipo==="Cuantitativa"?`${v.comparador} ${v.objetivo??"Por definir"} ${v.unidad}`:v.objetivoCualitativo||"Por definir"}<p className="small">Método: {v.metodo||"Por definir"}{v.tolerancia!==null&&` · Tolerancia: ${v.tolerancia} ${v.unidad}`}{v.muestraMinima!==null&&` · Muestra mínima: ${v.muestraMinima}`}</p></li>)}</ul>
    {canEdit&&!contract?.metricas.some(v=>v.activa)&&<p className="muted small">Métricas por definir.</p>}
    <h4>Criterios de aceptación y evidencia</h4>
    <ol className="acceptance-list">
      {(contract?.criterios ?? []).map((c) => <li key={c.id} data-testid={`criterion-${c.id}`}>
        <div className="delivery-heading"><b>{c.descripcion}</b><span className={`chip tone-${contract && criterionAccepted(c, contract, model.hoy) ? "green" : "slate"}`}>{contract && criterionAccepted(c, contract, model.hoy) ? "Aceptado" : "Pendiente"}</span><small>{c.obligatorio ? "Obligatorio" : "Complementario"}</small></div>
        <p className="muted small">{c.evidenciaRequerida||canEdit?`Evidencia requerida: ${c.evidenciaRequerida||"Por definir"}`:"Evidencia: disponible al cierre"}</p>
        {contract && criterionAccepted(c, contract, model.hoy) ? <p><b>Evidencia:</b> {c.evidencia} · <b>Aprobó:</b> {c.aprobador} · <b>Fecha:</b> {fmtCorta(c.fecha)}{c.resultadoMedido!==null&&` · Valor medido: ${c.resultadoMedido}`}{c.resultadoCualitativo&&` · Resultado: ${c.resultadoCualitativo}`}{c.muestraEvaluada!==null&&` · Muestra evaluada: ${c.muestraEvaluada}`}</p> : <p className="muted small">Sin aceptación vigente. {c.evidencia && "Hay una evidencia anterior pendiente de revisión."}</p>}
      </li>)}
    </ol>
    {!contract?.criterios.length && <p>Por definir; el milestone no puede certificarse.</p>}
    <details className="delivery-context"><summary>Necesidad del usuario, resultado, responsables y alcance</summary>
      <dl className="definition-grid">
        {[["Necesidad del usuario (JTBD)", d?.job], ["Resultado esperado", d?.outcome], ["Objetivo de negocio", d?.meta], ["Responsable", d?.responsable], ["Aprobador del negocio", d?.aprobador], ["Incluido en la entrega", d?.alcanceIncluido], ["Fuera de alcance", d?.fueraAlcance]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Por definir"}</dd></div>)}
        {canEdit && <div><dt>Alcance relacionado</dt><dd>{m.huIds.length} historias · {m.tareaIds.length} tareas · {m.epicas?.replaceAll(";", " · ") || "Épicas sin registrar"}</dd></div>}
      </dl>
    </details>
    {m.publicado && <p className="muted small"><b>{m.cierreVerificado ? "Registro de publicación" : "Registro anterior; aceptación por criterios pendiente de confirmar"}:</b> {m.evidencia}</p>}
  </section>;
}
