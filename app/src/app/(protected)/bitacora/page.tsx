import Link from "next/link";
import { actor } from "@/components/historial";
import { Card, Empty, PageHeading } from "@/components/ui";
import { getBitacora, requireSession } from "@/lib/data";
import { fmtMarca } from "@/lib/dates";
import { etiquetaCampo } from "@/lib/format";

const TIPOS = [
  { id: null, label: "Todo" },
  { id: "tarea", label: "Tareas" },
  { id: "historia", label: "HU" },
  { id: "milestone", label: "Milestones" },
  { id: "riesgo", label: "Riesgos" },
  { id: "nota", label: "Notas" },
  { id: "config", label: "Ajustes" },
];
const POR_PAGINA = 40;

function href(tipo: string | null, entidadTipo: string, id: string) {
  if (entidadTipo === "tarea") return `/tareas/${id}`;
  if (entidadTipo === "historia") return `/historias/${id}`;
  if (entidadTipo === "milestone") return `/milestones/${id}`;
  return null;
}

export default async function BitacoraPage({ searchParams }: PageProps<"/bitacora">) {
  const session = await requireSession();
  if (!session.canEdit) {
    return (
      <main className="page">
        <PageHeading kicker="ACCESO RESTRINGIDO" title="Solo lectura">
          La bitácora está disponible para el equipo.
        </PageHeading>
      </main>
    );
  }
  const sp = await searchParams;
  const tipo = typeof sp.tipo === "string" && TIPOS.some((t) => t.id === sp.tipo) ? sp.tipo : null;
  const pagina = Math.max(1, Number(sp.p) || 1);
  const { rows, total } = await getBitacora(session, { tipo, limit: POR_PAGINA, offset: (pagina - 1) * POR_PAGINA });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const q = (p: number) => `/bitacora?${tipo ? `tipo=${tipo}&` : ""}p=${p}`;

  return (
    <main className="page" data-testid="bitacora">
      <PageHeading kicker="AUDITORÍA" title="Bitácora de cambios" aside={<span className="count-pill">{total} registros</span>}>
        Quién cambió qué y cuándo, con el valor anterior y el nuevo. Incluye los estados iniciales cargados desde la matriz de evidencia.
      </PageHeading>

      <nav className="filter-chips" aria-label="Filtrar por tipo">
        {TIPOS.map((t) => (
          <Link key={t.label} href={t.id ? `/bitacora?tipo=${t.id}` : "/bitacora"} className={`fchip ${tipo === t.id ? "is-on" : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      <Card className="card-flush">
        {rows.length === 0 ? (
          <Empty>Sin registros.</Empty>
        ) : (
          <table className="table log-table" data-testid="log-table">
            <thead>
              <tr>
                <th>Cuándo</th>
                <th>Quién</th>
                <th>Elemento</th>
                <th>Campo</th>
                <th>Anterior → nuevo</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const link = href(tipo, r.entidadTipo, r.entidadId);
                return (
                  <tr key={r.id} data-testid={`log-${r.id}`}>
                    <td className="nowrap">{fmtMarca(r.creadoEn)}</td>
                    <td className="nowrap">
                      <span className={`who who-${r.origen}`}>{actor(r.actorRol)}</span>
                    </td>
                    <td className="nowrap">
                      <span className="muted small">{r.entidadTipo}</span> {link ? <Link href={link}>{r.entidadId}</Link> : <b>{r.entidadId}</b>}
                    </td>
                    <td>{etiquetaCampo(r.campo)}</td>
                    <td className="change">
                      <span className="old">{r.valorAnterior ?? "—"}</span>
                      <span className="arrow">→</span>
                      <span className="new">{r.valorNuevo ?? "—"}</span>
                    </td>
                    <td className="detail">
                      <span title={r.detalle ?? ""}>{r.detalle ?? ""}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {paginas > 1 && (
        <nav className="pager" aria-label="Páginas">
          {pagina > 1 && <Link href={q(pagina - 1)}>← Anteriores</Link>}
          <span>
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && <Link href={q(pagina + 1)}>Siguientes →</Link>}
        </nav>
      )}
    </main>
  );
}