export function DeliveryNote() {
  return <aside className="metric-note" aria-label="Hitos y revisión de sprints" data-testid="delivery-note">
    <p><b>Milestones (hitos M):</b> puntos en el tiempo que confirman un resultado significativo. Su cumplimiento es binario: cumplido o pendiente. El porcentaje corresponde al trabajo hacia el milestone; no existe un milestone «70 % cumplido».</p>
    <p><b>Revisiones de avance hacia milestones (S):</b> al cierre de cada sprint revisamos el resultado esperado, lo logrado, los pendientes y los ajustes. Terminar el periodo no certifica un milestone. Un hito puede abarcar varios sprints y equipos.</p>
    <p>Las fechas son objetivos de planificación. Los incidentes permiten revisar previsiones y continuar el trabajo disponible; los criterios de aceptación se mantienen explícitos.</p>
  </aside>;
}
