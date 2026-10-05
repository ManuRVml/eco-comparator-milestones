import type { Model } from "@/lib/model";
import { sprintCheckpoint } from "@/lib/sprint-checkpoint";
import { daysBetween, fmtCorta } from "@/lib/dates";
import { colorEstado } from "@/lib/format";
import { Ring, StatusBadge } from "@/components/ui";
import { TareaRow } from "@/components/tarea-row";
import { PanelClose } from "@/components/milestone-panel/panel-client";
import { MetricNote } from "@/components/metric-note";
import { CompletionCheck } from "@/components/completion-check";
import { CheckpointProgress } from "@/components/checkpoint-progress";

export function SprintCheckpointPanel({ model, numero, areaId, canEdit }: { model: Model; numero: number; areaId: string | null; canEdit: boolean }) {
  const checkpoint = sprintCheckpoint(model, numero, areaId);
  if (!checkpoint) return null;
  const { id, sprint, tareas, estado, total, compromiso } = checkpoint;
  return (
    <section className="ms-panel" data-testid={`ms-panel-${id}`} aria-label={`Revisión del Sprint ${numero}`}>
      <span className="ms-panel-grip" aria-hidden="true" />
      <header className="ms-panel-head">
        <Ring value={total.pctReal} plan={checkpoint.completo ? undefined : total.pctPlan} size={84} stroke={8} color={colorEstado(estado)}>
          <span className="mini-ring-label is-lg">{Math.round(total.pctReal)}%</span>
        </Ring>
        <div className="ms-panel-title">
          <div className="ms-panel-tags"><span className="ms-id">Sprint {numero}</span><StatusBadge estado={estado} size="sm" /><CompletionCheck complete={checkpoint.completo} label="Cierre completo verificado" id={`panel-${id}`} /></div>
          <h3>{numero === 0 ? "Revisión de alistamiento · Sprint 0" : `Revisión de avance · Sprint ${numero}`}</h3>
          <p className="ms-panel-meta">{fmtCorta(sprint.fechaInicio)} – {fmtCorta(sprint.fechaFin)} · {daysBetween(sprint.fechaInicio, sprint.fechaFin) < 7 ? "Una semana" : "Dos semanas"} · Total: {total.hechas}/{total.total} tareas {model.capa === "oficial" ? "entregadas" : "hechas (técnico interno)"}</p>
        </div>
        <div className="ms-panel-actions"><PanelClose /></div>
      </header>
      <MetricNote capa={model.capa} hoy={model.hoy} alcance={`Sprint ${numero} completo; desglose por área dentro del cierre`} checkpoints />
      <div className="checkpoint-content">
        <p>Este punto permite revisar el resultado, pendientes y ajustes del sprint. Su check confirma el resultado del sprint; cada hito M conserva su propia aceptación.</p>
        <p><b>Fecha objetivo de revisión: {fmtCorta(sprint.fechaFin)}.</b> Objetivo al cierre: 100 % del alcance completo y entrega verificada.</p>
        <CheckpointProgress total={total} areas={checkpoint.areas} completo={checkpoint.completo} areaId={areaId} />
        {compromiso ? <div className="checkpoint-expectation" data-testid={`expected-${id}`}>
          <h4>Lo que debería estar completado al cierre</h4>
          <p><b>{compromiso.id} · {compromiso.resultado}</b><br />{compromiso.criterio}</p>
          <p>Fecha base: {fmtCorta(compromiso.fechaBase)} · {compromiso.referenciasTotales} referencias del plan · {checkpoint.completo ? "Cierre verificado" : "Resultado pendiente de cierre verificado"}.</p>
          {canEdit && checkpoint.referenciasPendientes > 0 && <p className="alert tone-amber">{checkpoint.referenciasPendientes} referencia(s) del resultado sin correspondencia confirmada. El cierre no puede llevar check.</p>}
        </div> : <p className="alert tone-amber">El resultado de este cierre necesita confirmar su plan. No se certifica automáticamente.</p>}
        <h4>{areaId ? `Tareas de ${model.areaById.get(areaId)?.nombre}` : `Tareas del Sprint ${numero}`}</h4>
        {tareas.length ? <ul className="tarea-list">{tareas.map((t) => <TareaRow key={t.id} t={t} model={model} canEdit={canEdit} showArea />)}</ul> : <p className="muted">Sin tareas de esta área en este sprint.</p>}
      </div>
    </section>
  );
}
