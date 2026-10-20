import Link from "next/link";
import { Chip, Card, Empty, PageHeading, StatusBadge } from "@/components/ui";
import { createPendienteAction, resolvePendienteAction } from "@/app/(protected)/pendientes/actions";
import { getModel, requireSession } from "@/lib/data";
import { fmtCorta } from "@/lib/dates";
import { textoExternoNoApto } from "@/lib/client-vocab";
import { pendientesVisibles, type TipoPendiente } from "@/lib/pendientes";

const TIPO_LABEL: Record<TipoPendiente, string> = {
  licencia: "Licencia",
  creditos: "Créditos",
  acceso: "Acceso",
  informacion: "Información",
  otro: "Otro",
};

function etiquetaTipo(tipo: string): string {
  return tipo in TIPO_LABEL ? TIPO_LABEL[tipo as TipoPendiente] : "Otro";
}

export default async function PendientesPage() {
  const session = await requireSession();
  const [items, model] = await Promise.all([pendientesVisibles(session), getModel(session)]);
  const externos = items.filter((item) => item.lado === "externo");
  const internos = items.filter((item) => item.lado === "interno");

  return (
    <main className="page" data-testid="pendientes">
      <PageHeading kicker="SEGUIMIENTO" title="Pendientes">
        Seguimiento de los elementos que requieren respuesta o cierre.
      </PageHeading>

      {session.canEdit && (
        <Card kicker="NUEVO" title="Registrar pendiente">
          <form action={createPendienteAction} className="workflow-form">
            <fieldset>
              <legend className="sr-only">Registrar pendiente</legend>
              <label className="workflow-field" htmlFor="pendiente-titulo">
                <span>Título</span>
                <input id="pendiente-titulo" name="titulo" required maxLength={200} />
              </label>
              <label className="workflow-field" htmlFor="pendiente-lado">
                <span>Lado</span>
                <select className="select" id="pendiente-lado" name="lado" defaultValue="externo" required>
                  <option value="externo">Equipo Ecopetrol</option>
                  <option value="interno">Interno del equipo</option>
                </select>
              </label>
              <label className="workflow-field" htmlFor="pendiente-tipo">
                <span>Tipo</span>
                <select className="select" id="pendiente-tipo" name="tipo" defaultValue="otro" required>
                  {Object.entries(TIPO_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="workflow-field" htmlFor="pendiente-responsable">
                <span>Responsable</span>
                <input id="pendiente-responsable" name="responsable" maxLength={200} />
              </label>
              <label className="workflow-field" htmlFor="pendiente-fecha">
                <span>Fecha límite</span>
                <input id="pendiente-fecha" type="date" name="fecha_limite" />
              </label>
              <label className="workflow-field" htmlFor="pendiente-milestone">
                <span>Milestone</span>
                <select className="select" id="pendiente-milestone" name="milestone_id" defaultValue="">
                  <option value="">Sin asignar</option>
                  {model.milestones.map((milestone) => <option key={milestone.id} value={milestone.id}>{milestone.id} · {milestone.nombre}</option>)}
                </select>
              </label>
              <label className="workflow-field" htmlFor="pendiente-detalle">
                <span>Detalle</span>
                <textarea id="pendiente-detalle" name="detalle" rows={2} maxLength={2000} />
              </label>
              <button className="btn btn-primary btn-sm" type="submit">Crear pendiente</button>
            </fieldset>
          </form>
        </Card>
      )}

      <Card kicker={session.canEdit ? "EXTERNO" : "LO QUE NECESITAMOS DE ECOPETROL"} title="Pendientes de Equipo Ecopetrol" className="card-flush">
        <PendientesTable items={externos} canEdit={session.canEdit} />
      </Card>

      {session.canEdit && (
        <Card kicker="INTERNO" title="Pendientes internos del equipo" className="card-flush">
          <PendientesTable items={internos} canEdit={session.canEdit} />
        </Card>
      )}
    </main>
  );
}

function PendientesTable({ items, canEdit }: { items: Awaited<ReturnType<typeof pendientesVisibles>>; canEdit: boolean }) {
  if (items.length === 0) return <Empty>No hay pendientes en esta sección.</Empty>;

  return (
    <table className="table editor-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Tipo</th>
          <th>Responsable</th>
          <th>Fecha límite</th>
          <th>{canEdit ? "Milestone" : "Hito"}</th>
          <th>Estado</th>
          {canEdit && <th>Acción</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className={item.estado === "resuelto" ? "is-muted" : undefined}>
            <td>
              {item.titulo}
              {canEdit && item.lado === "externo" && textoExternoNoApto(item.titulo, item.detalle, item.responsable) && (
                <> <Chip tone="red">Texto no apto para Equipo Ecopetrol</Chip></>
              )}
              {item.detalle && <div className="small">{item.detalle}</div>}
            </td>
            <td><Chip tone="slate">{etiquetaTipo(item.tipo)}</Chip></td>
            <td>{item.responsable || "—"}</td>
            <td className="nowrap">{fmtCorta(item.fechaLimite)}</td>
            <td>{item.milestoneId ? <Link href={`/milestones/${item.milestoneId}`}>{item.milestoneId}</Link> : "—"}</td>
            <td><StatusBadge estado={item.estado === "abierto" ? "Abierto" : "Resuelto"} size="sm" /></td>
            {canEdit && <td>{item.estado === "abierto" && (
              <form action={resolvePendienteAction}>
                <input type="hidden" name="id" value={item.id} />
                <button className="btn btn-ghost btn-sm" type="submit">Marcar resuelto</button>
              </form>
            )}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
