import Link from "next/link";
import type { Model } from "@/lib/model";
import { fmtCorta, fmtLarga } from "@/lib/dates";

export function MilestoneOverview({ model, cliente = false }: { model: Model; cliente?: boolean }) {
  if (cliente) {
    // A tiempo = cumplido, o su fecha objetivo aún no pasó.
    const aTiempo = model.milestones.filter((m) => m.cierreVerificado || (m.fechaObjetivo ?? model.hoy) >= model.hoy).length;
    const prox = model.milestones.find((m) => !m.cierreVerificado && (m.fechaObjetivo ?? "") >= model.hoy);
    return <section className="milestone-overview" data-testid="milestone-overview" aria-label="Resumen de milestones">
      <p data-testid="hitos-resumen"><strong>{aTiempo} de {model.milestones.length} hitos a tiempo.</strong>{prox && <> Próximo: {prox.nombre} el {fmtLarga(prox.fechaObjetivo ?? model.hoy)}</>}</p>
      <Link href="/lineas" className="btn btn-primary btn-sm">Ver timeline →</Link>
    </section>;
  }
  const cumplidos = model.milestones.filter((m) => m.cierreVerificado).length;
  const next = model.milestones.find((m) => !m.cierreVerificado);
  const d = next && model.contratosMilestone?.[next.id]?.definicion;
  return <section className="milestone-overview" data-testid="milestone-overview" aria-label="Valor y cumplimiento de milestones">
    <span className="kicker">RESULTADOS Y ACEPTACIÓN</span>
    <h2>Milestones: valor que debe quedar confirmado</h2>
    <div className="milestone-counts"><div><strong>{cumplidos}</strong><span>Cumplidos</span></div><div><strong>{model.milestones.length - cumplidos}</strong><span>Pendientes</span></div></div>
    {next ? <div className="next-milestone" data-testid="next-milestone"><span className="chip tone-slate">{next.id} · Próximo resultado pendiente</span><h3>{next.nombre}</h3><p><b>Compromiso:</b> {fmtCorta(next.fechaObjetivo)} · <b>Previsión:</b> {d?.fechaPrevision ? fmtCorta(d.fechaPrevision) : "Sin registrar"}</p><p className="muted small">Decisión pendiente: {d?.aprobador ? `aceptación de ${d.aprobador}` : "definir aprobador y completar la ficha de valor"}.</p><Link href={`/milestones/${next.id}`} className="btn btn-primary btn-sm">Ver criterio, evidencia y resultado →</Link></div> : <p>Todos los milestones visibles tienen su cumplimiento confirmado.</p>}
  </section>;
}
