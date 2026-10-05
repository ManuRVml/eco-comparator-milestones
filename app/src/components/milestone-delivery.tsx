import type { MilestoneView } from "@/lib/model";
import { CompletionCheck } from "./completion-check";

export function MilestoneDelivery({ m }: { m: MilestoneView }) {
  return <section className="checkpoint-expectation" data-testid={`delivery-${m.id}`} aria-label="Cumplimiento del hito de entrega">
    <h4>Milestone (hito) · {m.id} <CompletionCheck complete={!!m.cierreVerificado} label="Entrega verificada, aceptada y publicada" id={`delivery-${m.id}`} /></h4>
    <p><b>Cumplimiento: {m.cierreVerificado ? "Cumplido y confirmado" : "Pendiente de confirmación"}.</b> El porcentaje mide trabajo hacia este milestone; el estado de seguimiento indica su situación y no sustituye la aceptación del resultado.</p>
    <p><b>Resultado para el cliente:</b> {m.valorCliente || m.nombre}</p>
    <p><b>Criterio de aceptación:</b> {m.criterio || "Por definir; el hito no puede certificarse."}</p>
    <p><b>Evidencia de aceptación:</b> {m.publicado && m.evidencia ? m.evidencia : "Sin registro de aceptación publicado."}</p>
    <p className="muted small">Definición de valor pendiente: job del usuario, outcome medible, fuera de alcance y nombres del responsable y aprobador todavía no están registrados en la ficha.</p>
    <details>
      <summary>Contexto de valor y definición del milestone</summary>
      <p><b>Alcance relacionado:</b> {m.huIds.length} historias de usuario · {m.tareaIds.length} tareas · {m.epicas?.replaceAll(";", " · ") || "Épicas no registradas"}.</p>
      <p><b>Job del usuario (JTBD):</b> por registrar explícitamente; el resultado para el cliente es la referencia disponible.</p>
      <p><b>Outcome medible:</b> por registrar con su métrica y objetivo; el porcentaje de tareas no mide el beneficio del usuario.</p>
      <p><b>Fuera de alcance:</b> no registrado en la ficha actual.</p>
      <p><b>Responsable del milestone y aprobador:</b> nombres no registrados en la ficha actual. El permiso de publicar no identifica al aprobador del negocio.</p>
      <p className="muted small">Completar esta definición permite evaluar el resultado desde la perspectiva del usuario.</p>
    </details>
    <p className="muted small">El check requiere criterio definido, tareas verificadas, historias aceptadas y registro de aprobación y publicación con fecha y evidencia.</p>
  </section>;
}
