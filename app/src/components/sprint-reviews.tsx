import Link from "next/link";
import type { Model } from "@/lib/model";
import { sprintCheckpoint } from "@/lib/sprint-checkpoint";
import { fmtCorta } from "@/lib/dates";
import { fmtPct } from "@/lib/format";
import { Card, ProgressBar } from "./ui";
import { CompletionCheck } from "./completion-check";

export function SprintReviews({ model }: { model: Model }) {
  return <Card kicker="INSPECCIÓN Y ADAPTACIÓN" title="Puntos de revisión de sprint" actions={<Link className="card-link" href="/lineas">Ver línea de tiempo →</Link>}>
    <p className="muted small">Revisar estos resultados orienta el siguiente paso. El cierre del periodo y la aceptación de un hito se registran por separado.</p>
    <ul className="sprint-reviews" data-testid="sprint-reviews">
      {model.sprints.map((s) => {
        const c = sprintCheckpoint(model, s.numero)!;
        return <li key={s.id}><Link href={`/lineas?m=${c.id}`}>
          <span className="line-ms-top"><b>{c.id} · {fmtCorta(s.fechaFin)}</b><CompletionCheck complete={c.completo} label="Resultado del sprint verificado" id={`review-${c.id}`} /></span>
          <strong>{c.compromiso?.resultado || `Revisión del Sprint ${s.numero}`}</strong>
          <span>Trabajo realizado: {fmtPct(c.total.pctReal)}{!c.completo && <> · previsto al corte: {fmtPct(c.total.pctPlan)}</>}</span>
          <ProgressBar value={c.total.pctReal} plan={c.completo ? undefined : c.total.pctPlan} label={`Ejecución ponderada ${c.id}`} />
          <span className="muted small">{c.completo ? "Resultado verificado" : "Resultado pendiente de verificación"}</span>
        </Link></li>;
      })}
    </ul>
  </Card>;
}
