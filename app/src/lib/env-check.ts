/**
 * Validación de entorno para producción (URL pública). Sin dependencias de Next: la usan next.config.ts
 * (arranque de `next start` y build en Vercel), instrumentation.ts (arranque en Vercel) y el cliente de base de datos.
 *
 * LOCAL_DEMO=1 permite, SOLO fuera de Vercel, arrancar en modo producción con los PIN de demostración y la base
 * SQLite local (file:). Es la bandera explícita de las pruebas locales; en Vercel se ignora.
 */

const PINES_DEMO = new Set(["1111", "2222", "3333"]);
const SECRETO_EJEMPLO = "local-example-secret-change-this-before-deploying-2026";

export type Env = Record<string, string | undefined>;

export function esDemoLocal(env: Env = process.env) {
  return env.LOCAL_DEMO === "1" && !env.VERCEL;
}

/** Problemas de configuración que impiden servir en producción (lista vacía = OK). */
export function problemasDeEntorno(env: Env = process.env): string[] {
  const p: string[] = [];
  const demo = esDemoLocal(env);
  const secret = env.SESSION_SECRET;
  if (!secret) p.push("SESSION_SECRET no está definido");
  else if (secret.length < 32) p.push("SESSION_SECRET debe tener al menos 32 caracteres");
  else if (secret === SECRETO_EJEMPLO && !demo) p.push("SESSION_SECRET es el valor de ejemplo de .env.example");

  const pines: [string, string | undefined][] = [
    ["PIN_ECOPETROL (o PIN_CLIENTE)", env.PIN_ECOPETROL ?? env.PIN_CLIENTE],
    ["PIN_EDITOR", env.PIN_EDITOR],
    ["PIN_ADMIN", env.PIN_ADMIN],
  ];
  for (const [nombre, valor] of pines) {
    if (!valor) p.push(`${nombre} no está definido`);
    else if (!demo && PINES_DEMO.has(valor)) p.push(`${nombre} usa un PIN de demostración (1111/2222/3333)`);
    else if (!demo && valor.length < 6) p.push(`${nombre} debe tener al menos 6 caracteres en producción`);
  }
  const valores = pines.map(([, v]) => v).filter(Boolean);
  if (new Set(valores).size !== valores.length) p.push("Los PIN de los tres roles deben ser distintos");

  const url = env.DATABASE_URL;
  if (!url) p.push("DATABASE_URL no está definido");
  else if (url.startsWith("file:") && !demo) p.push("DATABASE_URL apunta a un archivo local (file:); en producción use libsql:// o https://");
  else if (!url.startsWith("file:") && !env.DATABASE_AUTH_TOKEN) p.push("DATABASE_AUTH_TOKEN no está definido para la base remota");
  return p;
}

/** Lanza un error claro si el entorno no sirve para producción. */
export function exigirEntornoDeProduccion(contexto: string, env: Env = process.env) {
  const p = problemasDeEntorno(env);
  if (p.length) {
    throw new Error(`[${contexto}] Configuración insegura o incompleta; no se arranca:\n  - ${p.join("\n  - ")}`);
  }
}