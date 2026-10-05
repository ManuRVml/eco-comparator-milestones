import type { MilestoneView } from "@/lib/model";
import { CompletionCheck } from "./completion-check";

export function MilestoneDelivery({ m }: { m: MilestoneView }) {
  return <section className="checkpoint-expectation" data-testid={`delivery-${m.id}`} aria-label="Cumplimiento del hito de entrega">
    <h4>Hito de entrega · {m.id} <CompletionCheck complete={!!m.cierreVerificado} label="Entrega verificada, aceptada y publicada" id={`delivery-${m.id}`} /></h4>
    <p><b>{m.cierreVerificado ? "Entrega confirmada" : "Entrega pendiente de confirmación"}.</b> El estado de seguimiento y el porcentaje de tareas no sustituyen la aceptación del resultado.</p>
    <p><b>Resultado para el cliente:</b> {m.valorCliente || m.nombre}</p>
    <p><b>Criterio de aceptación:</b> {m.criterio || "Por definir; el hito no puede certificarse."}</p>
    <p className="muted small">El check requiere criterio definido, tareas verificadas, historias aceptadas y registro de aprobación y publicación con fecha y evidencia.</p>
  </section>;
}
