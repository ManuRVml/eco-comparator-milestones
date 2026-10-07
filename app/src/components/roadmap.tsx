import type { CSSProperties } from "react";
import { MilestonePanel } from "@/components/milestone-panel/panel";
import { Ring } from "@/components/ui";
import { LaneSlot, PanelProvider, RoadmapNode } from "@/components/milestone-panel/panel-client";
import { addDays, daysBetween, fmtCorta, fmtDiaSemana, isoWeekday, mesLargo } from "@/lib/dates";
import { colorEstado, colorLinea, fmtPct, textoLinea, tono } from "@/lib/format";
import type { MilestoneView, Model } from "@/lib/model";
import { SprintCheckpointRow } from "@/components/sprint-checkpoint-row";
import { progresoLinea } from "@/lib/line-progress";
import { milestoneCompletado } from "@/lib/completion";
import { CompletionCheck } from "@/components/completion-check";

const INICIO = "2026-09-21";
const FIN = "2026-12-20";
const SPAN = daysBetween(INICIO, FIN) + 1;
const MIN_GAP = 22; // % mínimo entre nodos de una misma fila

const x = (iso: string) => ((daysBetween(INICIO, iso) + 0.5) / SPAN) * 100;
const xStart = (iso: string) => (daysBetween(INICIO, iso) / SPAN) * 100;

interface Nodo {
  m: MilestoneView;
  x: number;
  fila: number;
  pct: number;
  sinTareas: boolean;
}

function ubicar(ms: MilestoneView[], areaId: string | null): { nodos: Nodo[]; filas: number } {
  const ultimos: number[] = [];
  const nodos: Nodo[] = [];
  for (const m of [...ms].sort((a, b) => (a.fechaObjetivo ?? "").localeCompare(b.fechaObjetivo ?? ""))) {
    const px = x(m.fechaObjetivo ?? INICIO);
    let fila = ultimos.findIndex((u) => px - u >= MIN_GAP);
    if (fila === -1) {
      fila = ultimos.length;
      ultimos.push(px);
    } else ultimos[fila] = px;
    const area = areaId ? m.areas.find((a) => a.areaId === areaId) : null;
    nodos.push({
      m,
      x: px,
      fila,
      pct: areaId ? (area?.pctReal ?? 0) : m.pctPonderado,
      sinTareas: !!areaId && !area,
    });
  }
  return { nodos, filas: Math.max(1, ultimos.length) };
}

