import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ESTADOS_HISTORIA } from "@/db/schema";
import { EstadoControl } from "@/components/editor/estado-control";
import { PublicarControl } from "@/components/editor/publicar-control";
import { VisibilidadToggle } from "@/components/editor/visibilidad-toggle";
import { Notas } from "@/components/notas";
import { TareaRow } from "@/components/tarea-row";
import { AreaDot, Breadcrumb, Card, Chip, Empty, ProgressBar, Ring, StatusBadge } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { fmtCorta, fmtDiaSemana, fmtLarga, relativo } from "@/lib/dates";
import { colorArea, colorEstado, colorLinea, fmtPct } from "@/lib/format";
import { ESTADOS_MILESTONE, type Model, type Tarea } from "@/lib/model";
import { MetricNote } from "@/components/metric-note";

function ordenar(ts: Tarea[]) {
  const hechas = ts.filter((t) => t.estado === "Hecha").sort((a, b) => (a.fechaCierre ?? "").localeCompare(b.fechaCierre ?? "") || a.id.localeCompare(b.id));
  const resto = ts.filter((t) => t.estado !== "Hecha").sort((a, b) => (a.fechaFin ?? "").localeCompare(b.fechaFin ?? "") || a.id.localeCompare(b.id));
  return { hechas, resto };
}

