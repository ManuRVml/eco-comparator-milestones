import Link from "next/link";
import type { Model } from "@/lib/model";
import { PublicarControl } from "./publicar-control";
import { Card } from "../ui";
import { MilestoneContractEditor } from "./milestone-contract-editor";
export function MilestoneConfiguration({model,selected}:{model:Model;selected:string|null}) {
  const m=model.milestoneById.get(selected??"")??model.milestones[0];
  if (!m) return <p>No hay milestones disponibles.</p>;
  const c=model.contratosMilestone?.[m.id];
  return <div className="checkpoint-content" data-testid="admin-milestone-configuration">
    <nav className="filter-chips" aria-label="Milestone a configurar">{model.milestones.map(v=><Link key={v.id} href={`/editor?vista=configuracion&ms=${v.id}`} className={`fchip ${v.id===m.id?"is-on":""}`}>{v.id}</Link>)}</nav>
    <Card kicker="CONFIGURACIÓN ADMINISTRATIVA" title={m.nombre}>
      <p>Los cambios se guardan en la bitácora. La fecha comprometida y el alcance del plan se conservan; la previsión expresa una estimación actual.</p>
      <Link className="btn btn-sm" href={`/milestones/${m.id}`}>Consultar resultado y avance</Link>
      {c&&<MilestoneContractEditor id={m.id} contract={c}/>}
      <h3>Publicación de cumplimiento</h3><p>Publica después de aceptar los criterios obligatorios y sus mediciones.</p><PublicarControl tipo="milestone" id={m.id} estado={m.estado} publicada={m.publicado} fecha={m.fechaCierre} nota={m.evidencia}/>
    </Card>
  </div>;
}
