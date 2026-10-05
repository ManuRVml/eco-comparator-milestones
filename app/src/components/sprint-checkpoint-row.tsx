import type { CSSProperties } from "react";
import type { Model } from "@/lib/model";
import { sprintCheckpoint } from "@/lib/sprint-checkpoint";
import { fmtCorta, fmtDiaSemana } from "@/lib/dates";
import { colorEstado, fmtPct } from "@/lib/format";
import { Ring } from "@/components/ui";
import { LaneSlot, RoadmapNode } from "@/components/milestone-panel/panel-client";
import { SprintCheckpointPanel } from "@/components/sprint-checkpoint-panel";
import { CompletionCheck } from "@/components/completion-check";

export function SprintCheckpointRow({ model, areaId, canEdit, position }: { model: Model; areaId: string | null; canEdit: boolean; position: (date: string) => number }) {
  const checkpoints = model.sprints.map((s) => sprintCheckpoint(model, s.numero, areaId)).filter((c) => c !== null);
  if (!checkpoints.length) return null;
  return (
    <div className="rm-row rm-lane rm-checkpoint" style={{ "--filas": 1, "--linea": "var(--color-brand-primary)" } as CSSProperties}>
      <div className="rm-lane-label">
        <span className="rm-lane-id">CP</span>
        <strong>Cierres de sprint</strong>
        <span className="rm-lane-meta">S0: una semana · S1–S6: dos semanas</span>
      </div>
      <div className="rm-track">
        <span className="rm-line" />
        {checkpoints.map((c) => {
          const left = position(c.sprint.fechaFin), color = colorEstado(c.estado);
          const align = left > 93 ? "is-right" : left < 7 ? "is-left" : "";
          return (
            <RoadmapNode key={c.id} id={c.id} href={`/lineas?${areaId ? `area=${areaId}&` : ""}m=${c.id}`} className={`rm-node ${align} ${c.tareas.length ? "" : "is-muted"}`} style={{ left: `${left}%`, "--fila": 0, "--c": color } as CSSProperties} title={`Sprint ${c.sprint.numero} · Checkpoint de cierre (clic para ver tareas)`}>
              <span className="rm-dot"><Ring value={c.total.pctReal} plan={c.completo ? undefined : c.total.pctPlan} size={44} stroke={5} color={color} track="var(--color-border-default)"><span className="rm-dot-inner">{c.id}</span></Ring><CompletionCheck complete={c.completo} label={`Sprint ${c.sprint.numero}: cierre completo verificado`} id={c.id} /></span>
              <span className="rm-label">
                <span className="rm-date">{fmtDiaSemana(c.sprint.fechaFin)} {fmtCorta(c.sprint.fechaFin)}</span>
                <span className="rm-name">{c.compromiso?.resultado ?? (c.sprint.numero === 0 ? "Alistamiento inicial" : `Cierre Sprint ${c.sprint.numero}`)}</span>
                <span className="rm-stat"><i style={{ background: color }} />Total {fmtPct(c.total.pctReal)}</span>
                {!c.completo && <span className="rm-comparison">Previsto {fmtPct(c.total.pctPlan)} · {c.estado}</span>}
                {areaId && <span className="rm-comparison">Área {fmtPct(c.porcentaje)}</span>}
              </span>
            </RoadmapNode>
          );
        })}
      </div>
      <LaneSlot lineaId="CP" panels={Object.fromEntries(checkpoints.map((c) => [c.id, <SprintCheckpointPanel key={c.id} model={model} numero={c.sprint.numero} areaId={areaId} canEdit={canEdit} />]))} />
    </div>
  );
}
