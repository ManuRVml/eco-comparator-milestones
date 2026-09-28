import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { esDemoLocal } from "../lib/env-check";
import * as schema from "./schema";

export const DEFAULT_DATABASE_URL = "file:./data/seguimiento.db";

/**
 * DATABASE_URL: `file:./data/seguimiento.db` en desarrollo (por defecto) o `libsql://…` / `https://…` para el
 * servidor libSQL remoto (sqld en Fusion). `libsql://` se usa sobre HTTPS (hrana over HTTP), que atraviesa Cloudflare.
 */
export function databaseUrl() {
  return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

function urlCliente(url: string) {
  return url.startsWith("libsql://") ? `https://${url.slice("libsql://".length)}` : url;
}

/** En producción (fuera del build) no se admite una base de archivo local salvo LOCAL_DEMO=1 fuera de Vercel. */
function comprobarProduccion(url: string) {
  const enProduccion = process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";
  if (!enProduccion || !process.env.NEXT_RUNTIME) return;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL es obligatorio en producción (libsql://… del servidor libSQL).");
  if (url.startsWith("file:") && !esDemoLocal()) {
    throw new Error("DATABASE_URL apunta a un archivo local (file:): en producción el disco es efímero; use el servidor libSQL remoto.");
  }
}

export function createDb(url = databaseUrl(), authToken = process.env.DATABASE_AUTH_TOKEN) {
  comprobarProduccion(url);
  if (url.startsWith("file:")) mkdirSync(dirname(resolve(url.slice("file:".length))), { recursive: true });
  const client = createClient({ url: urlCliente(url), ...(authToken && !url.startsWith("file:") ? { authToken } : {}) });
  return { client, db: drizzle(client, { schema }) };
}

export type Db = ReturnType<typeof createDb>["db"];

const globalForDb = globalThis as unknown as { __segDb?: Db };
export const db: Db = globalForDb.__segDb ?? (globalForDb.__segDb = createDb().db);