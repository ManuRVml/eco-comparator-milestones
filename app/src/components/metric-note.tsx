import type { Capa } from "@/lib/model";
import { fmtLarga } from "@/lib/dates";

export function MetricNote({ capa, hoy, alcance, checkpoints = false }: { capa: Capa; hoy: string; alcance: string; checkpoints?: boolean }) {
  return (
    <aside className="metric-note" aria-label="Cómo interpretar las métricas" data-testid="metric-note">
      <p><b>Cómo leer estos porcentajes.</b> Avance de ejecución ponderado por días hábiles de las tareas · {alcance} · corte {fmtLarga(hoy)}. {capa === "oficial" ? "Solo cuentan tareas aprobadas y publicadas." : "Capa técnica interna: las tareas hechas todavía pueden requerir integración, aceptación y publicación."}</p>
      <details>
        <summary>Ver fórmula, alcance y diferencia con valor entregado</summary>
        <p><b>Avance:</b> días hábiles planificados de tareas completadas ÷ días hábiles de todas las tareas del alcance × 100. Una tarea en curso aporta 0 hasta que se completa; su esfuerzo no es tiempo ya trabajado. Cada tarea se cuenta una vez dentro del alcance. El total se calcula sobre las tareas del proyecto, incluyendo alistamiento y estabilización; no se promedian porcentajes de áreas, nodos o sprints.</p>
        <p><b>Plan y brecha:</b> el plan pondera con la misma unidad las tareas cuya fecha fin base ya llegó. La brecha compara ese plan con el avance registrado; una fecha pasada no certifica una entrega ni bloquea el trabajo de otros equipos.</p>
        <p><b>Valor entregado:</b> revisar los entregables aprobados y publicados de los milestones y las HU aceptadas. Los SP describen alcance de historias; se muestran por separado y no representan beneficio financiero. Las fechas y el estado técnico por sí solos no prueban valor entregado.</p>
        {checkpoints && <p><b>Checkpoints:</b> cada nodo corresponde al cierre planificado de un sprint. Muestra el estado actual de sus tareas al corte indicado; no es una fotografía histórica ni una certificación automática de aquel día. Los milestones mantienen sus fechas y criterios de entrega propios.</p>}
      </details>
    </aside>
  );
}
