"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const INTERVALO_MS = 8000;

/**
 * Polling corto a /api/version: si otro usuario (p. ej. el editor) registró un cambio,
 * refresca los Server Components sin recargar la página.
 */
export function LiveSync() {
  const router = useRouter();
  const version = useRef<string | null>(null);
  const [ultima, setUltima] = useState<number | null>(null);
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    async function consultar() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const { v } = (await res.json()) as { v: string };
        if (!vivo) return;
        if (version.current !== null && version.current !== v) router.refresh();
        version.current = v;
        const t = Date.now();
        setUltima(t);
        setAhora(t);
      } catch {
        /* sin red: se reintenta en el siguiente ciclo */
      }
    }
    consultar();
    const id = window.setInterval(consultar, INTERVALO_MS);
    const tick = window.setInterval(() => setAhora(Date.now()), 1000);
    document.addEventListener("visibilitychange", consultar);
    return () => {
      vivo = false;
      window.clearInterval(id);
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", consultar);
    };
  }, [router]);

  const seg = ultima && ahora ? Math.max(0, Math.round((ahora - ultima) / 1000)) : null;
  return (
    <span className="live-pill" title="La vista se actualiza sola cuando hay cambios">
      <span className="live-dot" />
      En vivo{seg !== null ? <span className="live-age"> · hace {seg} s</span> : null}
    </span>
  );
}