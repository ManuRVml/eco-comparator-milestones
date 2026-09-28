import { NotaForm } from "@/components/editor/nota-form";
import { VisibilidadToggle } from "@/components/editor/visibilidad-toggle";
import { Card, Empty } from "@/components/ui";
import { ROLE_LABELS, type UserRole } from "@/lib/auth-constants";
import { fmtMarca } from "@/lib/dates";
import type { Model } from "@/lib/model";

export function Notas({
  model,
  entidadTipo,
  entidadId,
  canEdit,
}: {
  model: Model;
  entidadTipo: "tarea" | "historia" | "milestone";
  entidadId: string;
  canEdit: boolean;
}) {
  const notas = model.notas.filter((n) => n.entidadTipo === entidadTipo && n.entidadId === entidadId);
  if (!canEdit && notas.length === 0) return null;
  return (
    <Card kicker="SEGUIMIENTO" title="Notas" className="notas-card">
      {notas.length === 0 ? (
        <Empty>{canEdit ? "Aún no hay notas. Las notas internas nunca se muestran al equipo Ecopetrol." : "Sin notas por ahora."}</Empty>
      ) : (
        <ul className="nota-list" data-testid="nota-list">
          {notas.map((n) => (
            <li key={n.id} className={`nota ${n.visibleCliente ? "" : "is-internal"}`}>
              <p>{n.texto}</p>
              <div className="nota-meta">
                <span>{ROLE_LABELS[n.autorRol as UserRole] ?? n.autorRol}</span>
                <span>{fmtMarca(n.creadoEn)}</span>
                {canEdit ? <VisibilidadToggle tipo="nota" id={n.id} visible={n.visibleCliente} etiqueta={n.visibleCliente ? "Visible para Ecopetrol" : "Nota interna"} /> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {canEdit && <NotaForm entidadTipo={entidadTipo} entidadId={entidadId} />}
    </Card>
  );
}