import type { CSSProperties } from "react";
import type { Model } from "@/lib/model";
import { sprintCheckpoint } from "@/lib/sprint-checkpoint";
import { fmtCorta, fmtDiaSemana } from "@/lib/dates";
import { colorEstado, fmtPct, tono } from "@/lib/format";
import { Ring } from "@/components/ui";
import { LaneSlot, RoadmapNode } from "@/components/milestone-panel/panel-client";
import { SprintCheckpointPanel } from "@/components/sprint-checkpoint-panel";
import { CompletionCheck } from "@/components/completion-check";
import { MilestonePanel } from "@/components/milestone-panel/panel";
import type { MilestoneView } from "@/lib/model";

/** Adaptador: el alistamiento (S0) se presenta con el mismo panel de valor que los milestones, sin crear uno nuevo en el modelo. Todo número sale del checkpoint de S0, no de otro milestone. */
export function inicioComoMilestone(_model: Model, c: NonNullable<ReturnType<typeof sprintCheckpoint>>): MilestoneView {
  const t = c.total;
  return {
    id: "S0", nombre: "Ambientes y arquitectura base desplegados", descripcion: null, lineaId: "CP", sprintId: c.sprint.id, fechaObjetivo: c.sprint.fechaFin, criterio: null, orden: 0,
    valorCliente: "Infraestructura y accesos preparados; nada visible aún para ti.", sprintsTexto: null, epicas: null, avanceCodigoPct: null, avanceCodigoEvidencia: null,
    estado: c.estado, estadoOrigen: "plan", visibleCliente: true, fechaEstado: null, evidencia: null, fechaCierre: null, creadoEn: "", actualizadoEn: "",
    trabajo: t, cierreVerificado: c.completo, linea: null, huIds: [], tareaIds: c.tareas.map((x) => x.id), dependeDe: [], dependientes: [], riesgoIds: ["R-05"],
    tareasTotal: t.total, tareasHechas: t.hechas, tareasEnCurso: t.enCurso, tareasPublicadas: c.tareas.filter((x) => x.publicadoCliente).length,
    pctTareas: t.pctTareas, pctPonderado: t.pctReal, spTotal: 0, spCompletos: 0, pctSp: 0, huCompletas: 0,
    estadoSugerido: c.estado, publicado: false, estadoFinal: c.estado, override: false, criticasVencidas: [], areas: c.areas,
  };
}

export function SprintCheckpointRow({ model, areaId, canEdit, position }: { model: Model; areaId: string | null; canEdit: boolean; position: (date: string) => number }) {
  const todos = model.sprints.map((s) => sprintCheckpoint(model, s.numero, areaId)).filter((c) => c !== null);
  const inicio = todos.find((c) => c.sprint.numero === 0);
  // El editor abre S0 como un punto más del carril de sprints; el cliente lo ve como un nodo propio con el panel de valor.
  const checkpoints = canEdit ? todos : [];
  const m = !canEdit && inicio ? inicioComoMilestone(model, inicio) : null;
  const nota = m && inicio && (
    <div className="rm-row rm-lane" style={{ "--filas": 1, "--linea": "var(--color-brand-primary)" } as CSSProperties}>
      <div className="rm-lane-label">
        <span className="rm-lane-id">S0</span>
        <strong>Inicio del proyecto</strong>
        <span className="rm-lane-meta">ambientes y arquitectura base</span>
      </div>
      <div className="rm-track">
        <span className="rm-line" />
        {(() => {
          const left = position(inicio.sprint.fechaFin), color = colorEstado(inicio.estado);
          return (
            <RoadmapNode id="S0" href="/lineas?m=S0" className={`rm-node ${left < 7 ? "is-left" : ""}`} style={{ left: `${left}%`, "--fila": 0, "--c": color } as CSSProperties} title={`${m.nombre} (clic para ver qué obtienes)`}>
              <span className="rm-dot rm-milestone-dot">
                <span style={{ display: "block", width: 20, height: 20, borderRadius: "50%", background: color }} />
                <CompletionCheck complete={inicio.completo} label="Ambientes y arquitectura base desplegados" id="S0" />
              </span>
              <span className="rm-label">
                <span className="rm-kind">Punto de partida</span>
                <span className="rm-date">{fmtDiaSemana(inicio.sprint.fechaFin)} {fmtCorta(inicio.sprint.fechaFin)}</span>
                <span className="rm-name">{m.nombre}</span>
                <span className="rm-comparison">{inicio.completo ? "Hito cumplido" : "Hito pendiente"}</span>
              </span>
            </RoadmapNode>
          );
        })()}
      </div>
      <LaneSlot lineaId="CP" panels={{ S0: <MilestonePanel m={m} model={model} canEdit={false} /> }} />
    </div>
  );
  if (!checkpoints.length) return nota || null;
  return (
    <>
    {nota}
    <div className="rm-row rm-lane rm-checkpoint" style={{ "--filas": 2, "--linea": "var(--color-brand-primary)" } as CSSProperties}>
      <div className="rm-lane-label">
        <span className="rm-lane-id">CP</span>
        <strong>Milestones por sprint</strong>
        <span className="rm-lane-meta">S0–S6: resultado esperado</span>
      </div>
      <div className="rm-track">
        <span className="rm-line" />
        {checkpoints.map((c, index) => {
          const left = position(c.sprint.fechaFin), color = colorEstado(c.estado);
          const align = left > 93 ? "is-right" : left < 7 ? "is-left" : "";
          return (
            <RoadmapNode key={c.id} id={c.id} href={`/lineas?${areaId ? `area=${areaId}&` : ""}m=${c.id}`} className={`rm-node ${align} ${c.tareas.length ? "" : "is-muted"}`} style={{ left: `${left}%`, "--fila": index % 2, "--c": color } as CSSProperties} title={`Sprint ${c.sprint.numero} · Revisión del avance hacia milestones (clic para ver tareas)`}>
              <span className="rm-dot"><Ring value={c.total.pctReal} plan={c.completo ? undefined : c.total.pctPlan} size={44} stroke={5} color={color} track="var(--color-border-default)"><span className="rm-dot-inner">{c.id}</span></Ring><CompletionCheck complete={c.completo} label={`Sprint ${c.sprint.numero}: cierre completo verificado`} id={c.id} /></span>
              <span className="rm-label">
                <span className="rm-kind">{c.sprint.numero === 0 ? "Punto de partida" : "Milestone del sprint"}</span>
                <span className="rm-date">{fmtDiaSemana(c.sprint.fechaFin)} {fmtCorta(c.sprint.fechaFin)}</span>
                <span className="rm-name">{c.id} · {c.titulo}</span>
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
    </>
  );
}
