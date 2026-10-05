import "server-only";

import { NextResponse } from "next/server";
import { getRole } from "@/lib/auth";
import type { UserRole } from "@/lib/auth-constants";
import { HttpError } from "@/lib/http-error";

const noStore = { "Cache-Control": "no-store" };

/**
 * Envoltorio de los endpoints de edición: 401 sin sesión, 403 para el rol de consulta (y para el editor si soloAdmin),
 * 415 si el cuerpo no es JSON (evita envíos de formularios cruzados), y errores de dominio como JSON.
 */
export function editorRoute(fn: (rol: UserRole, body: Record<string, unknown>) => Promise<unknown>, opts: { soloAdmin?: boolean } = {}) {
  return async function POST(request: Request) {
    const rol = await getRole();
    if (!rol) return NextResponse.json({ error: "Sesión requerida" }, { status: 401, headers: noStore });
    if (rol !== "editor" && rol !== "admin") {
      return NextResponse.json({ error: "Tu rol es de solo lectura" }, { status: 403, headers: noStore });
    }
    if (opts.soloAdmin && rol !== "admin") {
      return NextResponse.json({ error: "Solo el administrador verifica y publica" }, { status: 403, headers: noStore });
    }
    if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
      return NextResponse.json({ error: "Se esperaba JSON" }, { status: 415, headers: noStore });
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers: noStore });
    }
    if (!body || typeof body !== "object") return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers: noStore });
    try {
      const result = await fn(rol, body as Record<string, unknown>);
      return NextResponse.json({ ok: true, ...(result as object) }, { headers: noStore });
    } catch (err) {
      if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status, headers: noStore });
      console.error("Error en endpoint de edición:", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: "Error interno" }, { status: 500, headers: noStore });
    }
  };
}
