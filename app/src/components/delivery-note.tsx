export function DeliveryNote() {
  return <aside className="metric-note" aria-label="Hitos y revisión de sprints" data-testid="delivery-note">
    <p><b>Hitos de entrega (M):</b> resultados útiles para el cliente, con criterios de aceptación. El porcentaje mide el trabajo realizado; el check confirma una entrega verificada, aceptada y publicada.</p>
    <p><b>Puntos de revisión (S):</b> al cierre de cada sprint revisamos el resultado esperado, lo logrado, los pendientes y los ajustes. Terminar el periodo no certifica un hito. Un hito puede abarcar varios sprints y equipos.</p>
    <p>Las fechas son objetivos de planificación. Los incidentes permiten revisar previsiones y continuar el trabajo disponible; los criterios de aceptación se mantienen explícitos.</p>
  </aside>;
}
