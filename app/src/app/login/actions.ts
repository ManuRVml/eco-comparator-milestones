"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearSession, setSession } from "@/lib/auth";
import type { UserRole } from "@/lib/auth-constants";

export type LoginState = { error: string | null };

const ROLE_PIN_ENV: Record<UserRole, string> = {
  cliente: "PIN_CLIENTE",
  editor: "PIN_EDITOR",
  admin: "PIN_ADMIN",
};

function matchesPin(submitted: string, configured: string) {
  const submittedDigest = createHash("sha256").update(submitted).digest();
  const configuredDigest = createHash("sha256").update(configured).digest();
  return timingSafeEqual(submittedDigest, configuredDigest);
}

/**
 * Freno a la fuerza bruta: cada intento fallido espera ~0,8 s y, tras 5 fallos en 10 min desde la misma IP, se
 * bloquea 10 min. En serverless la memoria es por instancia (freno de mejor esfuerzo); la espera siempre aplica.
 */
const FALLOS = new Map<string, { n: number; desde: number }>();
const VENTANA_MS = 10 * 60 * 1000;
const MAX_FALLOS = 5;

async function claveCliente() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "local").split(",")[0].trim();
}

function bloqueado(ip: string) {
  const f = FALLOS.get(ip);
  if (!f) return false;
  if (Date.now() - f.desde > VENTANA_MS) {
    FALLOS.delete(ip);
    return false;
  }
  return f.n >= MAX_FALLOS;
}

async function registrarFallo(ip: string): Promise<LoginState> {
  const f = FALLOS.get(ip);
  if (!f || Date.now() - f.desde > VENTANA_MS) FALLOS.set(ip, { n: 1, desde: Date.now() });
  else f.n++;
  await new Promise((r) => setTimeout(r, 800));
  return { error: "PIN incorrecto" };
}

export async function loginWithPin(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await claveCliente();
  if (bloqueado(ip)) return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  const rawPin = formData.get("pin");
  const pin = typeof rawPin === "string" ? rawPin : "";
  if (!pin || pin.length > 128) return registrarFallo(ip);

  let matchedRole: UserRole | undefined;
  for (const [role, variable] of Object.entries(ROLE_PIN_ENV) as [UserRole, string][]) {
    // PIN_ECOPETROL es alias de PIN_CLIENTE para el rol de consulta.
    const configured = role === "cliente" ? (process.env.PIN_ECOPETROL ?? process.env[variable]) : process.env[variable];
    if (configured && matchesPin(pin, configured)) matchedRole = role;
  }

  if (!matchedRole) return registrarFallo(ip);
  FALLOS.delete(ip);
  await setSession(matchedRole);
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
