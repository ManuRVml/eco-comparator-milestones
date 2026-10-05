import Link from "next/link";
import type { CSSProperties } from "react";
import { AreaBullets } from "@/components/area-chart";
import { AreaFilter } from "@/components/area-filter";
import { TareaRow } from "@/components/tarea-row";
import { AreaDot, Card, Empty, PageHeading, ProgressBar, Ring, StatusBadge } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { fmtCorta } from "@/lib/dates";
import { colorArea, colorLinea, fmtPct, textoLinea } from "@/lib/format";
import { MetricNote } from "@/components/metric-note";

export default async function AreasPage({ searchParams }: PageProps<"/areas">) {
  const session = await requireSession();
  const model = await getModel(session);
  const sp = await searchParams;
  const areaId = typeof sp.area === "string" && model.areaById.has(sp.area) ? sp.area : null;
  const verResumen = session.canEdit || model.config.resumen_area_ecopetrol === "1";
  const atrasadas = model.areaResumen.filter((a) => a.brecha < 0 && a.pctPlan > 0);

  return (
    <main className="page" data-testid="areas">
      <PageHeading kicker="EQUIPO POR DISCIPLINA" title="Avance por área">
        Siete áreas de ejecución. El avance real se pondera por días hábiles y se compara con lo planificado a la fecha en el cronograma.
      </PageHeading>

      <MetricNote capa={model.capa} hoy={model.hoy} alcance={areaId ? `Área: ${model.areaById.get(areaId)?.nombre}` : "Cada área usa sus tareas; el total usa el proyecto completo"} />

      <AreaFilter areas={model.areas} actual={areaId} base="/areas" />

      {!areaId ? (
        <>
          <section className="area-cards">
            {model.areaResumen.map((a) => (
              <Link key={a.areaId} href={`/areas?area=${a.areaId}`} className="area-card" style={{ "--a": colorArea(a.areaId) } as CSSProperties}>
                <span className="area-card-top">
                  <AreaDot areaId={a.areaId} />
                  {a.nombre}
                </span>
                <Ring value={a.pctReal} size={92} stroke={9} color={colorArea(a.areaId)} plan={verResumen ? a.pctPlan : undefined}>
                  <span className="mini-ring-label is-lg">{Math.round(a.pctReal)}%</span>
                </Ring>
                <span className="area-card-foot">
                  <b>
                    {a.hechas}/{a.total}
                  </b>{" "}
                  tareas · {a.enCurso} en curso
                </span>
                {verResumen && a.brecha < 0 && a.pctPlan > 0 && <span className="chip tone-red">Atrasada {a.brecha.toFixed(1).replace(".", ",")} pts</span>}
              </Link>
            ))}
          </section>

          {verResumen ? (
            <div className="grid-2 areas-grid">
              <Card kicker="PLANIFICADO VS. REAL" title="Resumen por área" className="span-wide">
                <AreaBullets areas={model.areaResumen} etiquetaReal={model.capa === "oficial" ? "Entregado (días hábiles)" : "Real técnico (días hábiles hechos)"} />
              </Card>
              <Card kicker="TABLA" title="Detalle a la fecha">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Área</th>
                      <th className="num">Tareas</th>
                      <th className="num">Días háb.</th>
                      <th className="num">Plan</th>
                      <th className="num">Real</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.areaResumen.map((a) => (
                      <tr key={a.areaId} className={a.brecha < 0 && a.pctPlan > 0 ? "is-late" : ""}>
                        <td>
                          <Link href={`/areas?area=${a.areaId}`} className="area-link">
                            <AreaDot areaId={a.areaId} /> {a.nombre}
                          </Link>
                        </td>
                        <td className="num">
                          {a.hechas}/{a.total}
                        </td>
                        <td className="num">
                          {a.diasHechos}/{a.dias}
                        </td>
                        <td className="num">{fmtPct(a.pctPlan)}</td>
                        <td className="num">
                          <b>{fmtPct(a.pctReal)}</b>
                        </td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td>Total</td>
                      <td className="num">
                        {model.total.hechas}/{model.total.total}
                      </td>
                      <td className="num">
                        {model.total.diasHechos}/{model.total.dias}
                      </td>
                      <td className="num">{fmtPct(model.total.pctPlan)}</td>
                      <td className="num">
                        <b>{fmtPct(model.total.pctReal)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {atrasadas.length > 0 && (
                  <p className="alert tone-amber small">
                    Atrasadas frente al plan: {atrasadas.map((a) => a.nombre).join(", ")}.
                  </p>
                )}
              </Card>
            </div>
          ) : (
            <Card>
              <Empty>El resumen planificado vs. real por área se habilitará cuando el equipo lo publique.</Empty>
            </Card>
          )}
        </>
      ) : (
        <AreaDetalle areaId={areaId} model={model} canEdit={session.canEdit} verResumen={verResumen} />
      )}
    </main>
  );
}

function AreaDetalle({ areaId, model, canEdit, verResumen }: { areaId: string; model: Awaited<ReturnType<typeof getModel>>; canEdit: boolean; verResumen: boolean }) {
  const a = model.areaResumen.find((x) => x.areaId === areaId)!;
  const ms = model.milestones.filter((m) => m.areas.some((x) => x.areaId === areaId));
  return (
    <>
      <section className="area-hero" style={{ "--a": colorArea(areaId) } as CSSProperties}>
        <Ring value={a.pctReal} size={132} stroke={12} color={colorArea(areaId)} plan={verResumen ? a.pctPlan : undefined}>
          <span className="gauge-pct is-dark">{Math.round(a.pctReal)}%</span>
          <span className="gauge-sub is-dark">ponderado</span>
        </Ring>
        <div className="area-hero-body">
          <span className="kicker">ÁREA</span>
          <h3>{a.nombre}</h3>
          <div className="area-hero-stats">
            <div>
              <span>Tareas hechas</span>
              <strong>
                {a.hechas}/{a.total}
              </strong>
            </div>
            <div>
              <span>En curso</span>
              <strong>{a.enCurso}</strong>
            </div>
            <div>
              <span>Días hábiles hechos</span>
              <strong>
                {a.diasHechos}/{a.dias}
              </strong>
            </div>
            {verResumen && (
              <div>
                <span>Planificado a hoy</span>
                <strong>{fmtPct(a.pctPlan)}</strong>
              </div>
            )}
            <div>
              <span>Milestones habilitados por esta área</span>
              <strong>{ms.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="branches">
        {ms.map((m) => {
          const ap = m.areas.find((x) => x.areaId === areaId)!;
          const ts = m.tareaIds
            .map((t) => model.tareaById.get(t))
            .filter((t) => !!t && t.areaId === areaId)
            .sort((x, y) => (x!.fechaFin ?? "").localeCompare(y!.fechaFin ?? ""));
          return (
            <details key={m.id} className="branch" open style={{ "--a": colorLinea(m.lineaId) } as CSSProperties}>
              <summary>
                <span className="branch-name">
                  <span className="line-pill" style={{ background: colorLinea(m.lineaId), color: textoLinea(m.lineaId) }}>
                    {m.lineaId}
                  </span>
                  <span className="branch-ms-id">{m.id}</span>
                  <span className="branch-ms-name">{m.nombre}</span>
                </span>
                <span className="branch-bar">
                  <ProgressBar value={ap.pctReal} color={colorArea(areaId)} height={8} label={`Avance ponderado ${m.id}`} />
                </span>
                <span className="branch-stats">
                  <b>
                    {ap.hechas}/{ap.total}
                  </b>{" "}
                  · {fmtCorta(m.fechaObjetivo)} <StatusBadge estado={m.estadoFinal} size="sm" />
                </span>
              </summary>
              <Link className="branch-open" href={`/milestones/${m.id}?area=${areaId}`}>Ver entrega de {m.id}</Link>
              <ul className="tarea-list">
                {ts.map((t) => (
                  <TareaRow key={t!.id} t={t!} model={model} canEdit={canEdit} />
                ))}
              </ul>
            </details>
          );
        })}
        {ms.length === 0 && <Empty>Esta área no tiene tareas visibles.</Empty>}
      </div>
    </>
  );
}
