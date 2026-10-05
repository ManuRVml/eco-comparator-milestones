import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, PageHeading } from "@/components/ui";
import { WorkflowForm } from "@/components/editor/workflow-form";
import { getModel, requireSession } from "@/lib/data";
import { db } from "@/db/client";
import { fuentesPlan } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ReconciliacionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  if (!session.canEdit) redirect("/lineas");
  const model = await getModel(session), w = model.workflow, params = await searchParams;
  const fuente = typeof params.fuente === "string" ? params.fuente : "", pendientes = params.pendientes === "1";
  const [source] = fuente && w?.fuentes.some((f) => f.id === fuente) ? await db.select().from(fuentesPlan).where(eq(fuentesPlan.id, fuente)) : [];
  const refs = w?.referencias.filter((r) => (!fuente || r.fuenteId === fuente) && (!pendientes || !w.correspondencias.some((c) => c.referenciaId === r.id))) ?? [];
  const descripcion = (contenido: string): string => {
    try { const r = JSON.parse(contenido); return String(r.descripcion ?? r.columnas?.[6] ?? ""); } catch { return "Contenido pendiente de revisión"; }
  };
  return <main className="page" data-testid="reconciliacion">
    <PageHeading kicker="TRAZABILIDAD" title="Fuentes y compromisos">Los IDs originales se conservan por fuente. Confirmar una correspondencia relaciona trabajo existente y mantiene sus estados, fechas y evidencia.</PageHeading>
    <div className="toolbar"><Link className="btn btn-ghost" href="/lineas">Timeline</Link><Link className="btn btn-ghost" href="/flujo">Trabajo por equipo</Link></div>
    {!w ? <Card title="Preparación"><p>Fuentes pendientes de importación sobre esta base.</p></Card> : <>
      <Card title="Líneas base conservadas"><p className="small">{model.tareas.length} tareas actuales · {w.referencias.length} referencias de fuentes · {w.correspondencias.length} correspondencias · {w.activo ? "Plan reconciliado activo" : "Plan reconciliado desactivado"}</p>
        {w.fuentes.map((f) => <p className="small" key={f.id}><b>{f.nombre}</b> · corte {f.fecha}</p>)}
        <p className="muted small">El corte de recursos del 02/10 no certifica el estado actual de los ambientes. Las actividades adicionales siguen en el alcance hasta una decisión documentada.</p>
      </Card>
      {source && <Card title={`Documento de origen · ${source.nombre}`}><details><summary>Consultar registro con corte {source.fecha}</summary><pre className="workflow-source">{source.contenido}</pre></details></Card>}
      <Card title="Hitos técnicos y entregables">
        {w.compromisos.map((h) => <p className="small" key={h.id}><b>{h.id.split(":").at(-1)}</b> · {h.sprintId} · {h.fechaBase} · {h.resultado}. Criterio: {h.criterio}</p>)}
        <p className="muted small">Piloto: H-02 tiene fecha base 09/10 y M-01 fecha base 15/10. Vincularlos requiere explicar qué parte del hito contribuye al entregable.</p>
        {w.activo && <WorkflowForm title="Relacionar un hito con un entregable" endpoint="/api/editor/plan" fixed={{ accion: "vincular" }} fields={[
          { name: "compromisoId", label: "Hito de origen", options: w.compromisos.map((h) => ({ value: h.id, label: `${h.id.split(":").at(-1)} · ${h.resultado}` })), value: w.compromisos.find((h) => h.id.endsWith(":H-02"))?.id },
          { name: "id", label: "Milestone", options: model.milestones.map((m) => m.id), value: "M-01" }, { name: "criterio", label: "Parte del resultado y criterio de correspondencia", multiline: true },
        ]} />}
        {w.vinculos.map((v) => <p className="small" key={`${v.compromisoId}:${v.milestoneId}`}>{v.compromisoId.split(":").at(-1)} → {v.milestoneId}: {v.criterio}</p>)}
      </Card>
      <form className="toolbar" method="get"><label>Fuente <select className="select" name="fuente" defaultValue={fuente}><option value="">Todas</option>{w.fuentes.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</select></label><label><input type="checkbox" name="pendientes" value="1" defaultChecked={pendientes} /> Solo sin correspondencia</label><button className="btn btn-ghost" type="submit">Filtrar</button></form>
      <Card title={`Referencias · ${refs.length}`}>
        {refs.map((r) => <details className="workflow-block" key={r.id}>
          <summary><b>{r.idOrigen}</b> · {r.nombre} · {r.decision}</summary>
          <p className="small">Fuente: {w.fuentes.find((f) => f.id === r.fuenteId)?.nombre}</p>
          <p className="small">{descripcion(r.contenido)}</p>
          {w.correspondencias.filter((c) => c.referenciaId === r.id).map((c) => <p key={c.tareaId} className="small"><Link href={`/tareas/${c.tareaId}`}>{c.tareaId}</Link> · {c.criterio}</p>)}
          {!w.correspondencias.some((c) => c.referenciaId === r.id) && <p className="muted small">Sin asignación confirmada. No se han creado estados ni fechas para esta actividad de origen.</p>}
          {w.activo && <WorkflowForm title={`Confirmar correspondencia ${r.idOrigen}`} endpoint="/api/editor/plan" fixed={{ accion: "correspondencia", referenciaId: r.id }} fields={[{ name: "id", label: "Actividad actual", options: model.tareas.map((t) => ({ value: t.id, label: `${t.id} · ${t.nombre}` })) }, { name: "criterio", label: "Correspondencia por contenido o agrupación", multiline: true }]} submit="Confirmar relación" />}
        </details>)}
      </Card>
    </>}
  </main>;
}
