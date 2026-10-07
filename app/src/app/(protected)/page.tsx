import Link from "next/link";
import type { CSSProperties } from "react";
import { AreaBullets } from "@/components/area-chart";
import { AreaDot, Card, Empty, MiniRing, ProgressBar, Ring, StatusBadge } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { daysBetween, fmtCorta, fmtDiaSemana, fmtLarga, relativo } from "@/lib/dates";
import { colorEstado, colorLinea, fmtPct, TONE_COLOR, TONE_TEXT_COLOR, tono } from "@/lib/format";
import { ESTADOS_MILESTONE, type Model } from "@/lib/model";
import { progresoLinea } from "@/lib/line-progress";
import { MetricNote } from "@/components/metric-note";
import { DeliveryNote } from "@/components/delivery-note";
import { SprintReviews } from "@/components/sprint-reviews";
import { CompletionCheck } from "@/components/completion-check";
import { MilestoneOverview } from "@/components/milestone-overview";

const HU_ORDEN = ["Aceptada", "Lista para demo", "En curso", "No iniciada", "Bloqueada"];

export default async function DashboardPage() {
  const session = await requireSession();
  const model = await getModel(session);
  const k = model.kpis;
  const verAreas = session.canEdit || model.config.resumen_area_ecopetrol === "1";
  const diasWeekly = daysBetween(model.hoy, model.proximoWeekly);
  const demo = model.proximaDemo ? model.agendaWeekly.find((w) => w.fecha === model.proximaDemo) : null;
  const msDemo = model.proximaDemo ? model.milestones.filter((m) => m.fechaObjetivo === model.proximaDemo) : [];
  const proximos = model.milestones.filter((m) => (m.fechaObjetivo ?? "") >= model.hoy).slice(0, 4);
  const recientes = model.tareas
    .filter((t) => t.estado === "Hecha")
    .sort((a, b) => (b.fechaCierre ?? "").localeCompare(a.fechaCierre ?? "") || b.id.localeCompare(a.id))
    .slice(0, 6);
  // Capa oficial para todos en el hero; la técnica solo para el equipo, rotulada como interna.
  const of = session.canEdit && model.oficial ? model.oficial.total : model.total;
  const tec = session.canEdit ? model.total : null;
  const brecha = of.pctReal - of.pctPlan;
  const esCliente = model.capa === "oficial";
  const spNoIniciado = k.spTotal - k.spCompletos - k.spEnCurso;

  return (
    <main className="page" data-testid="dashboard">
      <MilestoneOverview model={model} cliente={!session.canEdit} />
      <details className="work-summary"><summary>Trabajo hacia los milestones · {fmtPct(of.pctReal)} publicado{tec && ` · ${fmtPct(tec.pctReal)} técnico`}</summary>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="hero-kicker-dot" /> EJECUCIÓN OFICIAL DEL PROYECTO · CORTE {fmtLarga(model.hoy).toUpperCase()}
          </span>
          <h2 data-testid="hero-titulo">
            <span className="hero-num">{of.hechas}</span> de {of.total} tareas entregadas al equipo Ecopetrol
          </h2>
          <p>Solo cuenta lo entregado y publicado en los weeklies; las fechas planificadas no certifican entregas. El avance y el plan se ponderan por los días hábiles de las tareas.</p>
          <div className="hero-stats" data-testid="hero-stats">
            <div>
              <span>Trabajo publicado hacia milestones</span>
              <strong>{fmtPct(of.pctReal)}</strong>
            </div>
            <div>
              <span>Planificado a hoy</span>
              <strong>{fmtPct(of.pctPlan)}</strong>
            </div>
            <div>
              <span>Brecha vs. plan</span>
              <strong className={brecha >= 0 ? "is-pos" : "is-neg"}>
                {brecha >= 0 ? "+" : ""}
                {brecha.toFixed(1).replace(".", ",")} pts
              </strong>
            </div>
          </div>
        </div>
        <div className="hero-gauge">
          <Ring value={of.pctReal} size={228} stroke={10} color="var(--color-ai-accent)" track="color-mix(in srgb, var(--color-surface-card) 16%, transparent)" plan={of.pctPlan}>
            <span className="gauge-pct">{Math.round(of.pctReal)}%</span>
            <span className="gauge-sub">
              {of.hechas}/{of.total} tareas entregadas
            </span>
          </Ring>
          <span className="gauge-legend">
            <i /> punto = planificado a hoy ({fmtPct(of.pctPlan)})
          </span>
        </div>
      </section>

      {tec && (
        <section className="internal-band" data-testid="avance-tecnico" aria-label="Avance técnico interno">
          <div className="internal-head">
            <span className="internal-tag">Solo equipo</span>
            <h3>Avance técnico interno (local, no visible para el equipo Ecopetrol)</h3>
            <p>
              Evidencia técnica sugerida (código en ambientes locales): orienta la decisión, nunca fija el estado oficial. Las tarjetas y gráficas de abajo
              muestran esta capa; el equipo Ecopetrol solo ve lo que un editor o administrador aprueba y publica.
            </p>
          </div>
          <div className="internal-stats">
            <div>
              <span>Tareas hechas (técnico)</span>
              <strong>
                {tec.hechas}/{tec.total}
              </strong>
            </div>
            <div>
              <span>Trabajo técnico hacia milestones</span>
              <strong>{fmtPct(tec.pctReal)}</strong>
            </div>
            <div>
              <span>Brecha técnica vs. plan</span>
              <strong>
                {tec.pctReal - tec.pctPlan >= 0 ? "+" : ""}
                {(tec.pctReal - tec.pctPlan).toFixed(1).replace(".", ",")} pts
              </strong>
            </div>
            <div className="is-accent">
              <span>Construido sin publicar</span>
              <strong>{tec.hechas - of.hechas} tareas</strong>
            </div>
          </div>
        </section>
      )}
      </details>

      <MetricNote capa={model.capa} hoy={model.hoy} alcance="Proyecto completo; cabecera oficial y detalle según la capa indicada" cliente={!session.canEdit} />
      <DeliveryNote />

      {session.canEdit && (
      <section className="kpi-grid" aria-label="Indicadores clave">
        <article className="kpi">
          <span className="kpi-label">Historias de usuario</span>
          <div className="kpi-value">
            {k.huTotal}
            <small>HU</small>
          </div>
          <div className="stack-bar" aria-hidden="true">
            {HU_ORDEN.filter((e) => k.huPorEstado[e]).map((e) => (
              <span key={e} style={{ flex: k.huPorEstado[e], background: TONE_COLOR[tono(e)] }} title={`${e}: ${k.huPorEstado[e]}`} />
            ))}
          </div>
          <ul className="kpi-legend">
            {HU_ORDEN.slice(0, 4).map((e) => (
              <li key={e}>
                <i style={{ background: TONE_COLOR[tono(e)] }} />
                {e} <b>{k.huPorEstado[e] ?? 0}</b>
              </li>
            ))}
          </ul>
          {k.huR2 > 0 && (
            <p className="kpi-note" data-testid="kpi-r2">
              Fuera del MVP (R2): {k.huR2} HU · {k.spR2} SP
            </p>
          )}
        </article>

        <article className="kpi">
          <span className="kpi-label">Story points</span>
          <div className="kpi-value">
            {k.spTotal}
            <small>SP</small>
          </div>
          <div className="stack-bar" aria-hidden="true">
            {k.spCompletos > 0 && <span style={{ flex: k.spCompletos, background: TONE_COLOR.green }} />}
            {k.spEnCurso > 0 && <span style={{ flex: k.spEnCurso, background: TONE_COLOR.cyan }} />}
            {spNoIniciado > 0 && <span style={{ flex: spNoIniciado, background: TONE_COLOR.slate }} />}
          </div>
          <ul className="kpi-legend">
            <li>
              <i style={{ background: TONE_COLOR.green }} />
              {model.config.progreso_incluye_lista_demo === "1" ? "Aceptados o en demo" : "Aceptados"} <b>{k.spCompletos}</b>
            </li>
            <li>
              <i style={{ background: TONE_COLOR.cyan }} />
              En construcción <b>{k.spEnCurso}</b>
            </li>
            <li>
              <i style={{ background: TONE_COLOR.slate }} />
              Sin iniciar <b>{spNoIniciado}</b>
            </li>
          </ul>
          {k.spR2 > 0 && <p className="kpi-note">Alcance MVP; sin los {k.spR2} SP de R2</p>}
        </article>

        <article className="kpi kpi-countdown">
          <span className="kpi-label">Próximo weekly</span>
          <div className="kpi-value">
            {diasWeekly === 0 ? "Hoy" : diasWeekly}
            {diasWeekly > 0 && <small>{diasWeekly === 1 ? "día" : "días"}</small>}
          </div>
          <p className="kpi-sub">
            {fmtDiaSemana(model.proximoWeekly, true)} {fmtLarga(model.proximoWeekly)}
          </p>
          {model.proximaDemo && (
            <Link href="/agenda" className="kpi-demo">
              <span>Próxima demo</span>
              <strong>
                {fmtDiaSemana(model.proximaDemo)} {fmtCorta(model.proximaDemo)} · {relativo(model.hoy, model.proximaDemo)}
              </strong>
              <em>
                {demo ? `${demo.nHu} HU · ${demo.spTotal} SP` : ""}
                {msDemo.length ? `${demo ? " · " : ""}${msDemo.map((m) => m.id).join(", ")}` : ""}
              </em>
            </Link>
          )}
        </article>

        <article className="kpi">
          <span className="kpi-label">Milestones cumplidos</span>
          <div className="kpi-value">
            {model.milestones.filter((m) => m.cierreVerificado).length}
            <small>de {model.milestones.length} visibles</small>
          </div>
          <div className="ms-dots">
            {model.milestones.map((m) => (
              <Link key={m.id} href={`/milestones/${m.id}`} className="ms-dot" style={{ background: colorEstado(m.estadoFinal), color: TONE_TEXT_COLOR[tono(m.estadoFinal)] }} title={`${m.id} · Seguimiento: ${m.estadoFinal} · ${m.cierreVerificado ? "Entrega confirmada" : "Entrega pendiente de confirmación"}`}>
                {m.id.slice(2)}
              </Link>
            ))}
          </div>
          <p className="kpi-note">El contador exige aceptación y publicación. Los colores indican el estado de seguimiento.</p>
          <ul className="kpi-legend is-inline">
            {ESTADOS_MILESTONE.filter((e) => k.milestonesPorEstado[e]).map((e) => (
              <li key={e}>
                <i style={{ background: TONE_COLOR[tono(e)] }} />
                {e} <b>{k.milestonesPorEstado[e]}</b>
              </li>
            ))}
          </ul>
        </article>
      </section>
      )}

      <SprintReviews model={model} />

      <div className="grid-2">
        {verAreas ? (
          <Card
            kicker={esCliente ? "DÍAS HÁBILES" : "DÍAS HÁBILES · TÉCNICO INTERNO"}
            title={esCliente ? "Planificado vs. entregado por área" : "Planificado vs. real técnico por área"}
            actions={<Link className="card-link" href="/areas">Ver áreas →</Link>}
          >
            <AreaBullets areas={model.areaResumen} etiquetaReal={esCliente ? "Entregado (días hábiles)" : "Real técnico (días hábiles hechos)"} />
          </Card>
        ) : (
          <Card kicker="LÍNEAS" title="Avance por línea de trabajo">
            <LineasResumen model={model} />
          </Card>
        )}
        <Card kicker="ROADMAP" title="Próximos milestones" actions={<Link className="card-link" href="/lineas">Líneas de tiempo →</Link>}>
          {proximos.length === 0 ? (
            <Empty>No hay milestones próximos.</Empty>
          ) : (
            <ul className="upcoming">
              {proximos.map((m) => (
                <li key={m.id}>
                  <Link href={`/milestones/${m.id}`} className="upcoming-item">
                    <MiniRing value={m.pctPonderado} estado={m.estadoFinal} size={52} />
                    <div className="upcoming-body">
                      <span className="upcoming-top">
                        <b style={{ color: colorLinea(m.lineaId) }}>{m.lineaId}</b> {m.id} · {fmtDiaSemana(m.fechaObjetivo ?? "")} {fmtCorta(m.fechaObjetivo)}
                        <em>{relativo(model.hoy, m.fechaObjetivo ?? model.hoy)}</em>
                      </span>
                      <strong>{m.nombre}</strong>
                      <span className="muted small">Trabajo hacia el milestone: {fmtPct(m.pctPonderado)} · {m.cierreVerificado ? "Cumplido" : "Pendiente de confirmación"}</span>
                    </div>
                    <StatusBadge estado={m.estadoFinal} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section className="lines-grid" aria-label="Milestones por línea">
        {model.lineas.map((l) => {
          const ms = model.milestones.filter((m) => m.lineaId === l.id);
          return (
            <article key={l.id} className="line-card" style={{ "--linea": colorLinea(l.id) } as CSSProperties}>
              <header>
                <span className="line-id">{l.id}</span>
                <div>
                  <h3>{l.nombre}</h3>
                  <p>{l.descripcion}</p>
                </div>
              </header>
              <ul>
                {ms.map((m) => (
                  <li key={m.id}>
                    <Link href={`/milestones/${m.id}`}>
                      <span className="line-ms-top">
                        <b>{m.id} <CompletionCheck complete={!!m.cierreVerificado} label="Hito de entrega confirmado" id={`summary-${m.id}`} /></b>
                        <span>{fmtCorta(m.fechaObjetivo)}</span>
                        <StatusBadge estado={m.estadoFinal} size="sm" />
                      </span>
                      <span className="line-ms-name">{m.nombre}</span>
                      <span className="muted small">{m.cierreVerificado ? "Milestone cumplido" : "Milestone pendiente"} · Trabajo realizado: {fmtPct(m.pctPonderado)}</span>
                      <span className="line-ms-bar">
                        <ProgressBar value={m.pctPonderado} color={colorLinea(l.id)} height={6} label={`Avance ponderado ${m.id}`} />
                        <em>
                          {m.tareasHechas}/{m.tareasTotal}
                        </em>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      {recientes.length > 0 && (
      <Card
        kicker={esCliente ? "ENTREGAS" : "SOLO EQUIPO · TÉCNICO"}
        title={esCliente ? "Entregas publicadas" : "Hecho recientemente (técnico interno)"}
        actions={<span className="card-hint">{esCliente ? "Entregas oficiales al equipo Ecopetrol" : "Tareas Hecha con evidencia técnica"}</span>}
      >
          <ul className="recent-grid">
            {recientes.map((t) => (
              <li key={t.id}>
                <Link href={`/tareas/${t.id}`}>
                  <span className="recent-top">
                    <AreaDot areaId={t.areaId} />
                    <b>{t.id}</b>
                    <span>{model.areaById.get(t.areaId)?.nombre}</span>
                    <em>{t.fechaCierre ? fmtCorta(t.fechaCierre) : "Cierre sin fecha registrada"}</em>
                  </span>
                  <strong>{t.nombre}</strong>
                  {t.evidencia && <span className="recent-evid">{t.evidencia}</span>}
                </Link>
              </li>
            ))}
          </ul>
      </Card>
      )}
    </main>
  );
}

function LineasResumen({ model }: { model: Model }) {
  return (
    <ul className="line-summary">
      {model.lineas.map((l) => {
        const p = progresoLinea(model, l.id).pctReal;
        return (
          <li key={l.id}>
            <span>
              <b style={{ color: colorLinea(l.id) }}>{l.id}</b> {l.nombre}
            </span>
            <ProgressBar value={p} color={colorLinea(l.id)} label={l.nombre} />
            <em>{fmtPct(p, 0)}</em>
          </li>
        );
      })}
    </ul>
  );
}
