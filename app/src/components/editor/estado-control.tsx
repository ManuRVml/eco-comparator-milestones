"use client";

import { useState } from "react";
import { usePost } from "./use-post";

type Tipo = "tarea" | "historia" | "milestone";

const REQUIERE: Record<Tipo, string | null> = { tarea: "Hecha", historia: "Aceptada", milestone: null };

export function EstadoControl({
  tipo,
  id,
  estado,
  estados,
  evidencia,
  compact = false,
}: {
  tipo: Tipo;
  id: string;
  estado: string;
  estados: readonly string[];
  evidencia?: string | null;
  compact?: boolean;
}) {
  const [valor, setValor] = useState(estado);
  const [texto, setTexto] = useState("");
  const { send, error, busy } = usePost("/api/editor/estado");
  const pideEvidencia = REQUIERE[tipo] !== null && valor === REQUIERE[tipo] && valor !== estado;
  const cambiado = valor !== estado;

  async function guardar() {
    const ok = await send({ tipo, id, estado: valor, evidencia: pideEvidencia ? texto : undefined });
    if (ok) setTexto("");
  }

  return (
    <div className={`estado-control ${compact ? "is-compact" : ""}`} data-testid={`estado-${id}`}>
      <div className="estado-control-row">
        <label className="sr-only" htmlFor={`estado-${tipo}-${id}`}>
          Estado de {id}
        </label>
        <select id={`estado-${tipo}-${id}`} value={valor} onChange={(e) => setValor(e.target.value)} disabled={busy} className="select">
          {!estados.includes(estado) && <option value={estado}>{estado}</option>}
          {estados.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        {cambiado && !pideEvidencia && (
          <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={busy}>
            {busy ? "Guardando…" : "Guardar"}
          </button>
        )}
        {cambiado && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setValor(estado)} disabled={busy}>
            Cancelar
          </button>
        )}
      </div>
      {pideEvidencia && (
        <div className="evidencia-box">
          <label htmlFor={`evid-${tipo}-${id}`}>Evidencia requerida para «{valor}»</label>
          <textarea
            id={`evid-${tipo}-${id}`}
            rows={2}
            value={texto}
            placeholder={evidencia ? `Actual: ${evidencia.slice(0, 80)}…` : "Pantalla, endpoint, job, commit o enlace que lo demuestra"}
            onChange={(e) => setTexto(e.target.value)}
            disabled={busy}
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={busy || texto.trim().length < 5}>
            {busy ? "Guardando…" : `Marcar como ${valor}`}
          </button>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}