export default async function MilestonePage({ params, searchParams }: PageProps<"/milestones/[id]">) {
  const session = await requireSession();
  const model = await getModel(session);
  const { id } = await params;
  const sp = await searchParams;
  const m = model.milestoneById.get(id);
  if (!m) notFound();
  const tab = sp.tab === "hu" ? "hu" : "area";
  const areaFoco = typeof sp.area === "string" ? sp.area : null;
  const tareas = m.tareaIds.map((t) => model.tareaById.get(t)).filter((t): t is Tarea => !!t);
  const hus = m.huIds.map((h) => model.huById.get(h)).filter((h) => !!h);
  const color = colorEstado(m.estadoFinal);
  const q = areaFoco ? `&area=${areaFoco}` : "";

  return (
    <main className="page" data-testid="milestone">
      <Breadcrumb items={[{ label: "Líneas de tiempo", href: "/lineas" }, { label: `${m.id}` }]} />

      <section className="ms-hero" style={{ "--linea": colorLinea(m.lineaId), "--c": color } as CSSProperties}>
        <div className="ms-hero-main">
          <div className="ms-hero-tags">
            <span className="line-pill" style={{ background: colorLinea(m.lineaId) }}>
              {m.lineaId} · {m.linea?.nombre}
            </span>
            <span className="ms-id">{m.id}</span>
            <StatusBadge estado={m.estadoFinal} />
            <span className="muted small">{m.override ? "Estado ajustado por el editor" : "Estado sugerido automáticamente"}</span>
          </div>
          <h2>{m.nombre}</h2>
          <dl className="ms-meta">
            <div>
              <dt>Fecha objetivo</dt>
              <dd>
                {fmtDiaSemana(m.fechaObjetivo ?? "", true)} {fmtLarga(m.fechaObjetivo)} <em>· {relativo(model.hoy, m.fechaObjetivo ?? model.hoy)}</em>
              </dd>
            </div>
            <div>
              <dt>Sprints</dt>
              <dd>{m.sprintsTexto ?? "—"}</dd>
            </div>
            <div>
              <dt>Historias</dt>
              <dd>
                {m.huIds.length} HU · {m.spTotal} SP
              </dd>
            </div>
            <div>
              <dt>Épicas</dt>
              <dd>{m.epicas?.replaceAll(";", " · ") ?? "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="ms-hero-gauge">
          <Ring value={m.pctPonderado} size={148} stroke={13} color={color}>
            <span className="gauge-pct is-dark">{Math.round(m.pctPonderado)}%</span>
            <span className="gauge-sub is-dark">
              {m.tareasHechas}/{m.tareasTotal} tareas
            </span>
          </Ring>
          <div className="ms-hero-stats">
            <div>
              <span>Ponderado por días</span>
              <strong>{fmtPct(m.pctPonderado)}</strong>
            </div>
            <div>
              <span>SP {model.config.progreso_incluye_lista_demo === "1" ? "aceptados o en demo" : "aceptados"}</span>
              <strong>
                {m.spCompletos}/{m.spTotal}
              </strong>
            </div>
            {session.canEdit && (
              <div>
                <span>Publicadas a Ecopetrol</span>
                <strong>
                  {m.tareasPublicadas}/{m.tareasTotal}
                </strong>
              </div>
            )}
            <div>
              <span>HU completas</span>
              <strong>
                {m.huCompletas}/{m.huIds.length}
              </strong>
            </div>
          </div>
        </div>
      </section>
      <MetricNote capa={model.capa} hoy={model.hoy} alcance={`${m.id} completo; el desglose por área usa las tareas de cada disciplina`} />

      {m.criticasVencidas.length > 0 && (
        <div className="alert tone-amber" role="status">
          <strong>Atención:</strong> {m.criticasVencidas.length === 1 ? "una tarea en ruta crítica venció" : `${m.criticasVencidas.length} tareas en ruta crítica vencieron`} sin cerrarse:{" "}
          {m.criticasVencidas.map((t, i) => (
            <span key={t}>
              {i > 0 && ", "}
              <Link href={`/tareas/${t}`}>{t}</Link>
              {model.tareaById.get(t)?.fechaFin ? ` (fin ${fmtCorta(model.tareaById.get(t)?.fechaFin)})` : ""}
            </span>
          ))}
          .
        </div>
      )}

      {m.publicado && (
        <div className="alert tone-green" role="status">
          <strong>Entregado el {fmtLarga(m.fechaCierre)}:</strong> {m.evidencia}
        </div>
      )}

      <div className="grid-2 value-grid">
        <Card kicker="QUÉ RECIBE EL EQUIPO ECOPETROL" className="quote-card">
          <blockquote>{m.valorCliente ?? "—"}</blockquote>
        </Card>
        <Card kicker="CRITERIO DE ACEPTACIÓN" className="criterio-card">
          <p>{m.criterio ?? "—"}</p>
        </Card>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="tabs" role="tablist">
            <Link href={`/milestones/${m.id}?tab=area${q}`} role="tab" aria-selected={tab === "area"} className={`tab ${tab === "area" ? "is-on" : ""}`}>
              Por área <span>{m.areas.length}</span>
            </Link>
            <Link href={`/milestones/${m.id}?tab=hu${q}`} role="tab" aria-selected={tab === "hu"} className={`tab ${tab === "hu" ? "is-on" : ""}`}>
              Por historia de usuario <span>{hus.length}</span>
            </Link>
          </div>

          {tab === "area" ? (
            <div className="branches">
              {m.areas.map((a) => {
                const ts = tareas.filter((t) => t.areaId === a.areaId);
                const { hechas, resto } = ordenar(ts);
                return (
                  <details key={a.areaId} className="branch" open={!areaFoco || areaFoco === a.areaId} style={{ "--a": colorArea(a.areaId) } as CSSProperties}>
                    <summary>
                      <span className="branch-name">
                        <AreaDot areaId={a.areaId} />
                        {a.nombre}
                      </span>
                      <span className="branch-bar">
                        <ProgressBar value={a.pctReal} color={colorArea(a.areaId)} height={8} label={`Avance ponderado ${a.nombre}`} />
                      </span>
                      <span className="branch-stats">
                        <b>
                          {a.hechas}/{a.total}
                        </b>{" "}
                        tareas · {fmtPct(a.pctReal, 0)} ponderado
                      </span>
                    </summary>
                    {hechas.length > 0 && (
                      <>
                        <h4 className="branch-sub">Ejecutado hasta la fecha</h4>
                        <ul className="tarea-list">
                          {hechas.map((t) => (
                            <TareaRow key={t.id} t={t} model={model} canEdit={session.canEdit} />
                          ))}
                        </ul>
                      </>
                    )}
                    {resto.length > 0 && (
                      <>
                        <h4 className="branch-sub">Pendiente</h4>
                        <ul className="tarea-list">
                          {resto.map((t) => (
                            <TareaRow key={t.id} t={t} model={model} canEdit={session.canEdit} />
                          ))}
                        </ul>
                      </>
                    )}
                  </details>
                );
              })}
              {m.areas.length === 0 && <Empty>Este milestone no tiene tareas asociadas.</Empty>}
            </div>
          ) : (
            <HuTab model={model} huIds={m.huIds} canEdit={session.canEdit} />
          )}
        </div>

        <aside className="detail-side">
          {session.canEdit && (
            <Card kicker="EDITOR" title="Control del milestone" className="editor-card">
              <label className="field-label">Estado (automático o manual)</label>
              <EstadoControl tipo="milestone" id={m.id} estado={m.override ? m.estado : "Automático"} estados={["Automático", ...ESTADOS_MILESTONE]} />
              <p className="muted small">Sugerido hoy: {m.estadoSugerido}</p>
              <div className="field-row">
                <span className="field-label">Aprobar y publicar el milestone</span>
                <PublicarControl tipo="milestone" id={m.id} estado={m.estado} publicada={m.publicado} fecha={m.fechaCierre} nota={m.evidencia} />
              </div>
              <div className="field-row">
                <span className="field-label">Visible para Ecopetrol</span>
                <VisibilidadToggle tipo="milestone" id={m.id} visible={m.visibleCliente} />
              </div>
            </Card>
          )}

          <Card kicker="SECUENCIA" title="Dependencias">
            <DepList titulo="Depende de" ids={m.dependeDe} model={model} vacio="No depende de otros milestones." />
            <DepList titulo="Habilita" ids={m.dependientes} model={model} vacio="Ningún milestone depende de este." />
          </Card>

          {(session.canEdit || m.riesgoIds.length > 0) && (
          <Card kicker="RIESGOS" title="Riesgos asociados">
            {m.riesgoIds.length === 0 ? (
              <Empty>Sin riesgos visibles para este milestone.</Empty>
            ) : (
              <ul className="risk-list" data-testid="risk-list">
                {m.riesgoIds.map((rid) => {
                  const r = model.riesgoById.get(rid);
                  if (!r) return null;
                  return (
                    <li key={r.id} className={r.interno ? "is-internal" : ""}>
                      <div className="risk-head">
                        <b>{r.id}</b>
                        {r.probabilidad && <Chip tone="amber">Prob. {r.probabilidad}</Chip>}
                        {r.impacto && <Chip tone="red">Impacto {r.impacto}</Chip>}
                        {session.canEdit && <VisibilidadToggle tipo="riesgo" id={r.id} visible={!r.interno} etiqueta={r.interno ? "Interno" : "Visible para Ecopetrol"} />}
                      </div>
                      <p>{r.descripcion}</p>
                      {r.mitigacion && (
                        <p className="risk-mit">
                          <span>Mitigación</span> {r.mitigacion}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          )}

          {m.avanceCodigoEvidencia && (
            <Card kicker="SOLO EQUIPO · EVIDENCIA AL CORTE" title="Respaldo técnico interno">
              <p className="evid-text">{m.avanceCodigoEvidencia}</p>
            </Card>
          )}

          <Notas model={model} entidadTipo="milestone" entidadId={m.id} canEdit={session.canEdit} />
        </aside>
      </div>
    </main>
  );
}

function DepList({ titulo, ids, model, vacio }: { titulo: string; ids: string[]; model: Model; vacio: string }) {
  return (
    <div className="dep-block">
      <h4>{titulo}</h4>
      {ids.length === 0 ? (
        <p className="muted small">{vacio}</p>
      ) : (
        <ul className="dep-list">
          {ids.map((d) => {
            const dm = model.milestoneById.get(d);
            if (!dm) return null;
            return (
              <li key={d}>
                <Link href={`/milestones/${d}`}>
                  <span className="dep-dot" style={{ background: colorEstado(dm.estadoFinal) }} />
                  <b>{d}</b>
                  <span className="dep-name">{dm.nombre}</span>
                  <em>{fmtCorta(dm.fechaObjetivo)}</em>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function HuTab({ model, huIds, canEdit }: { model: Model; huIds: string[]; canEdit: boolean }) {
  const hus = huIds.map((h) => model.huById.get(h)).filter((h) => !!h);
  if (hus.length === 0) return <Empty>No hay historias visibles en este milestone.</Empty>;
  return (
    <ul className="hu-list">
      {hus.map((h) => {
        const ts = (model.tareasPorHu.get(h.id) ?? []).map((t) => model.tareaById.get(t)).filter((t): t is Tarea => !!t);
        const hechas = ts.filter((t) => t.estado === "Hecha").length;
        const weekly = model.weeklyPorHu.get(h.id);
        return (
          <li key={h.id}>
            <details className="hu-item">
              <summary>
                <span className="hu-id">
                  <Link href={`/historias/${h.id}`}>{h.id}</Link>
                </span>
                <span className="hu-name">{h.nombre}</span>
                <span className="hu-meta">
                  <StatusBadge estado={h.estado} size="sm" />
                  <span className="sp-pill">{h.sp ?? 0} SP</span>
                  {weekly && <span className="muted small">Demo {fmtCorta(weekly)}</span>}
                  <span className="muted small">
                    {hechas}/{ts.length} tareas
                  </span>
                </span>
              </summary>
              <div className="hu-body">
                {canEdit && (
                  <div className="hu-edit">
                    <span className="field-label">Estado de la HU</span>
                    <EstadoControl tipo="historia" id={h.id} estado={h.estado} estados={ESTADOS_HISTORIA} evidencia={h.evidencia} compact />
                    <VisibilidadToggle tipo="historia" id={h.id} visible={h.visibleCliente} />
                  </div>
                )}
                {model.areas
                  .filter((a) => ts.some((t) => t.areaId === a.id))
                  .map((a) => (
                    <div key={a.id} className="hu-area">
                      <h5>
                        <AreaDot areaId={a.id} /> {a.nombre}
                      </h5>
                      <ul className="tarea-list">
                        {ts
                          .filter((t) => t.areaId === a.id)
                          .map((t) => (
                            <TareaRow key={t.id} t={t} model={model} canEdit={canEdit} />
                          ))}
                      </ul>
                    </div>
                  ))}
                {ts.length === 0 && <Empty>Esta HU no tiene tareas técnicas propias.</Empty>}
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
