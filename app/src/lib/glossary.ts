/** Glosario de vistas de seguimiento: fuente única para la nota de entrega y el diálogo del encabezado. */
export type GlossaryTerm = { slug: string; term: string; definition: string };

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  { slug: "hito", term: "Hito (código M-01…)", definition: "identificador del hito para referirse a él en reuniones." },
  { slug: "linea-de-valor", term: "Línea de valor (L1, L2, L3)", definition: "agrupa los hitos por el valor que entregan." },
  { slug: "ciclo-de-trabajo", term: "Ciclo de trabajo N", definition: "periodo de dos semanas de trabajo." },
  { slug: "inicio-del-proyecto", term: "Inicio del proyecto", definition: "punto de partida; ambientes y accesos listos antes del primer ciclo." },
  { slug: "deadline", term: "Deadline / Fin del Hito", definition: "fecha de entrega comprometida." },
  { slug: "fecha-estimada-actual", term: "Fecha estimada actual", definition: "la fecha que hoy estimamos; puede diferir de la comprometida." },
  { slug: "estado-del-plan", term: "Estado del plan", definition: "Pendiente · En curso · En riesgo (haz clic para ver la causa) · Atrasado (la fecha pasó sin entrega aceptada) · Cumplido." },
  { slug: "entrega-aceptada", term: "Entrega aceptada (✓)", definition: "Ecopetrol aceptó los criterios y la entrega se publicó." },
  { slug: "festivo", term: "F", definition: "festivo, día no laborable." },
  { slug: "jueves", term: "Jueves", definition: "reunión semanal de seguimiento; resaltado = demostración o fecha de entrega." },
  { slug: "trabajo-hacia-el-hito", term: "% trabajo hacia el hito", definition: "trabajo entregado, contado por días de trabajo; no significa que el hito esté cumplido." },
];
