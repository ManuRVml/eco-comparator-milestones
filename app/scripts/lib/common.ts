import { copyFileSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb } from "../../src/db/client";

/** Carga .env.local (si existe) para scripts ejecutados fuera de Next. */
export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
      try {
        process.loadEnvFile(path);
      } catch {
        /* archivo ilegible: se usan los valores por defecto */
      }
    }
  }
}

/**
 * DATABASE_AUTH_TOKEN_FILE: ruta a un archivo con el token de la base remota (se lee aquí, nunca se imprime).
 * Evita pegar el token en la línea de comandos o en archivos del repositorio.
 */
export function cargarTokenDesdeArchivo() {
  const f = process.env.DATABASE_AUTH_TOKEN_FILE;
  if (!process.env.DATABASE_AUTH_TOKEN && f) process.env.DATABASE_AUTH_TOKEN = readFileSync(f, "utf8").trim();
}

/** Abre la base y aplica las migraciones pendientes de ./drizzle. */
export async function openDb() {
  loadEnv();
  cargarTokenDesdeArchivo();
  const { client, db } = createDb();
  await migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
  return { client, db };
}

/** Argumentos posicionales sin el separador "--" que agrega pnpm. */
export function cliArgs() {
  return process.argv.slice(2).filter((a) => a !== "--");
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Parser CSV RFC 4180 (comillas, comillas escapadas y saltos de línea dentro de celdas). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...data] = rows;
  if (!header) return [];
  return data
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}
export const LIVE_DB_FILE = "data/seguimiento.db";
export const TEST_DB_FILE = "data/seguimiento.test.db";

/**
 * Copia fresca de la base viva a data/seguimiento.test.db y apunta DATABASE_URL a la copia.
 * Las verificaciones que escriben (verify:*, check:*) usan siempre esta copia: nunca tocan data/seguimiento.db.
 */
export function useTestDbCopy() {
  const src = resolve(process.cwd(), LIVE_DB_FILE);
  const dst = resolve(process.cwd(), TEST_DB_FILE);
  for (const ext of ["", "-journal", "-wal", "-shm"]) if (existsSync(dst + ext)) unlinkSync(dst + ext);
  copyFileSync(src, dst);
  process.env.DATABASE_URL = `file:./${TEST_DB_FILE}`;
  console.log(`Base de pruebas: ${TEST_DB_FILE} (copia fresca de ${LIVE_DB_FILE}; la base viva no se modifica)`);
}