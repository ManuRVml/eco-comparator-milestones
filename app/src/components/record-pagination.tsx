import Link from "next/link";

export function RecordPagination({ page, pageCount, total, href }: { page: number; pageCount: number; total: number; href: (page: number) => string }) {
  if (pageCount <= 1) return <p className="muted small record-count">{total} registros</p>;
  return <nav className="record-pagination" aria-label="Páginas de resultados">
    <span aria-live="polite">Página {page} de {pageCount} · {total} registros</span>
    {page > 1 ? <Link className="btn btn-ghost" href={href(page - 1)}>Anterior</Link> : <span aria-disabled="true">Anterior</span>}
    {page < pageCount ? <Link className="btn btn-ghost" href={href(page + 1)}>Siguiente</Link> : <span aria-disabled="true">Siguiente</span>}
  </nav>;
}
