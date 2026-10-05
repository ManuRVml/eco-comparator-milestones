import Link from "next/link";
import { ESTADOS_TAREA } from "@/db/schema";
import { EstadoControl } from "@/components/editor/estado-control";
import { VisibilidadToggle } from "@/components/editor/visibilidad-toggle";
import { AreaDot, CriticalBadge, StatusBadge } from "@/components/ui";
import { fmtCorta } from "@/lib/dates";
import type { Model, Tarea } from "@/lib/model";
import { tareaCompletada } from "@/lib/completion";
import { CompletionCheck } from "@/components/completion-check";

export function TareaRow({ t, model, canEdit, showArea = false }: { t: Tarea; model: Model; canEdit: boolean; showArea?: boolean }) {
  const hu = t.historiaId ? model.huById.get(t.historiaId) : null;
  const vencida = t.estado !== "Hecha" && t.fechaFin && t.fechaFin < model.hoy;
  return (
    <li className={`tarea-row ${t.estado === "Hecha" ? "is-done" : ""}`} data-testid={`tarea-${t.id}`}>
      <div className="tarea-main">
        <div className="tarea-title">
          {showArea && <AreaDot areaId={t.areaId} />}
          <Link href={`/tareas/${t.id}`} className="id-link">
            {t.id}
          </Link>
          <span className="tarea-name">{t.nombre}</span>
          <CompletionCheck complete={tareaCompletada(t, model)} label={model.capa === "oficial" ? "Tarea completada, aprobada y publicada" : "Implementación completada con evidencia"} id={t.id} />
        </div>
        <div className="tarea-meta">
          <StatusBadge estado={t.estado} size="sm" />
          {hu && (
            <Link href={`/historias/${hu.id}`} className="meta-link" title={hu.nombre}>
              {hu.id}
            </Link>
          )}
          <span className={vencida ? "meta-late" : ""} title={t.estado === "Hecha" ? "Fecha de cierre" : "Fecha fin planificada"}>
            {t.estado === "Hecha" ? (t.fechaCierre ? `Cerrada ${fmtCorta(t.fechaCierre)}` : "Cierre sin fecha registrada") : `Fin ${fmtCorta(t.fechaFin)}`}
          </span>
          {t.rutaCritica && <CriticalBadge />}
          {canEdit && !t.visibleCliente && <span className="chip tone-slate">Oculta a Ecopetrol</span>}
          {canEdit && t.publicadoCliente && <span className="chip tone-green">Publicada</span>}
        </div>
        {t.evidencia && (
          <p className="tarea-evidencia" title={t.evidencia}>
            <span>{model.capa === "oficial" ? "Entrega" : "Evidencia"}</span> {t.evidencia}
          </p>
        )}
      </div>
      {canEdit && (
        <div className="tarea-edit">
          <EstadoControl tipo="tarea" id={t.id} estado={t.estado} estados={ESTADOS_TAREA} evidencia={t.evidencia} compact />
          <VisibilidadToggle tipo="tarea" id={t.id} visible={t.visibleCliente} />
        </div>
      )}
    </li>
  );
}
