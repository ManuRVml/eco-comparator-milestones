import Link from "next/link";
import { AreaDot } from "@/components/ui";
import { colorArea, fmtPct } from "@/lib/format";
import type { AreaProgreso } from "@/lib/model";

/** Bullet chart: barra = real (ponderado por días hábiles); marca = planificado a la fecha. */
export function AreaBullets({
  areas,
  linkBase = "/areas?area=",
  etiquetaReal = "Real (días hábiles hechos)",
}: {
  areas: AreaProgreso[];
  linkBase?: string;
  etiquetaReal?: string;
}) {
  const max = 100;
  return (
    <div className="bullets" role="table" aria-label="Avance planificado frente a real por área">
      <div className="bullets-scale" aria-hidden="true">
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t} style={{ left: `${(t / max) * 100}%` }}>
            {t}%
          </span>
        ))}
      </div>
      {areas.map((a) => {
        const atrasada = a.brecha < 0 && a.pctPlan > 0;
        return (
          <div className="bullet-row" role="row" key={a.areaId}>
            <Link className="bullet-label" role="rowheader" href={`${linkBase}${a.areaId}`}>
              <AreaDot areaId={a.areaId} />
              <span>{a.nombre}</span>
            </Link>
            <div className="bullet-track" role="cell">
              {[25, 50, 75].map((t) => (
                <span key={t} className="bullet-grid" style={{ left: `${t}%` }} aria-hidden="true" />
              ))}
              {a.pctReal > 0 && <div className="bullet-bar" style={{ width: `${Math.min(100, a.pctReal)}%`, background: colorArea(a.areaId) }} />}
              <div className="bullet-plan" style={{ left: `${Math.min(100, a.pctPlan)}%` }} title={`Planificado a la fecha: ${fmtPct(a.pctPlan)}`} />
            </div>
            <div className="bullet-values" role="cell">
              <strong>{fmtPct(a.pctReal)}</strong>
              <span>plan {fmtPct(a.pctPlan)}</span>
            </div>
            <span className={`delta ${atrasada ? "is-neg" : a.brecha > 0 ? "is-pos" : ""}`} role="cell">
              {a.brecha > 0 ? "+" : ""}
              {a.brecha.toFixed(1).replace(".", ",")} pts
            </span>
          </div>
        );
      })}
      <div className="bullets-legend">
        <span>
          <i className="lg-bar" /> {etiquetaReal}
        </span>
        <span>
          <i className="lg-plan" /> Planificado a la fecha
        </span>
      </div>
    </div>
  );
}