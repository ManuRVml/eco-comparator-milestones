export function DeliveryNote({ defaultOpen }: { defaultOpen?: boolean } = {}) {
  return <div className="metric-note" role="note" aria-label="Hitos y revisión de sprints" data-testid="delivery-note">
    <details open={defaultOpen}><summary>Cómo leer milestones, revisiones y aceptación</summary>
    <p><b>Milestones (hitos M):</b> puntos en el tiempo que confirman un resultado significativo. Su cumplimiento es binario: cumplido o pendiente. El porcentaje corresponde al trabajo hacia el milestone; no existe un milestone «70 % cumplido».</p>
    <p><b>Revisiones de avance hacia milestones (S):</b> al cierre de cada sprint revisamos el resultado esperado, lo logrado, los pendientes y los ajustes. Terminar el periodo no certifica un milestone. Un hito puede abarcar varios sprints y equipos.</p>
    <p>Las fechas son objetivos de planificación. Los incidentes permiten revisar previsiones y continuar el trabajo disponible; los criterios de aceptación se mantienen explícitos.</p>
    <p><b>Glosario:</b> hito M = milestone; S = sprint; HU = historia de usuario; SP = estimación relativa del esfuerzo de una historia; weekly = revisión semanal; CP = punto de revisión.</p>
    </details>
  </div>;
}
