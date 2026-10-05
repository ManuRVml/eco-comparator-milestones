import type { Capa } from "@/lib/model";
import { fmtLarga } from "@/lib/dates";

export function MetricNote({ capa, hoy, alcance, checkpoints = false }: { capa: Capa; hoy: string; alcance: string; checkpoints?: boolean }) {
  return (
    <aside className="metric-note" aria-label="Cómo interpretar las métricas" data-testid="metric-note">
      <p><b>Trabajo hacia el milestone:</b> ponderado por días hábiles; no confirma aceptación. {capa === "oficial" ? "Solo cuenta trabajo aprobado y publicado." : "Ejecución técnica interna, pendiente de aceptación."}</p>
      <details>
        <summary>Ver fórmula, alcance y diferencia con valor entregado</summary>
        <p>{alcance} · corte {fmtLarga(hoy)}. 100 % de tareas no demuestra por sí solo el cumplimiento del resultado.</p>
        <p><b>Avance:</b> días hábiles planificados de tareas completadas ÷ días hábiles de todas las tareas del alcance × 100. Una tarea en curso aporta 0 hasta que se completa; su esfuerzo no es tiempo ya trabajado. Cada tarea se cuenta una vez dentro del alcance. El total se calcula sobre las tareas del proyecto, incluyendo alistamiento y estabilización; no se promedian porcentajes de áreas, nodos o sprints.</p>
        <p><b>Plan y brecha:</b> el plan pondera con la misma unidad las tareas cuya fecha fin base ya llegó. La brecha compara ese plan con el avance registrado; una fecha pasada no certifica una entrega ni bloquea el trabajo de otros equipos.</p>
        {checkpoints && <p><b>Total y áreas del cierre:</b> el total conserva todas las áreas aunque se filtre una. Peso del área = esfuerzo del área ÷ esfuerzo del nodo; aporte = peso × avance propio del área. La suma de aportes da el avance total. Previsto al corte compara las fechas base con lo registrado hoy; el objetivo al cierre es 100 %. Llegar a 100 % de ejecución todavía requiere verificar la entrega para mostrar el check. Cuando el cierre está completo y verificado se destaca lo realizado.</p>}
        <p><b>Valor entregado:</b> revisar los entregables aprobados y publicados de los milestones y las HU aceptadas. Los SP describen alcance de historias; se muestran por separado y no representan beneficio financiero. Las fechas y el estado técnico por sí solos no prueban valor entregado.</p>
        {checkpoints && <p><b>Revisiones de sprint y checks:</b> cada nodo corresponde al cierre planificado de un sprint y muestra el resultado esperado. Su porcentaje refleja el estado actual al corte, no una fotografía histórica. El check del cierre exige todo el alcance y sus correspondencias confirmadas; el filtro de área no puede certificar un sprint completo. En la capa técnica exige evidencia, integración y aceptación verificadas; en la oficial, aprobación y publicación. El check de una tarea técnica solo confirma su implementación, no la entrega del sprint. Los milestones conservan fechas y criterios propios.</p>}
      </details>
    </aside>
  );
}
