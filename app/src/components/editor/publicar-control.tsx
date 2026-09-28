"use client";

import { useState } from "react";
import { usePost } from "./use-post";

function hoyLocal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

/**
 * «Aprobar y publicar» / «Retirar publicación» de una tarea o de un milestone (capa oficial). Editor o admin:
 * fecha en que se completó (no futura) y nota de entrega para el equipo Ecopetrol. Nunca se muestra a roles de consulta.
 */
export function PublicarControl({
  tipo = "tarea",
  id,
  estado,
  publicada,
  fecha,
  nota,
}: {
  tipo?: "tarea" | "milestone";
  id: string;
  estado: string;
  publicada: boolean;
  fecha: string | null;
  nota: string | null;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [dia, setDia] = useState("");
  const { send, error, busy } = usePost("/api/editor/publicacion");

  if (publicada) {
    return (
      <div className="pub-control" data-testid={`pub-${id}`}>
        <span className="chip tone-green" title={nota ?? ""}>
          Publicada {fecha ? `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}` : ""}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => send({ tipo, id, publicar: false })} disabled={busy}>
          {busy ? "…" : "Retirar publicación"}
        </button>
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
  if (tipo === "tarea" && estado !== "Hecha") {
    return (
      <span className="pub-control muted small" data-testid={`pub-${id}`} title="Solo se publican tareas Hecha">
        No publicada
      </span>
    );
  }
  const max = hoyLocal();
  return (
    <div className="pub-control" data-testid={`pub-${id}`}>
      {!abierto ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm pub-btn"
          onClick={() => {
            setDia(max);
            setAbierto(true);
          }}
        >
          Aprobar y publicar
        </button>
      ) : (
        <div className="evidencia-box pub-box">
          <label htmlFor={`pub-nota-${id}`}>Nota de entrega para el equipo Ecopetrol</label>
          <input id={`pub-nota-${id}`} className="pub-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Demostrado en weekly 15/10" maxLength={300} disabled={busy} />
          <label htmlFor={`pub-fecha-${id}`}>Completada el</label>
          <input id={`pub-fecha-${id}`} type="date" className="pub-input" value={dia} max={max} onChange={(e) => setDia(e.target.value)} disabled={busy} />
          <div className="pub-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy || texto.trim().length < 5 || !dia}
              onClick={async () => {
                if (await send({ tipo, id, publicar: true, nota: texto, fecha: dia })) setAbierto(false);
              }}
            >
              {busy ? "Publicando…" : "Publicar"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAbierto(false)} disabled={busy}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}