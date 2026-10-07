import Link from "next/link";
import { notFound } from "next/navigation";
import { ESTADOS_HISTORIA } from "@/db/schema";
import { EstadoControl } from "@/components/editor/estado-control";
import { VisibilidadToggle } from "@/components/editor/visibilidad-toggle";
import { Historial } from "@/components/historial";
import { Notas } from "@/components/notas";
import { TareaRow } from "@/components/tarea-row";
import {
  AreaDot,
  Breadcrumb,
  Card,
  Empty,
  ProgressBar,
  Ring,
  StatusBadge,
} from "@/components/ui";
import { getBitacora, getModel, requireSession } from "@/lib/data";
import { fmtCorta, fmtDiaSemana, fmtLarga, relativo } from "@/lib/dates";
import { colorArea, colorEstado, colorLinea } from "@/lib/format";
import type { Tarea } from "@/lib/model";

export default async function HistoriaPage({
  params,
}: PageProps<"/historias/[id]">) {
  const session = await requireSession();
  const model = await getModel(session);
  const { id } = await params;
  const h = model.huById.get(id);
  if (!h) notFound();
  const ts = (model.tareasPorHu.get(h.id) ?? [])
    .map((t) => model.tareaById.get(t))
    .filter((t): t is Tarea => !!t);
  const hechas = ts.filter((t) => t.estado === "Hecha").length;
  const pct = ts.length ? (hechas / ts.length) * 100 : 0;
  const weekly = model.weeklyPorHu.get(h.id);
  const ms = (model.milestonesPorHu.get(h.id) ?? [])
    .map((m) => model.milestoneById.get(m))
    .filter((m) => !!m);
  const sprint = h.sprintId
    ? model.sprints.find((x) => x.id === h.sprintId)
    : undefined;
  const detalleBase: [string, string | number | null | undefined][] = [
    ["Descripción", h.justificacion],
    ["Criterios de aceptación", null],
    ["Dependencias", h.dependencias],
    ["Épica", h.epica],
    ["Funcionalidad", h.feature],
    ["Prioridad", h.prioridad],
  ];
  const detalle = session.canEdit
    ? [...detalleBase, ["SP", h.sp], ["Sprint", sprint?.id ?? h.sprintId]]
    : [...detalleBase, ["Sprint", sprint?.id ?? h.sprintId]];
  const log = session.canEdit
    ? (
        await getBitacora(session, {
          tipo: "historia",
          entidadId: h.id,
          limit: 20,
        })
      ).rows
    : [];

  return (
    <main className="page" data-testid="historia">
      <Breadcrumb
        items={[
          { label: "Líneas de tiempo", href: "/lineas" },
          ...(ms[0]
            ? [{ label: ms[0].id, href: `/milestones/${ms[0].id}?tab=hu` }]
            : []),
          { label: h.id },
        ]}
      />
      <section className="entity-hero">
        <div>
          <div className="ms-hero-tags">
            <span className="ms-id">{h.id}</span>
            <StatusBadge estado={h.estado} />
            {session.canEdit && <span className="sp-pill">{h.sp ?? 0} SP</span>}
            {h.prioridad && (
              <span className="chip">Prioridad {h.prioridad}</span>
            )}
          </div>
          <h2>{h.nombre}</h2>
          <dl className="ms-meta">
            <div>
              <dt>Épica</dt>
              <dd>
                {h.epicaId} · {h.epica ?? "—"}
              </dd>
            </div>
            <div>
              <dt>Funcionalidad</dt>
              <dd>{h.feature ?? "—"}</dd>
            </div>
            <div>
              <dt>Sprint</dt>
              <dd>{sprint?.id ?? h.sprintId ?? "—"}</dd>
            </div>
            <div>
              <dt>Se demuestra</dt>
              <dd>
                {weekly ? (
                  <>
                    {fmtDiaSemana(weekly, true)} {fmtLarga(weekly)}{" "}
                    <em>· {relativo(model.hoy, weekly)}</em>
                  </>
                ) : (
                  "Sin weekly asignado"
                )}
              </dd>
            </div>
          </dl>
        </div>
        <Ring value={pct} size={128} stroke={11} color={colorEstado(h.estado)}>
          <span className="gauge-pct is-dark">{Math.round(pct)}%</span>
          <span className="gauge-sub is-dark">
            {hechas}/{ts.length} tareas
          </span>
        </Ring>
      </section>

      <section id="descripcion" className="hu-descripcion">
        <Card kicker="DETALLE DE LA HISTORIA" title="Lo que pide esta historia">
          <dl className="hu-detalle">
            {detalle.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <div className="detail-layout">
        <div className="detail-main">
          <Card kicker="EJECUCIÓN" title="Tareas por área">
            {ts.length === 0 && (
              <Empty>
                Esta HU no tiene tareas técnicas propias; se valida en la demo
                del milestone.
              </Empty>
            )}
            {model.areas
              .filter((a) => ts.some((t) => t.areaId === a.id))
              .map((a) => {
                const at = ts.filter((t) => t.areaId === a.id);
                const ah = at.filter((t) => t.estado === "Hecha").length;
                return (
                  <div key={a.id} className="hu-area">
                    <h4>
                      <AreaDot areaId={a.id} /> {a.nombre}
                      <span className="hu-area-bar">
                        <ProgressBar
                          value={(ah / at.length) * 100}
                          color={colorArea(a.id)}
                          height={6}
                          label={a.nombre}
                        />
                      </span>
                      <em>
                        {ah}/{at.length}
                      </em>
                    </h4>
                    <ul className="tarea-list">
                      {at.map((t) => (
                        <TareaRow
                          key={t.id}
                          t={t}
                          model={model}
                          canEdit={session.canEdit}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}
          </Card>
          {h.dependencias && (
            <Card kicker="PLAN" title="Dependencias de la historia">
              <p>{h.dependencias}</p>
            </Card>
          )}
        </div>
        <div className="detail-side">
          {session.canEdit && (
            <Card
              kicker="EDITOR"
              title="Estado de la HU"
              className="editor-card"
            >
              <EstadoControl
                tipo="historia"
                id={h.id}
                estado={h.estado}
                estados={ESTADOS_HISTORIA}
                evidencia={h.evidencia}
              />
              <div className="field-row">
                <span className="field-label">Visible para Ecopetrol</span>
                <VisibilidadToggle
                  tipo="historia"
                  id={h.id}
                  visible={h.visibleCliente}
                />
              </div>
            </Card>
          )}
          <Card kicker="ROADMAP" title="Milestones">
            {ms.length === 0 ? (
              <Empty>No está asignada a un milestone.</Empty>
            ) : (
              <ul className="dep-list">
                {ms.map((m) => (
                  <li key={m.id}>
                    <Link href={`/milestones/${m.id}?tab=hu`}>
                      <span
                        className="dep-dot"
                        style={{ background: colorEstado(m.estadoFinal) }}
                      />
                      <b style={{ color: colorLinea(m.lineaId) }}>{m.id}</b>
                      <span className="dep-name">{m.nombre}</span>
                      <em>{fmtCorta(m.fechaObjetivo)}</em>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {h.evidencia && (
            <Card kicker="EVIDENCIA" title="Respaldo">
              <p className="evid-text">{h.evidencia}</p>
            </Card>
          )}
          <Notas
            model={model}
            entidadTipo="historia"
            entidadId={h.id}
            canEdit={session.canEdit}
          />
          {session.canEdit && <Historial rows={log} />}
        </div>
      </div>
    </main>
  );
}
