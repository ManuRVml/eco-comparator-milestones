import type { bloqueosTarea, compromisoMilestone, compromisosSprint, flujoTarea, fuentesPlan, previsionesMilestone, referenciasPlan, referenciaTarea, relacionesFlujo, validacionesTarea } from "../../db/schema";
export interface Workflow {
  activo: boolean;
  flujos: (typeof flujoTarea.$inferSelect)[];
  bloqueos: (typeof bloqueosTarea.$inferSelect)[];
  validaciones: (typeof validacionesTarea.$inferSelect)[];
  relaciones: (typeof relacionesFlujo.$inferSelect)[];
  compromisos: (typeof compromisosSprint.$inferSelect)[];
  vinculos: (typeof compromisoMilestone.$inferSelect)[];
  previsiones: (typeof previsionesMilestone.$inferSelect)[];
  referencias: (typeof referenciasPlan.$inferSelect)[];
  correspondencias: (typeof referenciaTarea.$inferSelect)[];
  fuentes: Omit<typeof fuentesPlan.$inferSelect, "contenido" | "creadoEn">[];
}
