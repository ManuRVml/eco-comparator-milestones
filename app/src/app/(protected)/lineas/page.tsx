import Link from "next/link";
import { AreaFilter } from "@/components/area-filter";
import { Roadmap } from "@/components/roadmap";
import { Card, PageHeading, ProgressBar, StatusBadge } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { fmtCorta, fmtLarga } from "@/lib/dates";
import { colorEstado, colorLinea, fmtPct, TONE_COLOR, textoLinea } from "@/lib/format";
import { ESTADOS_MILESTONE } from "@/lib/model";
import { MetricNote } from "@/components/metric-note";
import { DeliveryNote } from "@/components/delivery-note";
import { InfoToolbar } from "@/components/info-toolbar";
import { inicioComoMilestone } from "@/components/sprint-checkpoint-row";
import { sprintCheckpoint } from "@/lib/sprint-checkpoint";
import { MilestoneOverview } from "@/components/milestone-overview";

export default async function LineasPage({ searchParams }: PageProps<"/lineas">) {
  const session = await requireSession();
  const model = await getModel(session);
  const sp = await searchParams;
  const areaParam = typeof sp.area === "string" ? sp.area : null;
  const areaId = areaParam && model.areaById.has(areaParam) ? areaParam : null;
  const area = areaId ? model.areaResumen.find((a) => a.areaId === areaId)! : model.total;
  const k = model.kpis;
  const spPlanHoy = model.historias
    .filter((h) => h.prioridad !== "R2" && (model.weeklyPorHu.get(h.id) ?? "9999") <= model.hoy)
    .reduce((s, h) => s + (h.sp ?? 0), 0);

  const inicioRoadmap = model.sprints.map((x) => x.fechaInicio).sort()[0];
  const finRoadmap = model.sprints.map((x) => x.fechaFin).sort().at(-1);
  const kicker = inicioRoadmap && finRoadmap ? `ROADMAP ${fmtCorta(inicioRoadmap).toUpperCase()} – ${fmtCorta(finRoadmap).toUpperCase()} ${finRoadmap.slice(0, 4)}` : "ROADMAP";
  // Previsión real registrada en la ficha del milestone; sin ella no se muestra la columna al cliente.
  const prevision = (id: string) => model.contratosMilestone?.[id]?.definicion?.fechaPrevision || null;
  const hayPrevision = model.milestones.some((m) => prevision(m.id));

  const cero = !session.canEdit ? sprintCheckpoint(model, 0) : null;
  const filaCero = cero ? inicioComoMilestone(model, cero) : null;

  return (
    <main className="page" data-testid="timeline">
      <PageHeading kicker={kicker} title="Timeline de milestones" />
      {!session.canEdit && <MilestoneOverview model={model} cliente />}

      <InfoToolbar
        label="Información del timeline"
        items={[
          {
            id: "seguimiento",
            label: "Seguimiento BenchHub · MVP Ecopetrol",
            icon: "info",
            content: (
              <p>
                {model.sprints.length} puntos de revisión al cierre de sprint, incluido Sprint 0, y {model.milestones.length} milestones (hitos) en {model.lineas.length} líneas de valor.{" "}
                {model.capa === "oficial"
                  ? "Los nodos muestran el avance oficial entregado y su estado. Haz clic en un nodo para ver sus entregables."
                  : "Vista de equipo: los nodos muestran el avance técnico interno (no visible para el equipo Ecopetrol). Haz clic en un nodo para ver sus entregables."}
              </p>
            ),
          },
          { id: "leer", label: "Cómo leer milestones, revisiones y aceptación", icon: "book", content: <DeliveryNote defaultOpen equipo={session.canEdit} /> },
          {
            id: "trabajo",
            label: "Trabajo hacia el milestone",
            icon: "gauge",
            content: <MetricNote capa={model.capa} hoy={model.hoy} alcance={areaId ? `Área: ${model.areaById.get(areaId)?.nombre}; cada nodo usa sus propias tareas` : "Cada nodo usa sus propias tareas; el total usa el proyecto completo"} checkpoints cliente={!session.canEdit} />,
          },
          {
            id: "proyecto",
            label: `${areaId ? "Proyecto completo (sin filtro de área)" : "Proyecto"} · ${model.capa === "oficial" ? "avance publicado" : "avance técnico interno"}: ${fmtPct(model.total.pctReal)} vs. ${fmtPct(model.total.pctPlan)} previsto`,
            icon: "chart",
            content: (
            <section className="strip" aria-label="Avance global">
              <div className="strip-item">
                <span>SP completados vs. planificados a la fecha · proyecto completo{areaId ? " (sin filtro de área)" : ""}</span>
                <strong>
                  {k.spCompletos} <small>/ {spPlanHoy} SP a hoy · {k.spTotal} SP en total</small>
                </strong>
                <ProgressBar value={k.spTotal ? (k.spCompletos / k.spTotal) * 100 : 0} plan={k.spTotal ? (spPlanHoy / k.spTotal) * 100 : 0} color={TONE_COLOR.green} label="SP completados" />
              </div>
              <div className="strip-item">
                <span>{areaId ? `Tareas de ${model.areaById.get(areaId)?.nombre}` : (model.capa === "oficial" ? "Tareas entregadas" : "Tareas hechas (técnico interno)")}</span>
                <strong>
                  {area.hechas} <small>/ {area.total} hechas · plan a hoy {area.planHoy}</small>
                </strong>
              </div>
              <div className="strip-item">
                <span>{model.capa === "oficial" ? "Entregado ponderado por días hábiles" : "Real técnico ponderado por días hábiles"}</span>
                <strong>
                  {fmtPct(area.pctReal)} <small>vs. {fmtPct(area.pctPlan)} planificado</small>
                </strong>
                <ProgressBar value={area.pctReal} plan={area.pctPlan} color={TONE_COLOR.cyan} label="Real ponderado" />
              </div>
            </section>
            ),
          },
        ]}
      />

      <div className="toolbar">
        {session.canEdit && <AreaFilter areas={model.areas} actual={areaId} base="/lineas" />}
        <ul className="legend">
          {ESTADOS_MILESTONE.map((e) => (
            <li key={e}>
              <i style={{ background: colorEstado(e) }} />
              {e}
            </li>
          ))}
          <li>
            <i className="lg-festivo" />
            Festivo
          </li>
          <li>
            <i className="lg-hoy" />
            Hoy
          </li>
        </ul>
      </div>

      <Card className="card-flush">
        <Roadmap model={model} areaId={areaId} inicial={typeof sp.m === "string" ? sp.m : null} canEdit={session.canEdit} isAdmin={session.isAdmin} />
      </Card>

      <p className="muted small timeline-scroll-hint">El timeline se desplaza horizontalmente. Desplaza dentro de esta sección para consultar fechas y entregas posteriores.</p>

      <div className="ms-table-wrap" role="region" aria-label="Milestones: fecha y cumplimiento" tabIndex={0}>
        <Card kicker={areaId ? `FILTRO: ${model.areaById.get(areaId)?.nombre?.toUpperCase()}` : "DETALLE"} title="Milestones: fecha y cumplimiento">
          <table className="table ms-table">
            <thead>
              <tr>
                <th>Milestone (hito)</th>
                <th>Línea</th>
                <th>Fecha objetivo</th>
                <th>Seguimiento</th><th>Cumplimiento</th>
                {session.canEdit ? (
                  <>
                    <th className="w-bar">{areaId ? "Trabajo del área" : model.capa === "oficial" ? "Trabajo publicado" : "Trabajo técnico"} (tareas · % ponderado)</th>
                    <th className="num">Previsto a hoy</th>
                    <th className="num">SP aceptados</th>
                  </>
                ) : (
                  hayPrevision && <th>Previsión</th>
                )}
              </tr>
            </thead>
            <tbody>
              {cero && filaCero && (
                <tr>
                  <td><span className="ms-cell"><b>S0</b><span>{filaCero.nombre}</span></span></td>
                  <td><span className="line-pill" style={{ background: "var(--color-brand-primary)", color: "var(--color-text-inverse)" }}>Inicio</span></td>
                  <td className="nowrap" title={fmtLarga(cero.sprint.fechaFin)}>{fmtCorta(cero.sprint.fechaFin)}</td>
                  <td><StatusBadge estado={cero.estado} size="sm" /></td>
                  <td><span className={`chip tone-${cero.completo ? "green" : "slate"}`}>{cero.completo ? "Cumplido" : "Pendiente"}</span></td>
                  {hayPrevision && <td className="nowrap">—</td>}
                </tr>
              )}
              {model.milestones.map((m) => {
                const a = areaId ? m.areas.find((x) => x.areaId === areaId) : null;
                const p = areaId ? (a?.pctReal ?? 0) : m.pctPonderado;
                return (
                  <tr key={m.id} className={areaId && !a ? "is-muted" : ""}>
                    <td>
                      <Link href={`/milestones/${m.id}${areaId ? `?area=${areaId}` : ""}`} className="ms-cell">
                        <b>{m.id}</b>
                        <span>{m.nombre}</span>
                      </Link>
                    </td>
                    <td>
                      <span className="line-pill" style={{ background: colorLinea(m.lineaId), color: textoLinea(m.lineaId) }}>
                        {m.lineaId}
                      </span>
                    </td>
                    <td className="nowrap" title={fmtLarga(m.fechaObjetivo)}>
                      {fmtCorta(m.fechaObjetivo)}
                    </td>
                    <td>
                      <StatusBadge estado={m.estadoFinal} size="sm" />
                    </td>
                    <td><span className={`chip tone-${m.cierreVerificado ? "green" : "slate"}`}>{m.cierreVerificado ? "Cumplido" : "Pendiente"}</span></td>
                    {session.canEdit ? (
                      <>
                    <td>
                      {areaId && !a ? (
                        <span className="muted">Sin tareas del área</span>
                      ) : (
                        <span className="bar-cell">
                          <ProgressBar value={p} color={colorLinea(m.lineaId)} height={6} label={`Avance ${m.id}`} />
                          <em>
                            {areaId ? `${a?.hechas}/${a?.total}` : `${m.tareasHechas}/${m.tareasTotal}`} tareas · {fmtPct(p)} ponderado
                          </em>
                        </span>
                      )}
                    </td>
                    <td className="num" title="Días hábiles de tareas con fecha fin vencida ÷ días hábiles del alcance">
                      {areaId && !a ? "—" : fmtPct(areaId ? (a?.pctPlan ?? 0) : m.trabajo.pctPlan)}
                    </td>
                    <td className="num">
                      {m.spCompletos}/{m.spTotal}
                    </td>
                      </>
                    ) : (
                      hayPrevision && <td className="nowrap">{prevision(m.id) ? fmtCorta(prevision(m.id)) : "—"}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </main>
  );
}