export function Roadmap({ model, areaId, inicial, canEdit, isAdmin = false }: { model: Model; areaId: string | null; inicial: string | null; canEdit: boolean; isAdmin?: boolean }) {
  const lineaDe = Object.fromEntries(model.milestones.map((m) => [m.id, m.lineaId ?? ""]));
  for (const sprint of model.sprints) lineaDe[`S${sprint.numero}`] = "CP";
  const jueves: string[] = [];
  for (let d = INICIO; d <= FIN; d = addDays(d, 1)) if (isoWeekday(d) === 4) jueves.push(d);
  const demos = new Set([...model.agendaWeekly.map((w) => w.fecha), ...model.milestones.map((m) => m.fechaObjetivo ?? "")]);
  const meses: { iso: string; left: number }[] = [];
  for (let d = INICIO; d <= FIN; d = addDays(d, 1)) if (d === INICIO || d.endsWith("-01")) meses.push({ iso: d, left: xStart(d) });
  const hoyVisible = model.hoy >= INICIO && model.hoy <= FIN;
  const areaNombre = areaId ? model.areaById.get(areaId)?.nombre : null;

  return (
    <PanelProvider initial={inicial && inicial in lineaDe ? inicial : null} lineaDe={lineaDe}>
    <div className="roadmap-scroll">
      <div className="roadmap" data-testid="roadmap">
        <div className="rm-row rm-head">
          <div className="rm-corner">Línea</div>
          <div className="rm-axis">
            {meses.map((mm, i) => (
              <span key={mm.iso} className={`rm-month ${i === 0 ? "is-first" : ""}`} style={{ left: `${mm.left}%` }}>
                {mesLargo(mm.iso)}
              </span>
            ))}
            {model.festivos
              .filter((f) => f.fecha >= INICIO && f.fecha <= FIN)
              .map((f) => (
                <span key={f.fecha} className="rm-fest-tag" style={{ left: `${x(f.fecha)}%` }} title={`Festivo · ${f.festividad}`}>
                  F
                </span>
              ))}
            {jueves.map((j) => (
              <span key={j} className={`rm-thu ${demos.has(j) ? "is-demo" : ""}`} style={{ left: `${x(j)}%` }} title={`Weekly jue ${fmtCorta(j)}${demos.has(j) ? " · demo" : ""}`}>
                {Number(j.slice(8))}
              </span>
            ))}
          </div>
        </div>
        <div className="rm-row rm-sprints">
          <div className="rm-corner">Sprint</div>
          <div className="rm-axis">
            {model.sprints.map((sp) => (
              <span
                key={sp.id}
                className="rm-sprint"
                style={{ left: `${xStart(sp.fechaInicio)}%`, width: `${xStart(addDays(sp.fechaFin, 1)) - xStart(sp.fechaInicio)}%` }}
                title={`${sp.id}: ${fmtCorta(sp.fechaInicio)} – ${fmtCorta(sp.fechaFin)}${sp.objetivo ? ` · ${sp.objetivo}` : ""}`}
              >
                S{sp.numero}
              </span>
            ))}
          </div>
        </div>

        <div className="rm-body">
          <div className="rm-bg" aria-hidden="true">
            {model.sprints.map((sp, i) => (
              <span
                key={sp.id}
                className={`rm-band ${i % 2 ? "is-odd" : ""}`}
                style={{ left: `${xStart(sp.fechaInicio)}%`, width: `${xStart(addDays(sp.fechaFin, 1)) - xStart(sp.fechaInicio)}%` }}
              />
            ))}
            {meses.slice(1).map((mm) => (
              <span key={mm.iso} className="rm-month-line" style={{ left: `${mm.left}%` }} />
            ))}
            {model.festivos
              .filter((f) => f.fecha >= INICIO && f.fecha <= FIN)
              .map((f) => (
                <span key={f.fecha} className="rm-festivo" style={{ left: `${xStart(f.fecha)}%`, width: `${100 / SPAN}%` }} title={`Festivo · ${fmtDiaSemana(f.fecha)} ${fmtCorta(f.fecha)} · ${f.festividad}`}>
                </span>
              ))}
            {hoyVisible && (
              <span className="rm-hoy" style={{ left: `${x(model.hoy)}%` }}>
                <b>Hoy · {fmtCorta(model.hoy)}</b>
              </span>
            )}
          </div>

          {canEdit && <SprintCheckpointRow model={model} areaId={areaId} canEdit={canEdit} position={x} />}
          {model.lineas.map((l) => {
            const ms = model.milestones.filter((m) => m.lineaId === l.id);
            const { nodos, filas } = ubicar(ms, areaId);
            const progreso = progresoLinea(model, l.id, areaId);
            const proximo = ms.filter((m) => !m.cierreVerificado && m.fechaObjetivo && m.fechaObjetivo >= model.hoy).sort((a, b) => a.fechaObjetivo!.localeCompare(b.fechaObjetivo!))[0];
            return (
              <div className="rm-row rm-lane" key={l.id} style={{ "--filas": filas, "--linea": colorLinea(l.id), "--linea-text": textoLinea(l.id) } as CSSProperties}>
                <div className="rm-lane-label">
                  <span className="rm-lane-id">{l.id}</span>
                  <strong>{l.nombre}</strong>
                  <span className="rm-lane-meta">
                    {ms.length} hitos ·{" "}
                    {proximo ? (
                      <>
                        próximo: {proximo.id} el {fmtCorta(proximo.fechaObjetivo)} · <span className={`chip tone-${tono(proximo.estadoFinal)}`}>{proximo.estadoFinal.toLowerCase()}</span>
                      </>
                    ) : (
                      "todos cumplidos"
                    )}
                    {canEdit && ` · avance ${fmtPct(progreso.pctReal)} vs ${fmtPct(progreso.pctPlan)} previsto`}
                  </span>
                </div>
                <div className="rm-track">
                  <span className="rm-line" />
                  {nodos.map((n) => {
                    const color = colorEstado(n.m.estadoFinal);
                    const align = n.x > 93 ? "is-right" : n.x < 7 ? "is-left" : "";
                    const area = areaId ? n.m.areas.find((a) => a.areaId === areaId) : null;
                    const aporteArea = area && n.m.trabajo.dias ? (area.diasHechos / n.m.trabajo.dias) * 100 : 0;
                    return (
                      <RoadmapNode
                        key={n.m.id}
                        id={n.m.id}
                        href={`/lineas?${areaId ? `area=${areaId}&` : ""}m=${n.m.id}`}
                        className={`rm-node ${align} ${n.sinTareas ? "is-muted" : ""}`}
                        style={{ left: `${n.x}%`, "--fila": n.fila, "--c": color, "--p": `${n.pct}%` } as CSSProperties}
                        title={`${n.m.id} · ${n.m.nombre} (clic para ver criterio y aceptación)`}
                      >
                        <span className="rm-dot rm-milestone-dot">
                          {canEdit ? (
                            <Ring value={n.pct} size={44} stroke={5} color={color} track="var(--color-border-default)">
                              <span className="rm-dot-inner">{n.m.id.replace("M-", "M")}</span>
                            </Ring>
                          ) : (
                            <span style={{ display: "block", width: 20, height: 20, borderRadius: "50%", background: color }} />
                          )}
                          <CompletionCheck complete={n.m.cierreVerificado ?? milestoneCompletado(n.m, model)} label={`${n.m.id}: entrega completa verificada`} id={n.m.id} />
                        </span>
                        <span className="rm-label">
                          <span className="rm-kind">Milestone de entrega</span>
                          <span className="rm-date">
                            {fmtDiaSemana(n.m.fechaObjetivo ?? INICIO)} {fmtCorta(n.m.fechaObjetivo)}
                          </span>
                          <span className="rm-name">{n.m.nombre}</span>
                          <span className="rm-stat">
                            {canEdit && <i style={{ background: color }} />}
                            {n.sinTareas ? `Sin tareas de ${areaNombre}` : areaId ? `${areaNombre} · ${fmtPct(area?.pctReal ?? 0)}` : canEdit ? `Trabajo ${fmtPct(n.m.pctPonderado)}` : null}
                          </span>
                          {areaId && <span className="rm-comparison">Total milestone {fmtPct(n.m.pctPonderado)} · aporte del área {aporteArea.toFixed(1).replace(".", ",")} pts</span>}
                          <span className="rm-comparison">{n.m.cierreVerificado ? "Milestone cumplido" : "Milestone pendiente"}</span>
                        </span>
                      </RoadmapNode>
                    );
                  })}
                </div>
                <LaneSlot lineaId={l.id} panels={Object.fromEntries(ms.map((m) => [m.id, <MilestonePanel key={m.id} m={m} model={model} canEdit={canEdit} isAdmin={isAdmin} areaId={areaId} />]))} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </PanelProvider>
  );
}
