import type { MilestoneContract } from "@/lib/milestone-contract/domain";
import { WorkflowForm, type Field } from "./workflow-form";

export function MilestoneContractEditor({ id, contract, isAdmin }: { id: string; contract: MilestoneContract; isAdmin: boolean }) {
  const d = contract.definicion;
  const fields: Field[] = [
    { name: "job", label: "Job del usuario: cuándo, qué necesita y para qué", multiline: true, value: d.job },
    { name: "outcome", label: "Outcome: resultado medible para el usuario", multiline: true, value: d.outcome },
    { name: "meta", label: "Métrica y meta acordada (incluye unidad y referencia)", multiline: true, value: d.meta },
    { name: "fueraAlcance", label: "Fuera de alcance", multiline: true, value: d.fueraAlcance },
    { name: "responsable", label: "Responsable del milestone (nombre)", value: d.responsable },
    { name: "aprobador", label: "Aprobador del negocio (nombre)", value: d.aprobador },
    { name: "fechaPrevision", label: "Previsión actual visible para el cliente", type: "date", value: d.fechaPrevision },
    { name: "motivoPrevision", label: "Motivo público de la previsión", multiline: true, value: d.motivoPrevision },
  ];
  const criterionFields = (c?: MilestoneContract["criterios"][number]): Field[] => [
    { name: "descripcion", label: "Condición verificable (qué debe ser verdad)", multiline: true, value: c?.descripcion },
    { name: "obligatorio", label: "Obligatorio para cumplir el milestone", type: "checkbox", value: c?.obligatorio ?? true },
    { name: "estado", label: "Aceptación", options: isAdmin ? ["Pendiente", "Verificado"] : ["Pendiente"], value: c?.estado },
    { name: "evidencia", label: "Evidencia pública de aceptación (URL o referencia)", multiline: true, required: false, value: c?.evidencia },
    { name: "aprobador", label: "Nombre de quien aprobó en el negocio", required: false, value: c?.aprobador || d.aprobador },
    { name: "fecha", label: "Fecha real de aceptación", type: "date", required: false, value: c?.fecha },
  ];
  return <details className="workflow-summary" data-testid="contract-editor"><summary>Definir milestone y registrar aceptación</summary>
    <p className="small">La ficha y sus evidencias son visibles para el cliente. Cambiar job, outcome, meta, fuera de alcance o aprobador devuelve los criterios a revisión; la bitácora conserva el historial. Registrar una previsión no cambia la fecha comprometida.</p>
    <WorkflowForm title="Ficha del milestone" endpoint="/api/editor/milestone" fixed={{ id, accion: "ficha" }} fields={fields.map((f) => ({ ...f, required: false }))} />
    {contract.criterios.filter((c) => isAdmin || c.estado === "Pendiente").map((c) => <WorkflowForm key={c.id} title={`Criterio ${c.id}`} endpoint="/api/editor/milestone" fixed={{ id, accion: "criterio", criterioId: c.id }} fields={criterionFields(c)} submit="Guardar criterio y aceptación" />)}
    <WorkflowForm title="Añadir criterio" endpoint="/api/editor/milestone" fixed={{ id, accion: "criterio" }} fields={criterionFields()} submit="Añadir criterio" />
  </details>;
}
