import Link from "next/link";
import { BatchPublish } from "@/components/editor/batch-publish";
import { PublicarControl } from "@/components/editor/publicar-control";
import { Tooltip } from "@/components/tooltip";
import { AreaDot, Card, Empty, PageHeading } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { colorLinea } from "@/lib/format";

const FORM_ID = "verificacion-seleccion";
// Solo el título se recorta (con puntos suspensivos); «M-0x · » siempre queda visible. Título completo en el Tooltip.
const TITULO_FILTRO = { display: "inline-block", minWidth: 0, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "bottom" } as const;

function kebabId(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Cola de verificación (editor o admin): tareas con estado técnico Hecha aún sin publicar. Se revisa la evidencia
 * técnica sugerida y se aprueba con fecha y nota de entrega; solo entonces el equipo Ecopetrol las ve.
 * Varias tareas Hecha se pueden publicar juntas, con una sola nota y fecha.
 */
export default async function VerificacionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  if (!session.canEdit) {
    return (
      <main className="page">
        <PageHeading kicker="ACCESO RESTRINGIDO" title="Solo lectura">
          La verificación y publicación de avances es exclusiva del equipo de proyecto.
        </PageHeading>
      </main>
    );
  }
  const model = await getModel(session);
  const params = await searchParams;
  const rawMs = typeof params.ms === "string" ? params.ms : "";
  const msFiltro = model.milestoneById.has(rawMs) ? rawMs : "";
  const pendientes = model.tareas
    .filter((t) => !t.publicadoCliente && t.estado === "Hecha")
    .sort((a, b) => (a.fechaFin ?? "").localeCompare(b.fechaFin ?? "") || a.id.localeCompare(b.id));
  const publicadas = model.tareas.filter((t) => t.publicadoCliente).sort((a, b) => (b.fechaPublicacion ?? "").localeCompare(a.fechaPublicacion ?? ""));
  const enMilestone = (id: string) => !msFiltro || (model.milestonesPorTarea.get(id) ?? []).includes(msFiltro);
  const pendientesVis = pendientes.filter((t) => enMilestone(t.id));
  const publicadasVis = publicadas.filter((t) => enMilestone(t.id));
  const vistos = new Set<string>();
  for (const t of [...pendientes, ...publicadas]) {
    for (const id of model.milestonesPorTarea.get(t.id) ?? []) vistos.add(id);
  }
  const filtros = [...vistos]
    .flatMap((id) => {
      const milestone = model.milestoneById.get(id);
      return milestone ? [milestone] : [];
    })
    .sort((a, b) => a.id.localeCompare(b.id, "es"));

  const fila = (t: (typeof model.tareas)[number], conEvidencia: boolean, seleccionable: boolean) => {
    const ms = (model.milestonesPorTarea.get(t.id) ?? []).map((id) => model.milestoneById.get(id)).filter((m) => !!m);
    return (
      <tr key={t.id} data-testid={`verificacion-row-${kebabId(t.id)}`}>
        {seleccionable && (
          <td>
            <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 32, minHeight: 32 }}>
              <input type="checkbox" name="ids" value={t.id} form={FORM_ID} data-testid={`verificacion-select-${kebabId(t.id)}`} aria-label={`Seleccionar ${t.id}`} />
            </label>
          </td>
        )}
        <td>
          <Link href={`/tareas/${t.id}`} className="ms-cell">
            <b>{t.id}</b>
            <span>{t.nombre}</span>
          </Link>
        </td>
        <td className="nowrap">
          <AreaDot areaId={t.areaId} /> {model.areaById.get(t.areaId)?.nombre}
          <div className="small">
            {ms.map((m) => (
              <Tooltip key={m.id} label={`${m.id} · ${m.nombre}`}>
                <Link href={`/milestones/${m.id}`} style={{ color: colorLinea(m.lineaId) }} aria-label={`${m.id} · ${m.nombre}`}>
                  {m.id}
                </Link>
              </Tooltip>
            ))}
          </div>
        </td>
        <td className="verif-evid">{conEvidencia ? (t.evidencia ?? <span className="muted">Sin evidencia registrada</span>) : (t.notaPublicacion ?? "—")}</td>
        <td data-testid={`verif-${t.id}`}>
          <PublicarControl id={t.id} estado={t.estado} publicada={t.publicadoCliente} fecha={t.fechaPublicacion} nota={t.notaPublicacion} />
        </td>
      </tr>
    );
  };

  return (
    <main className="page" data-testid="verificacion">
      <PageHeading
        kicker="EDITOR Y ADMINISTRADOR"
        title="Pendiente de verificación"
        aside={
          <div className="agenda-summary">
            <div>
              <strong>{pendientes.length}</strong>
              <span>Hecha sin publicar</span>
            </div>
            <div>
              <strong>{publicadas.length}</strong>
              <span>publicadas</span>
            </div>
          </div>
        }
      >
        Revisa la evidencia técnica de cada tarea y apruébala con una nota de entrega orientada al equipo Ecopetrol
        (p. ej. «Demostrado en weekly 15/10»). Aprobar publica; retirar la devuelve a la cola. Todo queda en la bitácora.
      </PageHeading>

      {filtros.length > 0 && (
        <div className="toolbar is-stacked">
          <nav className="filter-chips" aria-label="Filtrar por milestone">
            <Link href="/verificacion" className={`fchip ${msFiltro ? "" : "is-on"}`} aria-current={msFiltro ? undefined : "true"} data-testid="verificacion-filter-todos">
              Todos los milestones
            </Link>
            {filtros.map((m) => {
              const completo = `${m.id} · ${m.nombre}`;
              const on = msFiltro === m.id;
              return (
                <Tooltip key={m.id} label={completo}>
                  <Link
                    href={`/verificacion?ms=${encodeURIComponent(m.id)}`}
                    className={`fchip ${on ? "is-on" : ""}`}
                    aria-current={on ? "true" : undefined}
                    aria-label={completo}
                    data-testid={`verificacion-filter-${kebabId(m.id)}`}
                  >
                    {m.id} · <span style={TITULO_FILTRO}>{m.nombre}</span>
                  </Link>
                </Tooltip>
              );
            })}
          </nav>
        </div>
      )}

      <BatchPublish formId={FORM_ID} items={pendientesVis.map((t) => ({ id: t.id, nombre: t.nombre }))} />

      <Card kicker="COLA" title="Por verificar" className="card-flush">
        {pendientesVis.length === 0 ? (
          <Empty>{msFiltro ? "No hay tareas de este milestone pendientes de verificación." : "No hay tareas pendientes de verificación."}</Empty>
        ) : (
          <table className="table editor-table" data-testid="verif-pendientes">
            <thead>
              <tr>
                <th>Incluir</th>
                <th>Tarea</th>
                <th>Área · milestone</th>
                <th>Evidencia técnica sugerida</th>
                <th>Aprobar y publicar</th>
              </tr>
            </thead>
            <tbody>{pendientesVis.map((t) => fila(t, true, true))}</tbody>
          </table>
        )}
      </Card>

      <Card kicker="PUBLICADAS" title="Visibles para el equipo Ecopetrol" className="card-flush">
        {publicadasVis.length === 0 ? (
          <Empty>{msFiltro ? "No hay tareas publicadas de este milestone." : "Aún no hay tareas publicadas."}</Empty>
        ) : (
          <table className="table editor-table" data-testid="verif-publicadas">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Área · milestone</th>
                <th>Nota de entrega</th>
                <th>Publicación</th>
              </tr>
            </thead>
            <tbody>{publicadasVis.map((t) => fila(t, false, false))}</tbody>
          </table>
        )}
      </Card>
    </main>
  );
}
