import type { AreaProgreso } from "@/lib/model";
import { fmtPct } from "@/lib/format";
import { ProgressBar } from "@/components/ui";

export function CheckpointProgress({ total, areas, completo, areaId }: { total: AreaProgreso; areas: AreaProgreso[]; completo: boolean; areaId: string | null }) {
  return (
    <section className="checkpoint-progress" aria-label="Avance total y aporte por área" data-testid="checkpoint-progress">
      <h4>{completo ? "Entrega completada y verificada" : "Lo previsto y lo realizado por área"}</h4>
      <p>El peso de cada área depende de su esfuerzo dentro de este cierre. Avance total = suma de sus aportes; no es un promedio simple de porcentajes.</p>
      <div className="table-scroll">
        <table className="table">
          <thead><tr><th>Área</th><th className="num">Peso en el nodo</th>{!completo && <th className="num">Previsto al corte</th>}<th className="num">Real del área</th><th className="num">Aporte al total</th>{!completo && <th className="num">Brecha del área</th>}</tr></thead>
          <tbody>
            {areas.map((a) => {
              const peso = total.dias ? a.dias / total.dias * 100 : 0;
              const aporte = total.dias ? a.diasHechos / total.dias * 100 : 0;
              return <tr key={a.areaId} className={a.areaId === areaId ? "checkpoint-area-selected" : ""} data-testid={`contribution-${a.areaId}`}>
                <td><b>{a.nombre}</b><small className="checkpoint-effort">{a.diasHechos}/{a.dias} días hábiles</small></td>
                <td className="num">{fmtPct(peso)}</td>{!completo && <td className="num">{fmtPct(a.pctPlan)}</td>}
                <td className="num">{fmtPct(a.pctReal)}</td><td className="num">{aporte.toFixed(1).replace(".", ",")} pts</td>
                {!completo && <td className="num">{a.brecha > 0 ? "+" : ""}{a.brecha.toFixed(1).replace(".", ",")} pts</td>}
              </tr>;
            })}
            <tr className="total-row" data-testid="contribution-total"><td>Total del cierre<small className="checkpoint-effort">{total.diasHechos}/{total.dias} días hábiles · {total.hechas}/{total.total} tareas</small></td><td className="num">{total.dias ? "100 %" : "0 %"}</td>{!completo && <td className="num">{fmtPct(total.pctPlan)}</td>}<td className="num">{fmtPct(total.pctReal)}</td><td className="num">{total.pctReal.toFixed(1).replace(".", ",")} pts</td>{!completo && <td className="num">{total.brecha > 0 ? "+" : ""}{total.brecha.toFixed(1).replace(".", ",")} pts</td>}</tr>
          </tbody>
        </table>
      </div>
      <ProgressBar value={total.pctReal} plan={completo ? undefined : total.pctPlan} label="Avance ponderado total del cierre" />
      {areaId && <p>El filtro destaca el área y sus tareas. El porcentaje total y el check conservan el alcance completo del cierre.</p>}
    </section>
  );
}
