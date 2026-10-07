import Link from "next/link";
import { notFound } from "next/navigation";
import { ESTADOS_TAREA } from "@/db/schema";
import { EstadoControl } from "@/components/editor/estado-control";
import { PublicarControl } from "@/components/editor/publicar-control";
import { VisibilidadToggle } from "@/components/editor/visibilidad-toggle";
import { Historial } from "@/components/historial";
import { Notas } from "@/components/notas";
import { AreaDot, Breadcrumb, Card, CriticalBadge, Empty, StatusBadge } from "@/components/ui";
import { getBitacora, getModel, requireSession } from "@/lib/data";
import { fmtCorta, fmtLarga, relativo } from "@/lib/dates";
import { colorEstado, colorLinea } from "@/lib/format";
import type { Model } from "@/lib/model";
import { TaskWorkflow } from "@/components/workflow/task-panel";

const ORIGEN: Record<string, string> = {
  plan: "Plan (sin verificar)",
  codigo: "Verificado en código (matriz de evidencia)",
  editor: "Actualizado por el editor",
};

export default async function TareaPage({ params }: PageProps<"/tareas/[id]">) {
  const session = await requireSession();
  const model = await getModel(session);
  const { id } = await params;
  const t = model.tareaById.get(id);
  if (!t) notFound();
  const hu = t.historiaId ? model.huById.get(t.historiaId) : null;
  const ms = (model.milestonesPorTarea.get(t.id) ?? []).map((m) => model.milestoneById.get(m)).filter((m) => !!m);
  const log = session.canEdit ? (await getBitacora(session, { tipo: "tarea", entidadId: t.id, limit: 20 })).rows : [];
  const vencida = t.estado !== "Hecha" && t.fechaFin && t.fechaFin < model.hoy;

  return (
    <main className="page" data-testid="tarea">
      <Breadcrumb
        items={[
          { label: "Líneas de tiempo", href: "/lineas" },
          ...(ms[0] ? [{ label: ms[0].id, href: `/milestones/${ms[0].id}` }] : []),
          ...(hu ? [          { label: hu.id, href: `/historias/${hu.id}#descripcion` }] : []),
          { label: t.id },
        ]}
      />
      <section className="entity-hero">
        <div>
          <div className="ms-hero-tags">
            <span className="ms-id">{t.id}</span>
            <StatusBadge estado={t.estado} />
            <span className="chip">
              <AreaDot areaId={t.areaId} /> {model.areaById.get(t.areaId)?.nombre}
            </span>
            {t.rutaCritica && <CriticalBadge />}
            {vencida && <span className="chip tone-red">Vencida {relativo(model.hoy, t.fechaFin!)}</span>}
          </div>
          <h2>{t.nombre}</h2>
          {t.descripcion && <p className="lead">{t.descripcion}</p>}
          <dl className="ms-meta">
            <div>
              <dt>Inicio</dt>
              <dd>{fmtLarga(t.fechaInicio)}</dd>
            </div>
            <div>
              <dt>Fin planificado</dt>
              <dd>{fmtLarga(t.fechaFin)}</dd>
            </div>
            <div>
              <dt>Días hábiles</dt>
              <dd>{t.diasHabiles ?? "—"}</dd>
            </div>
            <div>
              <dt>{t.estado === "Hecha" ? "Cerrada" : "Sprint"}</dt>
              <dd>{t.estado === "Hecha" ? fmtLarga(t.fechaCierre) : (t.sprintId ?? "—")}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="detail-layout">
        <div className="detail-main">
          {session.canEdit && <TaskWorkflow tarea={t} model={model} />}
          {model.capa === "oficial" ? (
            <Card kicker="ENTREGA" title="Entrega al equipo Ecopetrol">
              {t.evidencia ? (
                <p className="evid-text">
                  {t.evidencia}
                  {t.fechaCierre ? ` · ${fmtLarga(t.fechaCierre)}` : ""}
                </p>
              ) : (
                <Empty>Aún no entregada al equipo Ecopetrol. Estado según el plan: {t.estado}.</Empty>
              )}
            </Card>
          ) : (
            <Card kicker="SOLO EQUIPO · EVIDENCIA TÉCNICA SUGERIDA" title="Evidencia técnica sugerida">
              {t.evidencia ? <p className="evid-text">{t.evidencia}</p> : <Empty>Sin evidencia registrada.</Empty>}
              <p className="muted small">Origen del estado: {ORIGEN[t.estadoOrigen] ?? t.estadoOrigen}</p>
            </Card>
          )}
          <div className="grid-2">
            <Card kicker="SECUENCIA" title="Predecesoras">
              <TareaLinks ids={model.predecesoras.get(t.id) ?? []} model={model} vacio="No depende de otras tareas." />
            </Card>
            <Card kicker="SECUENCIA" title="Sucesoras">
              <TareaLinks ids={model.sucesoras.get(t.id) ?? []} model={model} vacio="Ninguna tarea depende de esta." />
            </Card>
          </div>
          <Card kicker="CONTEXTO" title="Trabajo que habilita el milestone">
            <ul className="dep-list">
              {hu && (
                <li>
                  <Link href={`/historias/${hu.id}#descripcion`}>
                    <span className="dep-dot" style={{ background: colorEstado(hu.estado) }} />
                    <b>{hu.id}</b>
                    <span className="dep-name">{hu.nombre}</span>
                    <em>{hu.sp ?? 0} SP</em>
                  </Link>
                </li>
              )}
              {ms.map((m) => (
                <li key={m.id}>
                  <Link href={`/milestones/${m.id}`}>
                    <span className="dep-dot" style={{ background: colorEstado(m.estadoFinal) }} />
                    <b style={{ color: colorLinea(m.lineaId) }}>{m.id}</b>
                    <span className="dep-name">{m.nombre}</span>
                    <em>{fmtCorta(m.fechaObjetivo)}</em>
                  </Link>
                </li>
              ))}
              {!hu && ms.length === 0 && <Empty>Sin historia ni milestone (hito) asociados.</Empty>}
            </ul>
          </Card>
        </div>
        <div className="detail-side">
          {session.canEdit && (
            <Card kicker="EDITOR" title="Estado de la tarea" className="editor-card">
              <EstadoControl tipo="tarea" id={t.id} estado={t.estado} estados={ESTADOS_TAREA} evidencia={t.evidencia} />
              <div className="field-row">
                <span className="field-label">Visible para Ecopetrol</span>
                <VisibilidadToggle tipo="tarea" id={t.id} visible={t.visibleCliente} />
              </div>
              {t.rol && <p className="muted small">Rol responsable: {t.rol}</p>}
            </Card>
          )}
          {session.canEdit && (
            <Card kicker="CAPA OFICIAL" title="Verificación y publicación" className="editor-card">
              <PublicarControl id={t.id} estado={t.estado} publicada={t.publicadoCliente} fecha={t.fechaPublicacion} nota={t.notaPublicacion} />
              {t.publicadoCliente && t.notaPublicacion && <p className="muted small">Nota de entrega: {t.notaPublicacion}</p>}
              <p className="muted small">
                El equipo Ecopetrol solo ve esta tarea como Hecha cuando un editor o administrador la aprueba y la publica.
              </p>
            </Card>
          )}
          <Notas model={model} entidadTipo="tarea" entidadId={t.id} canEdit={session.canEdit} />
          {session.canEdit && <Historial rows={log} />}
        </div>
      </div>
    </main>
  );
}

function TareaLinks({ ids, model, vacio }: { ids: string[]; model: Model; vacio: string }) {
  const ts = ids.map((i) => model.tareaById.get(i)).filter((x) => !!x);
  if (ts.length === 0) return <Empty>{vacio}</Empty>;
  return (
    <ul className="dep-list">
      {ts.map((x) => (
        <li key={x.id}>
          <Link href={`/tareas/${x.id}`}>
            <span className="dep-dot" style={{ background: colorEstado(x.estado) }} />
            <b>{x.id}</b>
            <span className="dep-name">{x.nombre}</span>
            <em>{x.estado}</em>
          </Link>
        </li>
      ))}
    </ul>
  );
}
