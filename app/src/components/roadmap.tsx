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
import { Tooltip } from "@/components/tooltip";
import { puedeMostrarObjetivoCiclo } from "@/lib/client-vocab";

const MIN_GAP = 22; // % mínimo entre nodos de una misma fila

/** Eje temporal derivado de los datos: desde el inicio del primer sprint hasta el domingo de la semana del último cierre o hito. */
function escala(model: Model) {
  const fechas = [...model.sprints.flatMap((s) => [s.fechaInicio, s.fechaFin]), ...model.milestones.map((m) => m.fechaObjetivo ?? "")].filter(Boolean).sort();
  const INICIO = fechas[0] ?? model.hoy;
  let FIN = fechas.at(-1) ?? model.hoy;
  while (isoWeekday(FIN) !== 7) FIN = addDays(FIN, 1);
  const SPAN = daysBetween(INICIO, FIN) + 1;
  return {
    INICIO, FIN, SPAN,
    x: (iso: string) => ((daysBetween(INICIO, iso) + 0.5) / SPAN) * 100,
    xStart: (iso: string) => (daysBetween(INICIO, iso) / SPAN) * 100,
  };
}

interface Nodo {
  m: MilestoneView;
  x: number;
  fila: number;
  pct: number;
  sinTareas: boolean;
}

