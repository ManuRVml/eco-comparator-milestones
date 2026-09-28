"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** POST JSON a un endpoint de edición y refresco de la vista al terminar. */
export function usePost(url: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pending, startTransition] = useTransition();

  async function send(body: unknown): Promise<boolean> {
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Error ${res.status}`);
        return false;
      }
      startTransition(() => router.refresh());
      return true;
    } catch {
      setError("No se pudo conectar con el servidor");
      return false;
    } finally {
      setEnviando(false);
    }
  }

  return { send, error, busy: enviando || pending };
}