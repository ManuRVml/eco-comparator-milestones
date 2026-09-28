import Link from "next/link";
import { PublicarControl } from "@/components/editor/publicar-control";
import { AreaDot, Card, Empty, PageHeading } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { colorLinea } from "@/lib/format";

/**
 * Cola de verificación (editor o admin): tareas con estado técnico Hecha aún sin publicar. Se revisa la evidencia
 * técnica sugerida y se aprueba con fecha y nota de entrega; solo entonces el equipo Ecopetrol las ve.
 */
export default async function VerificacionPage() {
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
  const pendientes = model.tareas
    .filter((t) => !t.publicadoCliente && t.estado === "Hecha")
    .sort((a, b) => (a.fechaFin ?? "").localeCompare(b.fechaFin ?? "") || a.id.localeCompare(b.id));
  const publicadas = model.tareas.filter((t) => t.publicadoCliente).sort((a, b) => (b.fechaPublicacion ?? "").localeCompare(a.fechaPublicacion ?? ""));

  const fila = (t: (typeof model.tareas)[number], conEvidencia: boolean) => {
    const ms = (model.milestonesPorTarea.get(t.id) ?? []).map((id) => model.milestoneById.get(id)).filter((m) => !!m);
    return (
      <tr key={t.id} data-testid={`verif-${t.id}`}>
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
              <Link key={m.id} href={`/milestones/${m.id}`} style={{ color: colorLinea(m.lineaId) }}>
                {m.id}
              </Link>
            ))}
          </div>
        </td>
        <td className="verif-evid">{conEvidencia ? (t.evidencia ?? <span className="muted">Sin evidencia registrada</span>) : (t.notaPublicacion ?? "—")}</td>
        <td>
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

      <Card kicker="COLA" title="Por verificar" className="card-flush">
        {pendientes.length === 0 ? (
          <Empty>No hay tareas pendientes de verificación.</Empty>
        ) : (
          <table className="table editor-table" data-testid="verif-pendientes">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Área · milestone</th>
                <th>Evidencia técnica sugerida</th>
                <th>Aprobar y publicar</th>
              </tr>
            </thead>
            <tbody>{pendientes.map((t) => fila(t, true))}</tbody>
          </table>
        )}
      </Card>

      <Card kicker="PUBLICADAS" title="Visibles para el equipo Ecopetrol" className="card-flush">
        {publicadas.length === 0 ? (
          <Empty>Aún no hay tareas publicadas.</Empty>
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
            <tbody>{publicadas.map((t) => fila(t, false))}</tbody>
          </table>
        )}
      </Card>
    </main>
  );
}