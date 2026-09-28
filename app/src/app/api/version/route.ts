import { NextResponse } from "next/server";
import { getRole } from "@/lib/auth";
import { versionDatos } from "@/lib/mutations";

/** Polling ligero: la vista del cliente refresca cuando cambia la versión (máximo id de bitácora). */
export async function GET() {
  if (!(await getRole())) return NextResponse.json({ error: "Sesión requerida" }, { status: 401 });
  return NextResponse.json({ v: await versionDatos() }, { headers: { "Cache-Control": "no-store" } });
}

// Toca la base de datos: runtime Node.js (nunca edge).
export const runtime = "nodejs";