function ubicar(ms: MilestoneView[], areaId: string | null, INICIO: string, x: (iso: string) => number): { nodos: Nodo[]; filas: number } {
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
  const { INICIO, FIN, SPAN, x, xStart } = escala(model);
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
                <Tooltip key={f.fecha} label={`Festivo: ${f.festividad} (día no laborable)`}>
                  <span className="rm-fest-tag" style={{ left: `${x(f.fecha)}%` }} aria-label={`Festivo: ${f.festividad} (día no laborable)`} tabIndex={0}>F</span>
                </Tooltip>
              ))}
            {jueves.map((j) => (
              <Tooltip key={j} label={`${demos.has(j) ? "Demostración y fecha de entrega" : "Reunión semanal de seguimiento"} · ${fmtDiaSemana(j)} ${fmtCorta(j)}`}>
                <span className={`rm-thu ${demos.has(j) ? "is-demo" : ""}`} style={{ left: `${x(j)}%` }} aria-label={`${demos.has(j) ? "Demostración y fecha de entrega" : "Reunión semanal de seguimiento"} · ${fmtDiaSemana(j)} ${fmtCorta(j)}`}>
                  {Number(j.slice(8))}
                </span>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="rm-row rm-sprints">
          <div className="rm-corner">{canEdit ? "Sprint" : "Ciclos de trabajo"}</div>
          <div className="rm-axis">
            {model.sprints.map((sp) => {
              const numero = sp.id.match(/\d+/)?.[0] ?? String(sp.numero);
              const objetivo = sp.objetivo && (canEdit || puedeMostrarObjetivoCiclo(sp.objetivo)) ? sp.objetivo : "";
              const label = sp.numero === 0
                ? (canEdit ? "S0: Inicio del proyecto: ambientes y accesos listos antes del primer ciclo" : "Inicio del proyecto: ambientes y accesos listos antes del primer ciclo")
                : `Ciclo de trabajo ${numero} (dos semanas): ${fmtCorta(sp.fechaInicio)} – ${fmtCorta(sp.fechaFin)}${objetivo ? ` · ${objetivo}` : ""}`;
              return (
                <Tooltip key={sp.id} label={label}>
                  <span
                    className="rm-sprint"
                    style={{ left: `${xStart(sp.fechaInicio)}%`, width: `${xStart(addDays(sp.fechaFin, 1)) - xStart(sp.fechaInicio)}%` }}
                    aria-label={label}
                    tabIndex={0}
                  >
                    {sp.numero === 0 ? (canEdit ? "S0" : "Inicio") : (canEdit ? `S${sp.numero}` : `Ciclo ${numero}`)}
                  </span>
                </Tooltip>
              );
            })}
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
                <span key={f.fecha} className="rm-festivo" aria-hidden="true" style={{ left: `${xStart(f.fecha)}%`, width: `${100 / SPAN}%` }}>
                </span>
              ))}
            {hoyVisible && (
              <span className="rm-hoy" style={{ left: `${x(model.hoy)}%` }}>
                <b>Hoy · {fmtCorta(model.hoy)}</b>
              </span>
            )}
          </div>

          <SprintCheckpointRow model={model} areaId={areaId} canEdit={canEdit} position={x} />
          {model.lineas.map((l) => {
            const ms = model.milestones.filter((m) => m.lineaId === l.id);
            const { nodos, filas } = ubicar(ms, areaId, INICIO, x);
            const progreso = progresoLinea(model, l.id, areaId);
            const proximo = ms.filter((m) => !m.cierreVerificado && m.fechaObjetivo && m.fechaObjetivo >= model.hoy).sort((a, b) => a.fechaObjetivo!.localeCompare(b.fechaObjetivo!))[0];
            return (
              <div className="rm-row rm-lane" key={l.id} style={{ "--filas": filas, "--linea": colorLinea(l.id), "--linea-text": textoLinea(l.id) } as CSSProperties}>
                <div className="rm-lane-label">
                  <Tooltip label={`Línea de valor ${l.id.replace(/^L/, "")}: ${l.nombre}`}>
                    <span className="rm-lane-id" aria-label={`Línea de valor ${l.id.replace(/^L/, "")}: ${l.nombre}`} tabIndex={0}>{l.id}</span>
                  </Tooltip>
                  <strong>{l.nombre}</strong>
                  <span className="rm-lane-meta">
                    {canEdit ? <>
                      {ms.length} hitos ·{" "}
                      {proximo ? (
                        <>
                          próximo: {proximo.id} el {fmtCorta(proximo.fechaObjetivo)} · <span className={`chip tone-${tono(proximo.estadoFinal)}`}>{proximo.estadoFinal.toLowerCase()}</span>
                        </>
                      ) : "todos cumplidos"}
                    </> : <>
                      {ms.length} hitos · {proximo ? <>Próximo: {proximo.id}, {fmtCorta(proximo.fechaObjetivo)} · Estado: {proximo.estadoFinal}</> : "Todos cumplidos"}
                    </>}
                    {canEdit && ` · avance ${fmtPct(progreso.pctReal)} vs ${fmtPct(progreso.pctPlan)} previsto · ponderado por días de sus tareas`}
                  </span>
                </div>
                <div className="rm-track">
                  <span className="rm-line" />
                  {nodos.map((n) => {
                    const color = colorEstado(n.m.estadoFinal);
                    const align = n.x > 93 ? "is-right" : n.x < 7 ? "is-left" : "";
                    const area = areaId ? n.m.areas.find((a) => a.areaId === areaId) : null;
                    const aporteArea = area && n.m.trabajo.dias ? (area.diasHechos / n.m.trabajo.dias) * 100 : 0;
                    const cierreVerificado = n.m.cierreVerificado ?? milestoneCompletado(n.m, model);
                    const tooltipTitle = `${n.m.id} · ${n.m.nombre} (clic para ver criterio y aceptación) · Deadline / Fin del Hito: ${fmtCorta(n.m.fechaObjetivo)}${cierreVerificado ? " · Cierre verificado" : ""}`;
                    return (
                      <RoadmapNode
                        key={n.m.id}
                        id={n.m.id}
                        href={`/lineas?${areaId ? `area=${areaId}&` : ""}m=${n.m.id}`}
                        className={`rm-node ${align} ${n.sinTareas ? "is-muted" : ""}`}
                        style={{ left: `${n.x}%`, "--fila": n.fila, "--c": color, "--p": `${n.pct}%` } as CSSProperties}
                        title={tooltipTitle}
                      >
                        <span className="rm-dot rm-milestone-dot">
                          {canEdit ? (
                            <Ring value={n.pct} size={44} stroke={5} color={color} track="var(--color-border-default)">
                              <span className="rm-dot-inner">{n.m.id.replace("M-", "M")}</span>
                            </Ring>
                          ) : (
                            <span style={{ display: "block", width: 20, height: 20, borderRadius: "50%", background: color }} />
                          )}
                          <CompletionCheck complete={cierreVerificado} label={`${n.m.id}: entrega completa verificada`} id={n.m.id} />
                        </span>
                        <span className="rm-label">
                          <span className="rm-kind">{canEdit ? "Milestone de entrega" : "Hito de entrega"}</span>
                          <span className="rm-date">
                            {fmtDiaSemana(n.m.fechaObjetivo ?? INICIO)} {fmtCorta(n.m.fechaObjetivo)}
                          </span>
                          <span className="rm-name">{n.m.nombre}</span>
                          <span className="rm-stat">
                            {canEdit && <i style={{ background: color }} />}
                            {n.sinTareas ? `Sin tareas de ${areaNombre}` : areaId ? `${areaNombre} · ${fmtPct(area?.pctReal ?? 0)}${canEdit ? ` vs ${fmtPct(area?.pctPlan ?? 0)} previsto` : ""}` : canEdit ? `Trabajo ${fmtPct(n.m.trabajo.pctReal)} vs ${fmtPct(n.m.trabajo.pctPlan)} previsto` : null}
                          </span>
                          {areaId && <span className="rm-comparison">Total milestone {fmtPct(n.m.pctPonderado)} · aporte del área {aporteArea.toFixed(1).replace(".", ",")} pts</span>}
                          <span className="rm-comparison">{canEdit ? (n.m.cierreVerificado ? "Milestone cumplido" : "Milestone pendiente") : (cierreVerificado ? "Hito cumplido" : "Hito pendiente")}</span>
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
