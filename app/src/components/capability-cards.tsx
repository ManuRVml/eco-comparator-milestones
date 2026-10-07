import Link from "next/link";
import { Card, Chip, Empty } from "@/components/ui";
import type { CapacidadView, EstadoCapacidad } from "@/lib/model";

const MAX_TARJETAS = 8;
const TONO_ESTADO: Record<EstadoCapacidad, string> = { pendiente: "slate", "en curso": "amber", entregada: "green" };
const ETIQUETA_ESTADO: Record<EstadoCapacidad, string> = { pendiente: "Pendiente", "en curso": "En curso", entregada: "Entregada" };

/** Tarjetas de capacidades de un milestone: lo que el usuario podrá hacer, sin HU ni SP. */
export function CapabilityCards({ capacidades, detalleHref, canEdit }: { capacidades: CapacidadView[]; detalleHref: string; canEdit: boolean }) {
  const visibles = capacidades.slice(0, MAX_TARJETAS);
  return (
    <Card kicker="CAPACIDADES" title="Lo que podrás hacer al cerrar este milestone" className="capability-cards">
      {visibles.length === 0 ? (
        <Empty>Este milestone aún no tiene capacidades publicadas.</Empty>
      ) : (
        <ul className="capability-grid" data-testid="capability-cards">
          {visibles.map((c) => (
            <li key={c.id} className="capability-card">
              <div className="capability-head">
                <h4>{c.titulo}</h4>
                <Chip tone={TONO_ESTADO[c.estado]}>{ETIQUETA_ESTADO[c.estado]}</Chip>
              </div>
              <p className="capability-desc">{c.descripcion}</p>
              {canEdit && c.borrador && <Chip tone="amber" title="Solo visible para el equipo hasta que se confirme">borrador</Chip>}
            </li>
          ))}
        </ul>
      )}
      <Link className="btn btn-sm" href={detalleHref}>
        Ver detalle completo
      </Link>
    </Card>
  );
}
