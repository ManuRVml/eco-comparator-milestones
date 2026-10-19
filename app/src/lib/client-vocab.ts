import { VOCABULARY_TERMS as terms } from "./client-vocab.mjs";

/** Same list check-copy.mjs imports. Re-exported here so server code does not duplicate it. */
export const VOCABULARY_TERMS: { term: string; regex: RegExp }[] = terms;

export function terminoProhibido(texto: string): string | null {
  for (const { term, regex } of VOCABULARY_TERMS) {
    if (new RegExp(regex.source, regex.flags).test(texto)) return term;
  }
  return null;
}

/** True when an externo title or detail already stored would be rejected. */
export function textoExternoNoApto(titulo: string, detalle: string | null): boolean {
  return rechazoTextoExterno("externo", titulo, null) != null
    || rechazoTextoExterno("externo", detalle ?? "", null) != null;
}

export function filtrarVisibles<T extends { lado: string; titulo: string; detalle: string | null }>(
  rows: readonly T[],
  canEdit: boolean,
): T[] {
  if (canEdit) return [...rows];
  return rows.filter((row) => row.lado !== "externo" || !textoExternoNoApto(row.titulo, row.detalle));
}

/** Null when the text may be stored. Interno is not checked. */
export function rechazoTextoExterno(
  lado: string,
  titulo: string,
  detalle: string | null,
): { status: 400; message: string } | null {
  if (lado !== "externo") return null;
  const termino = terminoProhibido(titulo) ?? (detalle ? terminoProhibido(detalle) : null);
  if (!termino) return null;
  return {
    status: 400,
    message: `El texto visible para Equipo Ecopetrol no puede incluir «${termino}».`,
  };
}
