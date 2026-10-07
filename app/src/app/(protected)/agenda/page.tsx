import Link from "next/link";
import type { CSSProperties } from "react";
import { PageHeading, StatusBadge } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { daysBetween, fmtDiaSemana, fmtLarga, mesCorto, relativo } from "@/lib/dates";
import { colorEstado, colorLinea, textoLinea } from "@/lib/format";

export default async function AgendaPage() {
  const session = await requireSession();
  const model = await getModel(session);
  const fechas = [...new Set([...model.agendaWeekly.map((w) => w.fecha), ...model.milestones.map((m) => m.fechaObjetivo ?? "")])].filter(Boolean).sort();
  const proxima = fechas.find((f) => f >= model.hoy) ?? null;
  const totalHu = model.historias.filter((h) => model.weeklyPorHu.has(h.id)).length;

  return (
    <main className="page" data-testid="agenda">
      <PageHeading
        kicker="QUÉ VERÁS Y CUÁNDO"
        title="Agenda de milestones y demostraciones"
        aside={
          <div className="agenda-summary">
            <div>
              <strong>{fechas.length}</strong>
              <span>fechas planificadas</span>
            </div>
            <div>
              <strong>{totalHu}</strong>
              <span>HU a demostrar</span>
            </div>
            <div>
              <strong>{model.milestones.length}</strong>
              <span>milestones</span>
            </div>
          </div>
        }
      >
        Fechas objetivo de milestones y demostraciones semanales. Una demo permite revisar el resultado; su aceptación confirma el milestone. Una fecha pasada no demuestra que la revisión o la entrega se haya realizado.
      </PageHeading>

      <ol className="agenda">
        {fechas.map((f) => {
          const hus = model.historias.filter((h) => model.weeklyPorHu.get(h.id) === f);
          const ms = model.milestones.filter((m) => m.fechaObjetivo === f);
          const sp = hus.reduce((s, h) => s + (h.sp ?? 0), 0);
          const pasada = f < model.hoy;
          const esProxima = f === proxima;
          const dias = daysBetween(model.hoy, f);
          const epicas = [...new Set(hus.map((h) => h.epica).filter(Boolean))];
          return (
            <li key={f} className={`agenda-item ${pasada ? "is-past" : ""} ${esProxima ? "is-next" : ""}`} data-testid={`agenda-${f}`}>
              <div className="agenda-date">
                <span className="agenda-dow">{fmtDiaSemana(f)}</span>
                <span className="agenda-day">{Number(f.slice(8))}</span>
                <span className="agenda-month">{mesCorto(f)}</span>
                <span className="agenda-rel">{dias >= 0 ? relativo(model.hoy, f) : "fecha transcurrida"}</span>
              </div>
              <div className="agenda-card">
                <header>
                  <div>
                    {esProxima && <span className="next-pill">Próxima demo</span>}
                    <h3>{fmtLarga(f)}</h3>
                    <p>{hus.length ? `${hus.length} historias · ${sp} SP${epicas.length ? ` · ${epicas.join(" · ")}` : ""}` : "Fecha objetivo de milestone · resultado por revisar"}</p>
                  </div>
                </header>
                {ms.length > 0 && (
                  <div className="agenda-ms">
                    {ms.map((m) => (
                      <Link key={m.id} href={`/milestones/${m.id}`} className="agenda-ms-item" style={{ "--linea": colorLinea(m.lineaId) } as CSSProperties}>
                        <span className="agenda-ms-head">
                          <span className="line-pill" style={{ background: colorLinea(m.lineaId), color: textoLinea(m.lineaId) }}>
                            {m.lineaId}
                          </span>
                          <b>{m.id}</b>
                          <StatusBadge estado={m.estadoFinal} size="sm" />
                          <em>
                            Trabajo {Math.round(m.pctPonderado)} % · {m.cierreVerificado ? "Milestone cumplido" : "Milestone pendiente"}
                          </em>
                        </span>
                        <strong>{m.nombre}</strong>
                        {m.valorCliente && <span className="agenda-value">{m.valorCliente}</span>}
                      </Link>
                    ))}
                  </div>
                )}
                {hus.length > 0 ? (
                  <ul className="agenda-hu">
                    {hus.map((h) => (
                      <li key={h.id}>
                        <Link href={`/historias/${h.id}#descripcion`}>
                          <span className="agenda-hu-dot" style={{ background: colorEstado(h.estado) }} title={h.estado} />
                          <b>{h.id}</b>
                          <span>{h.nombre}</span>
                          <em>{h.sp ?? 0} SP</em>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted small">Cierre y aceptación: se valida en producción lo construido en las demos anteriores.</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
