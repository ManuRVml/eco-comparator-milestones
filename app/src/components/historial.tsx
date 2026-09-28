import { Card, Empty } from "@/components/ui";
import { ROLE_LABELS, type UserRole } from "@/lib/auth-constants";
import { fmtMarca } from "@/lib/dates";
import { etiquetaCampo } from "@/lib/format";
import type { Bitacora } from "@/lib/model";

export function actor(rol: string | null) {
  if (!rol) return "—";
  if (rol === "seed:evidence") return "Matriz de evidencia";
  return ROLE_LABELS[rol as UserRole] ?? rol;
}

export function Historial({ rows }: { rows: Bitacora[] }) {
  return (
    <Card kicker="SOLO EQUIPO" title="Historial de cambios">
      {rows.length === 0 ? (
        <Empty>Sin cambios registrados.</Empty>
      ) : (
        <ol className="timeline-log">
          {rows.map((r) => (
            <li key={r.id}>
              <span className="tl-when">{fmtMarca(r.creadoEn)}</span>
              <span className="tl-what">
                <b>{etiquetaCampo(r.campo)}</b>: {r.valorAnterior ?? "—"} → <b>{r.valorNuevo ?? "—"}</b>
              </span>
              <span className="tl-who">
                {actor(r.actorRol)} · origen {r.origen}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}