import Link from "next/link";
import type { CSSProperties } from "react";
import { AreaDot, Ring, StatusBadge } from "@/components/ui";
import { daysBetween, fmtCorta, fmtDiaSemana } from "@/lib/dates";
import { colorEstado, colorLinea, textoLinea } from "@/lib/format";
import type { MilestoneView, Model, Tarea } from "@/lib/model";
import { PublicarControl } from "@/components/editor/publicar-control";
import { PanelClose } from "./panel-client";
import { MilestoneWorkflow } from "../workflow/milestone-panel";
import { MetricNote } from "../metric-note";
import { MilestoneDelivery } from "../milestone-delivery";

function plazo(hoy: string, fecha: string | null, cumplido: boolean) {
  if (!fecha) return { texto: "Sin fecha", tono: "slate" };
  const n = daysBetween(hoy, fecha);
  if (n === 0) return { texto: "Es hoy", tono: "cyan" };
  if (n > 0) return { texto: n === 1 ? "Falta 1 día" : `Faltan ${n} días`, tono: "cyan" };
  return cumplido ? { texto: "Entrega confirmada", tono: "green" } : { texto: `Objetivo vencido hace ${-n} días`, tono: "red" };
}

/** Entregables de un milestone para el panel en línea de /lineas (datos ya filtrados por rol). */
export function MilestonePanel({ m, model, canEdit, isAdmin = false, areaId = null }: { m: MilestoneView; model: Model; canEdit: boolean; isAdmin?: boolean; areaId?: string | null }) {
  const hus = m.huIds.map((id) => model.huById.get(id)).filter((h) => !!h);
  const tareas = m.tareaIds.map((id) => model.tareaById.get(id)).filter((t): t is Tarea => !!t && (!areaId || t.areaId === areaId));
  const area = areaId ? m.areas.find((a) => a.areaId === areaId) : null;
  const porcentaje = areaId ? (area?.pctReal ?? 0) : m.pctPonderado;
  const hechas = tareas.filter((t) => t.estado === "Hecha").length;
  const p = plazo(model.hoy, m.fechaObjetivo, !!m.cierreVerificado);
  const color = colorEstado(m.estadoFinal);
  const riesgos = m.riesgoIds.map((id) => model.riesgoById.get(id)).filter((r) => !!r);
  const deps = [...m.dependeDe.map((id) => ({ id, rel: "Depende de" })), ...m.dependientes.map((id) => ({ id, rel: "Habilita" }))];

  return (
    <section className="ms-panel" style={{ "--linea": colorLinea(m.lineaId) } as CSSProperties} data-testid={`ms-panel-${m.id}`} aria-label={`Entregables de ${m.id}`}>
      <span className="ms-panel-grip" aria-hidden="true" />
      <header className="ms-panel-head">
        <Ring value={porcentaje} size={84} stroke={8} color={color}>
          <span className="mini-ring-label is-lg">{Math.round(porcentaje)}%</span>
        </Ring>
        <div className="ms-panel-title">
          <div className="ms-panel-tags">
            <span className="line-pill" style={{ background: colorLinea(m.lineaId), color: textoLinea(m.lineaId) }}>
              {m.lineaId}
            </span>
            <span className="ms-id">{m.id}</span>
            <StatusBadge estado={m.estadoFinal} size="sm" />
            <span className={`chip tone-${p.tono}`}>{p.texto}</span>
          </div>
          <h3 id={`panel-heading-${m.id}`}>{m.nombre}</h3>
          <p className="muted small">{areaId ? "Trabajo del área hacia el milestone" : "Trabajo hacia el milestone"}: {Math.round(porcentaje)} %. Cumplimiento: {m.cierreVerificado ? "confirmado" : "pendiente"}.</p>
          <p className="ms-panel-meta">
            <b>
              {fmtDiaSemana(m.fechaObjetivo ?? model.hoy, true)} {fmtCorta(m.fechaObjetivo)}
            </b>{" "}
            · {m.linea?.nombre} ·{" "}
            {model.capa === "oficial"
              ? `${hechas}/${tareas.length} tareas entregadas`
              : `${hechas}/${tareas.length} hechas (técnico interno) · ${tareas.filter((t) => t.publicadoCliente).length} publicadas`}{" "}
            · {m.spTotal} SP
            {areaId && <> · Área: {model.areaById.get(areaId)?.nombre}</>}
          </p>
        </div>
        <div className="ms-panel-actions">
          {isAdmin && <PublicarControl tipo="milestone" id={m.id} estado={m.estado} publicada={m.publicado} fecha={m.fechaCierre} nota={m.evidencia} />}
          <Link href={`/milestones/${m.id}`} className="btn btn-ghost btn-sm">
            Ver detalle completo →
          </Link>
          <PanelClose />
        </div>
      </header>

      <MilestoneDelivery m={m} model={model} />
      <MetricNote capa={model.capa} hoy={model.hoy} alcance={`${m.id}${areaId ? ` · ${model.areaById.get(areaId)?.nombre}` : " · tareas de este milestone"}`} />

      <div className="ms-panel-body">
        <div className="ms-panel-col">
          {canEdit && <MilestoneWorkflow id={m.id} model={model} editar />}
          {m.cierreVerificado && (
            <p className="ms-entregado" data-testid={`entregado-${m.id}`}>
              <b>Entregado el {fmtCorta(m.fechaCierre)}</b> · {m.evidencia}
            </p>
          )}
          <div className="ms-panel-value">
            <span className="kicker">Valor de referencia del plan</span>
            <p>{m.valorCliente ?? "—"}</p>
          </div>
          <div className="ms-panel-block">
            <h4>Dependencias</h4>
            {deps.length === 0 ? (
              <p className="muted small">Sin dependencias con otros milestones (hitos).</p>
            ) : (
              <ul className="panel-deps">
                {deps.map((d) => {
                  const dm = model.milestoneById.get(d.id);
                  if (!dm) return null;
                  return (
                    <li key={`${d.rel}-${d.id}`}>
                      <span className="muted small">{d.rel}</span>
                      <span className="dep-dot" style={{ background: colorEstado(dm.estadoFinal) }} />
                      <b>{d.id}</b>
                      <span className="panel-deps-name">{dm.nombre}</span>
                      <em>{fmtCorta(dm.fechaObjetivo)}</em>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {(canEdit || riesgos.length > 0) && (
            <div className="ms-panel-block">
              <h4>Riesgos</h4>
              {riesgos.length === 0 ? (
                <p className="muted small">Sin riesgos asociados.</p>
              ) : (
                <ul className="panel-risks">
                  {riesgos.map((r) => (
                    <li key={r.id} className={r.interno ? "is-internal" : ""}>
                      <b>{r.id}</b>
                      {canEdit && r.interno && <span className="chip tone-slate">Interno</span>}
                      <span>{r.descripcion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="ms-panel-col">
          <h4>
            Historias de usuario <span>{hus.length}</span>
          </h4>
          <ul className="panel-hu">
            {hus.map((h) => (
              <li key={h.id}>
                <Link href={`/historias/${h.id}#descripcion`}>
                  <b>{h.id}</b>
                  <span className="panel-hu-name">{h.nombre}</span>
                  <em>{h.sp ?? 0} SP</em>
                  <StatusBadge estado={h.estado} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ms-panel-col">
          <h4>
            Tareas por área <span>{tareas.length}</span>
          </h4>
          <div className="panel-areas">
            {model.areas
              .filter((a) => tareas.some((t) => t.areaId === a.id))
              .map((a) => {
                const ts = tareas
                  .filter((t) => t.areaId === a.id)
                  .sort((x, y) => Number(y.estado === "Hecha") - Number(x.estado === "Hecha") || (x.fechaFin ?? "").localeCompare(y.fechaFin ?? ""));
                const hechas = ts.filter((t) => t.estado === "Hecha").length;
                return (
                  <div key={a.id} className="panel-area">
                    <h5>
                      <AreaDot areaId={a.id} /> {a.nombre}
                      <em>
                        {hechas}/{ts.length}
                      </em>
                    </h5>
                    <ul>
                      {ts.map((t) => (
                        <li key={t.id} className={t.estado === "Hecha" ? "is-done" : ""}>
                          <Link href={`/tareas/${t.id}`} className="panel-task">
                            <b>{t.id}</b>
                            <span className="panel-task-name">{t.nombre}</span>
                            <StatusBadge estado={t.estado} size="sm" />
                          </Link>
                          {t.estado === "Hecha" && t.evidencia && (
                            <span className="panel-evid" title={t.evidencia}>
                              {t.evidencia}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
