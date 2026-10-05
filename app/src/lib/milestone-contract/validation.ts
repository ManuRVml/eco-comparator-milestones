import { HttpError } from "../http-error";
export function numeroOpcional(body: Record<string, unknown>, key: string, min = -1e12, max = 1e12, integer = false): number | null {
  const value = body[key];
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || integer && !Number.isInteger(value)) throw new HttpError(422, `${key}: número válido entre ${min} y ${max}${integer ? " (entero)" : ""}`);
  return value;
}
export function booleano(body: Record<string, unknown>, key: string): boolean {
  if (typeof body[key] !== "boolean") throw new HttpError(422, `${key}: indica verdadero o falso`);
  return body[key];
}
