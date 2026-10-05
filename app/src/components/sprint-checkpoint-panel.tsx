import type { Model } from "@/lib/model";
import { sprintCheckpoint } from "@/lib/sprint-checkpoint";
import { daysBetween, fmtCorta } from "@/lib/dates";
import { colorEstado } from "@/lib/format";
import { Ring, StatusBadge } from "@/components/ui";
import { TareaRow } from "@/components/tarea-row";
import { PanelClose } from "@/components/milestone-panel/panel-client";
import { MetricNote } from "@/components/metric-note";

export function SprintCheckpointPanel({ model, numero, areaId, canEdit }: { model: Model; numero: number; areaId: string | null; canEdit: boolean }) {
  const checkpoint = sprintCheckpoint(model, numero, areaId);
  if (!checkpoint) return null;
  const { id, sprint, tareas, hechas, estado, porcentaje, progreso, compromiso } = checkpoint;
  return (
    <section className="ms-panel" data-testid={`ms-panel-${id}`} aria-label={`Checkpoint del Sprint ${numero}`}>
      <span className="ms-panel-grip" aria-hidden="true" />
      <header className="ms-panel-head">
        <Ring value={porcentaje} size={84} stroke={8} color={colorEstado(estado)}>
          <span className="mini-ring-label is-lg">{Math.round(porcentaje)}%</span>
        </Ring>
        <div className="ms-panel-title">
          <div className="ms-panel-tags"><span className="ms-id">Sprint {numero}</span><StatusBadge estado={estado} size="sm" /></div>
          <h3>{numero === 0 ? "Checkpoint de alistamiento" : `Checkpoint de cierre · Sprint ${numero}`}</h3>
          <p className="ms-panel-meta">{fmtCorta(sprint.fechaInicio)} – {fmtCorta(sprint.fechaFin)} · {daysBetween(sprint.fechaInicio, sprint.fechaFin) < 7 ? "Una semana" : "Dos semanas"} · {hechas}/{tareas.length} tareas {model.capa === "oficial" ? "entregadas" : "hechas (técnico interno)"}</p>
        </div>
        <div className="ms-panel-actions"><PanelClose /></div>
      </header>
      <MetricNote capa={model.capa} hoy={model.hoy} alcance={`Sprint ${numero}${areaId ? ` · ${model.areaById.get(areaId)?.nombre}` : " · tareas de este sprint"}`} checkpoints />
      <div className="checkpoint-content">
        <p><b>Fecha base del checkpoint: {fmtCorta(sprint.fechaFin)}.</b> Avance ponderado: {progreso.diasHechos}/{progreso.dias} días hábiles de tareas completadas. El cierre se verifica con las entregas registradas.</p>
        {canEdit && compromiso && <p><b>H-{String(numero + 1).padStart(2, "0")} · {compromiso.resultado}</b><br />{compromiso.criterio}</p>}
        <h4>{areaId ? `Tareas de ${model.areaById.get(areaId)?.nombre}` : `Tareas del Sprint ${numero}`}</h4>
        {tareas.length ? <ul className="tarea-list">{tareas.map((t) => <TareaRow key={t.id} t={t} model={model} canEdit={canEdit} showArea />)}</ul> : <p className="muted">Sin tareas de esta área en este sprint.</p>}
      </div>
    </section>
  );
}
