export function DeliveryNote({ defaultOpen, equipo }: { defaultOpen?: boolean; equipo?: boolean } = {}) {
  return <div className="metric-note" role="note" aria-label={equipo ? "Hitos y revisión de sprints" : "Hitos y revisiones de avance"} data-testid="delivery-note">
    <details open={defaultOpen}><summary>{equipo ? "Cómo leer milestones, revisiones y aceptación" : "Cómo leer hitos, revisiones y aceptación"}</summary>
    {!equipo ? <>
      <p>Revisiones de avance (Ciclo 1, 2…): al cierre de cada ciclo de trabajo de dos semanas revisamos con el equipo Ecopetrol lo entregado.</p>
      <b>Glosario</b>
      <dl className="definition-grid">
        <div><dt>Hito (código M-01…)</dt><dd>identificador del hito para referirse a él en reuniones.</dd></div>
        <div><dt>Línea de valor (L1, L2, L3)</dt><dd>agrupa los hitos por el valor que entregan.</dd></div>
        <div><dt>Ciclo de trabajo N</dt><dd>periodo de dos semanas de trabajo.</dd></div>
        <div><dt>Inicio del proyecto</dt><dd>punto de partida; ambientes y accesos listos antes del primer ciclo.</dd></div>
        <div><dt>Deadline / Fin del Hito</dt><dd>fecha de entrega comprometida.</dd></div>
        <div><dt>Fecha estimada actual</dt><dd>la fecha que hoy estimamos; puede diferir de la comprometida.</dd></div>
        <div><dt>Estado del plan</dt><dd>Pendiente · En curso · En riesgo (haz clic para ver la causa) · Atrasado (la fecha pasó sin entrega aceptada) · Cumplido.</dd></div>
        <div><dt>Entrega aceptada (✓)</dt><dd>Ecopetrol aceptó los criterios y la entrega se publicó.</dd></div>
        <div><dt>F</dt><dd>festivo, día no laborable.</dd></div>
        <div><dt>Jueves</dt><dd>reunión semanal de seguimiento; resaltado = demostración o fecha de entrega.</dd></div>
        <div><dt>% trabajo hacia el hito</dt><dd>trabajo entregado, contado por días de trabajo; no significa que el hito esté cumplido.</dd></div>
      </dl>
    </> : <>
    <p><b>Milestones (hitos M):</b> puntos en el tiempo que confirman un resultado significativo. Su cumplimiento es binario: cumplido o pendiente. El porcentaje corresponde al trabajo hacia el milestone; no existe un milestone «70 % cumplido».</p>
    <p><b>Revisiones de avance hacia milestones (S):</b> al cierre de cada sprint revisamos el resultado esperado, lo logrado, los pendientes y los ajustes. Terminar el periodo no certifica un milestone. Un hito puede abarcar varios sprints y equipos.</p>
    <p>Las fechas son objetivos de planificación. Los incidentes permiten revisar previsiones y continuar el trabajo disponible; los criterios de aceptación se mantienen explícitos.</p>
    <p><b>Glosario:</b> hito M = milestone; S = sprint; HU = historia de usuario; SP = estimación relativa del esfuerzo de una historia; weekly = revisión semanal; CP = punto de revisión.</p>
    </>}
    </details>
  </div>;
}
