"use client";

import { useEffect, useState } from "react";
import { usePost } from "./use-post";

const VENTANA_DESHACER_MS = 8000;

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
  const [confirmarRetiro, setConfirmarRetiro] = useState(false);
  const [deshacible, setDeshacible] = useState(false);
  const { send, error, busy } = usePost("/api/editor/publicacion");

  useEffect(() => {
    if (!deshacible) return;
    const timer = setTimeout(() => setDeshacible(false), VENTANA_DESHACER_MS);
    return () => clearTimeout(timer);
  }, [deshacible]);

  if (publicada) {
    return (
      <div className="pub-control" data-testid={`pub-${id}`}>
        <span className="chip tone-green" title={nota ?? ""}>
          Publicada {fecha ? `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}` : ""}
        </span>
        {!confirmarRetiro ? (
          <button type="button" className="btn btn-ghost btn-sm" data-testid="publish-control-retract" onClick={() => setConfirmarRetiro(true)} disabled={busy}>
            Retirar publicación
          </button>
        ) : (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`pub-retirar-titulo-${id}`}
            aria-describedby={`pub-retirar-desc-${id}`}
            className="evidencia-box pub-box"
            data-testid="publish-confirm-dialog"
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirmarRetiro(false);
            }}
          >
            <strong id={`pub-retirar-titulo-${id}`}>¿Retirar la publicación?</strong>
            <p id={`pub-retirar-desc-${id}`} className="small">
              El equipo Ecopetrol dejará de ver esta {tipo === "tarea" ? "tarea" : "milestone"} hasta que la publiques de nuevo.
            </p>
            <div className="pub-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                data-testid="publish-confirm-retract"
                disabled={busy}
                onClick={async () => {
                  if (await send({ tipo, id, publicar: false })) setConfirmarRetiro(false);
                }}
              >
                {busy ? "…" : "Sí, retirar"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" data-testid="publish-confirm-cancel" autoFocus onClick={() => setConfirmarRetiro(false)} disabled={busy}>
                Cancelar
              </button>
            </div>
          </div>
        )}
        {deshacible && (
          <div role="status" className="pub-control" data-testid="publish-undo">
            <span className="small">Publicado · </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={busy}
              onClick={async () => {
                if (await send({ tipo, id, publicar: false })) setDeshacible(false);
              }}
            >
              Deshacer
            </button>
          </div>
        )}
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
          data-testid="publish-control-approve"
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
          {dia && (
            <p className="small" data-testid="publish-control-preview">
              Así lo verá el equipo Ecopetrol: <strong>{texto.trim() || "(sin nota todavía)"}</strong> · completada el {`${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`}
            </p>
          )}
          <div className="pub-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              data-testid="publish-control-publish"
              disabled={busy || texto.trim().length < 5 || !dia}
              onClick={async () => {
                if (await send({ tipo, id, publicar: true, nota: texto, fecha: dia })) {
                  setAbierto(false);
                  setDeshacible(true);
                }
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
