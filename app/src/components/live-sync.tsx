"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const INTERVALO_MS = 8000;
const TIMEOUT_MS = 6000;
const TICK_MS = 1000;
const FALLAS_PARA_ERROR = 2;
const TIEMPO_MAXIMO_S = 30;

type Estado = "connecting" | "live" | "stale" | "error";

const ETIQUETA: Record<Estado, string> = {
  connecting: "Conectando…",
  live: "En vivo",
  stale: "Sin actualizar",
  error: "Sin conexión",
};

/**
 * Polling corto a /api/version: si otro usuario (p. ej. el editor) registró un cambio,
 * refresca los Server Components sin recargar la página.
 */
export function LiveSync() {
  const router = useRouter();
  const version = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [ultima, setUltima] = useState<number | null>(null);
  const [ahora, setAhora] = useState<number | null>(null);
  const [fallos, setFallos] = useState(0);

  const consultar = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    const limite = window.setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch("/api/version", { cache: "no-store", signal: ctl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { v } = (await res.json()) as { v: string };
      if (version.current !== null && version.current !== v) router.refresh();
      version.current = v;
      const t = Date.now();
      setUltima(t);
      setAhora(t);
      setFallos(0);
    } catch {
      // Una consulta reemplazada o cancelada al desmontar no cuenta como falla.
      if (ctl === abortRef.current) setFallos((c) => c + 1);
    } finally {
      window.clearTimeout(limite);
    }
  }, [router]);

  useEffect(() => {
    const arranque = window.setTimeout(consultar, 0);
    const tick = window.setInterval(() => setAhora(Date.now()), TICK_MS);
    const intervalo = window.setInterval(consultar, INTERVALO_MS);
    document.addEventListener("visibilitychange", consultar);
    return () => {
      window.clearTimeout(arranque);
      window.clearInterval(tick);
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", consultar);
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [consultar]);

  const seg = ultima !== null && ahora !== null ? Math.max(0, Math.round((ahora - ultima) / 1000)) : null;
  const estado: Estado =
    fallos >= FALLAS_PARA_ERROR ? "error" : fallos > 0 || (seg ?? 0) > TIEMPO_MAXIMO_S ? "stale" : ultima === null ? "connecting" : "live";
  const alerta = estado === "stale" || estado === "error";

  return (
    <span
      className={`live-pill${alerta ? " tone-amber" : ""}`}
      data-testid="live-sync"
      data-state={estado}
      title={alerta ? "La vista no se está actualizando automáticamente" : estado === "connecting" ? "Esperando la primera actualización" : "La vista se actualiza sola cuando hay cambios"}
    >
      {estado === "live" && <span className="live-dot" />}
      {ETIQUETA[estado]}
      {seg !== null ? <span className="live-age"> · hace {seg} s</span> : null}
      <button type="button" data-testid="live-sync-refresh" className="live-refresh" hidden={!alerta} onClick={() => { router.refresh(); consultar(); }}>
        Actualizar
      </button>
    </span>
  );
}
