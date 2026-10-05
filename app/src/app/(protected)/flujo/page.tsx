import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, PageHeading, StatusBadge } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { EJECUCIONES, ejecucionLegada } from "@/lib/workflow/domain";

export default async function FlujoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  if (!session.canEdit) redirect("/lineas");
  const model = await getModel(session), params = await searchParams, w = model.workflow;
  const area = typeof params.area === "string" ? params.area : "", milestone = typeof params.milestone === "string" ? params.milestone : "";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 120).toLocaleLowerCase("es") : "";
  const filtro = params.filtro === "bloqueo" || params.filtro === "incidente" ? params.filtro : "";
  const ms = model.milestoneById.get(milestone), ids = ms ? new Set(ms.tareaIds) : null;
  const ts = model.tareas.filter((t) => {
    const taskBlocks = w?.bloqueos.filter((b) => !b.resueltoEn && b.tareaId === t.id) ?? [];
    const taskIncidents = w?.bloqueos.filter((b) => b.tipo === "Incidente" && b.tareaId === t.id) ?? [];
    return (!area || t.areaId === area) && (!ids || ids.has(t.id)) && (!query || `${t.id} ${t.nombre}`.toLocaleLowerCase("es").includes(query)) && (!filtro || (filtro === "bloqueo" ? taskBlocks.length > 0 : taskIncidents.length > 0));
  });
  const incidents = w?.bloqueos.filter((b) => b.tipo === "Incidente" && ts.some((t) => t.id === b.tareaId)) ?? [];
  const blocks = w?.bloqueos.filter((b) => !b.resueltoEn && ts.some((t) => t.id === b.tareaId)) ?? [];
  return <main className="page" data-testid="flujo">
    <PageHeading kicker="TRABAJO EN PARALELO" title="Trabajo por equipo">Cada actividad conserva su sprint y fecha base. Los insumos disponibles permiten adelantar trabajo; los bloqueos afectan el momento indicado.</PageHeading>
    <div className="toolbar"><Link className="btn btn-ghost" href="/lineas">Volver al timeline</Link><Link className="btn btn-ghost" href="/reconciliacion">Fuentes y compromisos</Link></div>
    {!w?.activo ? <Card title="Preparación del flujo"><p>La reconciliación aún no está activa en esta base. Las tareas y el historial siguen disponibles en el timeline.</p></Card> : <>
      <form className="toolbar record-filters" method="get">
        <label>Equipo <select className="select" name="area" defaultValue={area}><option value="">Todos</option>{model.areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></label>
        <label>Entregable <select className="select" name="milestone" defaultValue={milestone}><option value="">Todos</option>{model.milestones.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.nombre}</option>)}</select></label>
        <label>Buscar actividad <input className="select" type="search" name="q" maxLength={120} defaultValue={query} /></label>
        <label>Atención <select className="select" name="filtro" defaultValue={filtro}><option value="">Todas las actividades</option><option value="bloqueo">Con bloqueo abierto</option><option value="incidente">Con incidente</option></select></label>
        <button className="btn btn-ghost" type="submit">Filtrar</button>
      </form>
      <p className="muted small">{ts.length} actividades únicas · {blocks.length} bloqueos abiertos · {incidents.reduce((sum, b) => sum + b.esfuerzoMinutos, 0)} minutos registrados en incidentes</p>
      {filtro && !ts.length && <p className="muted" role="status">No hay actividades para esta búsqueda y atención.</p>}
      <div className="workflow-columns">{EJECUCIONES.map((estado) => {
        const tasks = ts.filter((t) => (w.flujos.find((f) => f.tareaId === t.id)?.ejecucion ?? ejecucionLegada(t.estado)) === estado)
          .sort((a, b) => (w.flujos.find((f) => f.tareaId === b.id)?.prioridad ?? 0) - (w.flujos.find((f) => f.tareaId === a.id)?.prioridad ?? 0) || (a.fechaFin ?? "").localeCompare(b.fechaFin ?? ""));
        return <details key={estado} className="workflow-column workflow-group">
          <summary><strong>{estado} · {tasks.length} actividades</strong></summary>
          <div className="workflow-group-content">
          {tasks.map((t) => {
            const flow = w.flujos.find((f) => f.tareaId === t.id), bs = blocks.filter((b) => b.tareaId === t.id);
            const relations = w.relaciones.filter((r) => r.tareaId === t.id && !r.disponible && r.tipo !== "Coordinación");
            return <Link className="workflow-task" href={`/tareas/${t.id}`} key={t.id} data-testid={`flow-task-${t.id}`}>
              <b>{t.id}</b> · {t.nombre}<p className="small">{model.areaById.get(t.areaId ?? "")?.nombre} · {t.sprintId}</p>
              <p className="small">Base: {t.fechaFin} · Previsión: {flow?.prevision ?? "Sin actualizar"}</p>
              <StatusBadge estado={t.estado} size="sm" />
              {[...bs.map((b) => `${b.tipo}: ${b.afecta}`), ...relations.map((r) => `Insumo pendiente: ${r.afecta}`)].map((label, i) => <p className="small" key={i}>{label}</p>)}
              <p className="small">Integración: {w.validaciones.find((v) => v.tareaId === t.id && v.etapa === "Integración")?.resultado ?? "Sin verificar"}</p>
            </Link>;
          })}
          {!tasks.length && <p className="muted small">Sin actividades en esta columna.</p>}
          </div>
        </details>;
      })}</div>
    </>}
  </main>;
}
