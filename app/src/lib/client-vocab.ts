import { VOCABULARY_TERMS as terms } from "./client-vocab.mjs";

/** Same list check-copy.mjs imports. Re-exported here so server code does not duplicate it. */
export const VOCABULARY_TERMS: { term: string; regex: RegExp }[] = terms;

export function terminoProhibido(texto: string): string | null {
  for (const { term, regex } of VOCABULARY_TERMS) {
    if (new RegExp(regex.source, regex.flags).test(texto)) return term;
  }
  return null;
}

const CLIENTE = /cliente/i;

function terminoVisible(texto: string): string | null {
  return terminoProhibido(texto) ?? (CLIENTE.test(texto) ? "cliente" : null);
}

/** True when stored externo text would be rejected. check-copy keeps its own cliente scan. */
export function textoExternoNoApto(titulo: string, detalle: string | null, responsable: string | null = null): boolean {
  return rechazoTextoExterno("externo", titulo, detalle, responsable) != null;
}

/** Whether an objective is safe to show in the read-only cycle tooltip. */
export function puedeMostrarObjetivoCiclo(objetivo: string): boolean {
  return !textoExternoNoApto("", objetivo);
}

export function filtrarVisibles<T extends { lado: string; titulo: string; detalle: string | null; responsable?: string | null }>(
  rows: readonly T[],
  canEdit: boolean,
): T[] {
  if (canEdit) return [...rows];
  return rows.filter((row) => row.lado !== "externo" || !textoExternoNoApto(row.titulo, row.detalle, row.responsable ?? null));
}

/** Null when the text may be stored. Interno is not checked. */
export function rechazoTextoExterno(
  lado: string,
  titulo: string,
  detalle: string | null,
  responsable: string | null = null,
): { status: 400; message: string } | null {
  if (lado !== "externo") return null;
  const termino = terminoVisible(titulo)
    ?? (detalle ? terminoVisible(detalle) : null)
    ?? (responsable ? terminoVisible(responsable) : null);
  if (!termino) return null;
  return {
    status: 400,
    message: `El texto visible para Equipo Ecopetrol no puede incluir «${termino}».`,
  };
}
