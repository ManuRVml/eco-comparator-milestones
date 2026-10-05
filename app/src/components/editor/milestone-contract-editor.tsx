import type { MilestoneContract } from "@/lib/milestone-contract/domain";
import { contractPending } from "@/lib/milestone-contract/domain";
import { TIPOS_METRICA, COMPARADORES_METRICA } from "@/db/milestone-schema";
import { WorkflowForm, type Field } from "./workflow-form";
export function MilestoneContractEditor({ id, contract }: { id: string; contract: MilestoneContract }) {
  const d=contract.definicion,pending=contractPending(contract);
  const fields: Field[] = [
    {name:"job",label:"Necesidad del usuario: cuándo, qué necesita y para qué (JTBD)",multiline:true,value:d.job},
    {name:"outcome",label:"Resultado esperado para el usuario",multiline:true,value:d.outcome},
    {name:"meta",label:"Resumen del objetivo de negocio",multiline:true,value:d.meta},
    {name:"alcanceIncluido",label:"Qué incluye esta entrega",multiline:true,value:d.alcanceIncluido},
    {name:"fueraAlcance",label:"Qué queda fuera de alcance",multiline:true,value:d.fueraAlcance},
    {name:"responsable",label:"Responsable del milestone (nombre)",value:d.responsable},
    {name:"aprobador",label:"Aprobador del negocio (nombre)",value:d.aprobador},
    {name:"fechaPrevision",label:"Previsión actual visible para el cliente",type:"date",value:d.fechaPrevision},
    {name:"motivoPrevision",label:"Motivo público de la previsión",multiline:true,value:d.motivoPrevision},
  ];
  const metricFields=(m?:MilestoneContract["metricas"][number]):Field[]=>[
    {name:"nombre",label:"Indicador",value:m?.nombre},
    {name:"tipo",label:"Tipo de métrica",options:TIPOS_METRICA,value:m?.tipo},
    {name:"unidad",label:"Unidad (%, segundos, usuarios…; cuantitativa)",value:m?.unidad,required:false},
    {name:"comparador",label:"Condición de la meta numérica",options:COMPARADORES_METRICA,value:m?.comparador},
    {name:"objetivo",label:"Meta numérica (solo cuantitativa)",type:"number",value:m?.objetivo??"",required:false},
    {name:"objetivoCualitativo",label:"Resultado acordado (solo cualitativa)",value:m?.objetivoCualitativo,required:false},
    {name:"metodo",label:"Cómo se medirá y con qué referencia",multiline:true,value:m?.metodo,required:false},
    {name:"tolerancia",label:"Tolerancia en la misma unidad de la meta (opcional)",type:"number",value:m?.tolerancia??"",required:false,min:0},
    {name:"muestraMinima",label:"Tamaño mínimo de muestra (opcional)",type:"number",value:m?.muestraMinima??"",required:false,min:1,max:1000000,step:1},
    {name:"activa",label:"Métrica vigente para aceptar la entrega",type:"checkbox",value:m?.activa??true},
  ];
  const criterionFields=(c?:MilestoneContract["criterios"][number]):Field[]=>[
    {name:"descripcion",label:"Condición verificable (qué debe ser verdad)",multiline:true,value:c?.descripcion},
    {name:"obligatorio",label:"Obligatorio para cumplir el milestone",type:"checkbox",value:c?.obligatorio??true},
    {name:"evidenciaRequerida",label:"Qué evidencia se necesita para aceptarlo",multiline:true,value:c?.evidenciaRequerida,required:false},
    {name:"metricaId",label:"Métrica que verifica este criterio",options:[{value:"",label:"Sin métrica asociada"},...contract.metricas.map(m=>({value:m.id,label:`${m.nombre}${m.activa?"":" (inactiva)"}`}))],value:c?.metricaId??""},
    {name:"resultadoMedido",label:"Valor real medido (cuantitativa)",type:"number",value:c?.resultadoMedido??"",required:false},
    {name:"resultadoCualitativo",label:"Resultado real observado (cualitativa)",value:c?.resultadoCualitativo,required:false},
    {name:"muestraEvaluada",label:"Muestra realmente evaluada",type:"number",value:c?.muestraEvaluada??"",required:false,min:1,max:1000000,step:1},
    {name:"estado",label:"Aceptación",options:["Pendiente","Verificado"],value:c?.estado},
    {name:"evidencia",label:"Evidencia pública de aceptación (URL o referencia)",multiline:true,required:false,value:c?.evidencia},
    {name:"aprobador",label:"Nombre de quien aprobó en el negocio",required:false,value:c?.aprobador||d.aprobador},
    {name:"fecha",label:"Fecha real de aceptación",type:"date",required:false,value:c?.fecha},
  ];
  return <section className="checkpoint-content" data-testid="contract-editor">
    <h3>Configuración de valor y aceptación · {id}</h3>
    <p>Solo el administrador configura estos compromisos. Puedes guardar borradores incompletos; sus campos pendientes impiden certificar cumplimiento. La definición y la evidencia son visibles para el cliente.</p>
    {pending.length>0&&<p className="definition-pending" role="status">Pendiente: {pending.join(" · ")}</p>}
    <WorkflowForm title="Ficha del milestone" endpoint="/api/editor/milestone" fixed={{id,accion:"ficha"}} fields={fields.map(f=>({...f,required:false}))}/>
    <p>Las métricas activas deben vincularse a criterios obligatorios. Una tolerancia vacía equivale a cero; una muestra vacía no exige un tamaño mínimo. Cambiar la definición o una métrica devuelve la aceptación a revisión y conserva el historial.</p>
    {contract.metricas.map(m=><WorkflowForm key={m.id} title={`Métrica: ${m.nombre}`} endpoint="/api/editor/milestone" fixed={{id,accion:"metrica",metricaId:m.id}} fields={metricFields(m)} submit="Guardar métrica"/>)}
    <WorkflowForm title="Añadir métrica" endpoint="/api/editor/milestone" fixed={{id,accion:"metrica"}} fields={metricFields()} submit="Añadir métrica"/>
    {contract.criterios.map(c=><WorkflowForm key={c.id} title={`Criterio ${c.id}`} endpoint="/api/editor/milestone" fixed={{id,accion:"criterio",criterioId:c.id}} fields={criterionFields(c)} submit="Guardar criterio y aceptación"/>)}
    <WorkflowForm title="Añadir criterio" endpoint="/api/editor/milestone" fixed={{id,accion:"criterio"}} fields={criterionFields()} submit="Añadir criterio"/>
  </section>;
}
