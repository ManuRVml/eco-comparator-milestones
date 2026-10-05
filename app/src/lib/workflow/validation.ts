import { HttpError } from "../http-error";

export function texto(body: Record<string, unknown>, key: string, min = 1, max = 2000): string {
  const v = body[key];
  if (typeof v !== "string" || v.trim().length < min || v.trim().length > max) throw new HttpError(422, `${key}: entre ${min} y ${max} caracteres`);
  return v.trim();
}
export function opcion(body: Record<string, unknown>, key: string, values: readonly string[]): string {
  const v = texto(body, key, 1, 80);
  if (!values.includes(v)) throw new HttpError(422, `${key} no válido`);
  return v;
}
export function fecha(body: Record<string, unknown>, key: string): string {
  const v = texto(body, key, 10, 10);
  const d = new Date(`${v}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== v) throw new HttpError(422, `${key}: fecha inválida`);
  return v;
}
export function entero(body: Record<string, unknown>, key: string, max = 100000): number {
  const v = body[key];
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > max) throw new HttpError(422, `${key}: entero entre 0 y ${max}`);
  return v;
}
