import Link from "next/link";
import { MilestoneConfiguration } from "@/components/editor/milestone-configuration";
import { ESTADOS_HISTORIA, ESTADOS_TAREA } from "@/db/schema";
import { AreaFilter } from "@/components/area-filter";
import { ConfigToggle } from "@/components/editor/config-toggle";
import { EstadoControl } from "@/components/editor/estado-control";
import { PublicarControl } from "@/components/editor/publicar-control";
import { VisibilidadToggle } from "@/components/editor/visibilidad-toggle";
import { AreaDot, Card, CriticalBadge, Empty, PageHeading, StatusBadge } from "@/components/ui";
import { getModel, requireSession } from "@/lib/data";
import { fmtCorta } from "@/lib/dates";
import { colorLinea } from "@/lib/format";
import { ESTADOS_MILESTONE } from "@/lib/model";

const VISTAS = [
  { id: "tareas", label: "Tareas" },
  { id: "hu", label: "Historias de usuario" },
  { id: "milestones", label: "Milestones" },
  { id: "configuracion", label: "Configuración de milestones" },
  { id: "visibilidad", label: "Visibilidad y ajustes" },
] as const;

export default async function EditorPage({ searchParams }: PageProps<"/editor">) {
  const session = await requireSession();
  if (!session.canEdit) {
    return (
      <main className="page">
        <PageHeading kicker="ACCESO RESTRINGIDO" title="Solo lectura">
          Tu rol es de consulta. El panel del editor está disponible para el equipo.
        </PageHeading>
      </main>
    );
  }
  const model = await getModel(session);
  const sp = await searchParams;
  const vista = VISTAS.find((v) => v.id === sp.vista)?.id ?? "tareas";
  if (vista === "configuracion" && !session.isAdmin) return <main className="page"><PageHeading kicker="ACCESO RESTRINGIDO" title="Solo el administrador configura milestones">Tu rol permite consultar resultados y actualizar el trabajo autorizado.</PageHeading></main>;
  const areaId = typeof sp.area === "string" && model.areaById.has(sp.area) ? sp.area : null;
  const estado = typeof sp.estado === "string" ? sp.estado : null;
  const ms = typeof sp.ms === "string" && model.milestoneById.has(sp.ms) ? sp.ms : null;
  const base = (extra: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const all = { vista, area: areaId, estado, ms, ...extra };
    for (const [k, v] of Object.entries(all)) if (v) p.set(k, v);
    return `/editor?${p.toString()}`;
  };

  const tareas = model.tareas.filter(
    (t) => (!areaId || t.areaId === areaId) && (!estado || t.estado === estado) && (!ms || (model.milestonesPorTarea.get(t.id) ?? []).includes(ms)),
  );
  const hus = model.historias.filter((h) => (!estado || h.estado === estado) && (!ms || (model.milestonesPorHu.get(h.id) ?? []).includes(ms)));
  const internas = model.notas.filter((n) => !n.visibleCliente).length;

  return (
    <main className="page" data-testid="editor">
      <PageHeading
        kicker={session.isAdmin ? "ADMINISTRACIÓN" : "PANEL DEL EDITOR"}
        title={vista === "configuracion" ? "Configura el valor y la aceptación de cada milestone" : "Actualiza el avance en tiempo casi real"}
        aside={
          <div className="agenda-summary">
            <div>
              <strong>
                {model.kpis.tareasPublicadas}/{model.kpis.tareasHechas}
              </strong>
              <span>publicadas / hechas</span>
            </div>
            <div>
              <strong>{model.tareas.filter((t) => !t.visibleCliente).length + model.historias.filter((h) => !h.visibleCliente).length}</strong>
              <span>elementos ocultos</span>
            </div>
            <div>
              <strong>{internas}</strong>
              <span>notas internas</span>
            </div>
          </div>
        }
      >
        El estado técnico y su evidencia son una sugerencia interna. El equipo Ecopetrol solo ve como entregado lo que un editor o un
        administrador aprueba con «Aprobar y publicar» (fecha y nota de entrega). Todo queda en la bitácora con rol, fecha y valor anterior → nuevo.
      </PageHeading>

      <div className="tabs" role="tablist">
        {VISTAS.filter(v => session.isAdmin || v.id !== "configuracion").map((v) => (
          <Link key={v.id} href={`/editor?vista=${v.id}`} className={`tab ${vista === v.id ? "is-on" : ""}`} role="tab" aria-selected={vista === v.id}>
            {v.label}
          </Link>
        ))}
      </div>

      {vista === "configuracion" && session.isAdmin && <MilestoneConfiguration model={model} selected={ms} />}

      {(vista === "tareas" || vista === "hu") && (
        <div className="toolbar is-stacked">
          {vista === "tareas" && <AreaFilter areas={model.areas} actual={areaId} base={base({ area: null })} />}
          <nav className="filter-chips" aria-label="Filtrar por estado">
            <Link href={base({ estado: null })} className={`fchip ${estado ? "" : "is-on"}`}>
              Todos los estados
            </Link>
            {(vista === "tareas" ? ESTADOS_TAREA : ESTADOS_HISTORIA).map((e) => (
              <Link key={e} href={base({ estado: e })} className={`fchip ${estado === e ? "is-on" : ""}`}>
                {e}
              </Link>
            ))}
          </nav>
          <nav className="filter-chips" aria-label="Filtrar por milestone">
            <Link href={base({ ms: null })} className={`fchip ${ms ? "" : "is-on"}`}>
              Todos los milestones
            </Link>
            {model.milestones.map((m) => (
              <Link key={m.id} href={base({ ms: m.id })} className={`fchip ${ms === m.id ? "is-on" : ""}`}>
                {m.id}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {vista === "tareas" && (
        <Card className="card-flush">
          <table className="table editor-table" data-testid="editor-tareas">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Área</th>
                <th>Fin</th>
                <th>Estado técnico</th>
                <th>Cambiar estado</th>
                <th>Aprobar y publicar</th>
                <th>Visible</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id} data-testid={`row-${t.id}`}>
                  <td>
                    <Link href={`/tareas/${t.id}`} className="ms-cell">
                      <b>{t.id}</b>
                      <span>{t.nombre}</span>
                    </Link>
                    {t.rutaCritica && <CriticalBadge />}
                  </td>
                  <td className="nowrap">
                    <AreaDot areaId={t.areaId} /> {model.areaById.get(t.areaId)?.nombre}
                  </td>
                  <td className={`nowrap ${t.estado !== "Hecha" && t.fechaFin && t.fechaFin < model.hoy ? "meta-late" : ""}`}>{fmtCorta(t.fechaFin)}</td>
                  <td>
                    <StatusBadge estado={t.estado} size="sm" />
                  </td>
                  <td>
                    <EstadoControl tipo="tarea" id={t.id} estado={t.estado} estados={ESTADOS_TAREA} evidencia={t.evidencia} compact />
                  </td>
                  <td>
                    <PublicarControl id={t.id} estado={t.estado} publicada={t.publicadoCliente} fecha={t.fechaPublicacion} nota={t.notaPublicacion} />
                  </td>
                  <td>
                    <VisibilidadToggle tipo="tarea" id={t.id} visible={t.visibleCliente} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tareas.length === 0 && <Empty>No hay tareas con esos filtros.</Empty>}
        </Card>
      )}

      {vista === "hu" && (
        <Card className="card-flush">
          <table className="table editor-table">
            <thead>
              <tr>
                <th>Historia</th>
                <th className="num">SP</th>
                <th>Demo</th>
                <th>Estado actual</th>
                <th>Cambiar estado</th>
                <th>Visible</th>
              </tr>
            </thead>
            <tbody>
              {hus.map((h) => (
                <tr key={h.id}>
                  <td>
                    <Link href={`/historias/${h.id}`} className="ms-cell">
                      <b>{h.id}</b>
                      <span>{h.nombre}</span>
                    </Link>
                  </td>
                  <td className="num">{h.sp ?? 0}</td>
                  <td className="nowrap">{fmtCorta(model.weeklyPorHu.get(h.id))}</td>
                  <td>
                    <StatusBadge estado={h.estado} size="sm" />
                  </td>
                  <td>
                    <EstadoControl tipo="historia" id={h.id} estado={h.estado} estados={ESTADOS_HISTORIA} evidencia={h.evidencia} compact />
                  </td>
                  <td>
                    <VisibilidadToggle tipo="historia" id={h.id} visible={h.visibleCliente} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hus.length === 0 && <Empty>No hay historias con esos filtros.</Empty>}
        </Card>
      )}

      {vista === "milestones" && (
        <Card className="card-flush">
          <table className="table editor-table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Fecha</th>
                <th>Sugerido</th>
                <th>Estado (automático o manual)</th>
                <th>Visible</th>
              </tr>
            </thead>
            <tbody>
              {model.milestones.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/milestones/${m.id}`} className="ms-cell">
                      <b style={{ color: colorLinea(m.lineaId) }}>{m.id}</b>
                      <span>{m.nombre}</span>
                    </Link>
                  </td>
                  <td className="nowrap">{fmtCorta(m.fechaObjetivo)}</td>
                  <td>
                    <StatusBadge estado={m.estadoSugerido} size="sm" />
                  </td>
                  <td>
                    <EstadoControl tipo="milestone" id={m.id} estado={m.override ? m.estado : "Automático"} estados={["Automático", ...ESTADOS_MILESTONE]} compact />
                  </td>
                  <td>
                    <VisibilidadToggle tipo="milestone" id={m.id} visible={m.visibleCliente} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {vista === "visibilidad" && (
        <div className="grid-2">
          <Card kicker="REGLAS" title="Qué ve el equipo Ecopetrol">
            {session.isAdmin ? <>
            <ConfigToggle
              clave="resumen_area_ecopetrol"
              activo={model.config.resumen_area_ecopetrol === "1"}
              titulo="Resumen planificado vs. real por área"
              descripcion="Muestra al equipo Ecopetrol la comparación por área (dashboard y vista de áreas)."
            />
            <ConfigToggle
              clave="riesgos_ecopetrol"
              activo={model.config.riesgos_ecopetrol === "1"}
              titulo="Riesgos no internos"
              descripcion="Los riesgos marcados como internos nunca se muestran; esto oculta también los demás."
            />
            <ConfigToggle
              clave="progreso_incluye_lista_demo"
              activo={model.config.progreso_incluye_lista_demo === "1"}
              titulo="Contar «Lista para demo» como completa"
              descripcion="Si está apagado, el avance por SP solo cuenta HU aceptadas por Ecopetrol."
            />
            </> : <p>Solo el administrador modifica las reglas de visualización y cálculo.</p>}
          </Card>
          <Card kicker="RIESGOS" title="Visibilidad de riesgos">
            <ul className="risk-list">
              {model.riesgos.map((r) => (
                <li key={r.id} className={r.interno ? "is-internal" : ""}>
                  <div className="risk-head">
                    <b>{r.id}</b>
                    <span className="muted small">{r.fuente}</span>
                    <VisibilidadToggle tipo="riesgo" id={r.id} visible={!r.interno} etiqueta={r.interno ? "Interno" : "Visible para Ecopetrol"} />
                  </div>
                  <p>{r.descripcion}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card kicker="NOTAS" title="Notas registradas" className="span-wide">
            {model.notas.length === 0 ? (
              <Empty>Aún no hay notas.</Empty>
            ) : (
              <ul className="nota-list">
                {model.notas.map((n) => (
                  <li key={n.id} className={`nota ${n.visibleCliente ? "" : "is-internal"}`}>
                    <p>{n.texto}</p>
                    <div className="nota-meta">
                      <Link href={`/${n.entidadTipo === "tarea" ? "tareas" : n.entidadTipo === "historia" ? "historias" : "milestones"}/${n.entidadId}`}>{n.entidadId}</Link>
                      <VisibilidadToggle tipo="nota" id={n.id} visible={n.visibleCliente} etiqueta={n.visibleCliente ? "Visible para Ecopetrol" : "Nota interna"} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}