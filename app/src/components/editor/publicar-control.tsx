"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { usePost } from "./use-post";

const VENTANA_DESHACER_MS = 8000;

// Estado que debe sobrevivir al remount: al publicar, la fila pasa de la tabla «Por verificar» a «Visibles» y React la
// desmonta. El aviso «Deshacer» (hasta cuándo) y el foco tras retirar viven aquí, no solo en el componente anterior.
const ventanasDeshacer = new Map<string, number>();
const enfocarRaiz = new Set<string>();

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
  const clave = `${tipo}:${id}`;
  const [expiraDeshacer, setExpiraDeshacer] = useState(() => {
    const expira = ventanasDeshacer.get(clave) ?? 0;
    if (expira <= Date.now()) {
      ventanasDeshacer.delete(clave);
      return 0;
    }
    return expira;
  });
  const deshacible = expiraDeshacer > 0;
  const { send, error, busy } = usePost("/api/editor/publicacion");
  const raizRef = useRef<HTMLDivElement>(null);
  const retirarRef = useRef<HTMLButtonElement>(null);
  // Tras cancelar el diálogo de retiro, el foco vuelve al botón «Retirar publicación» (mismo componente).
  const devolverFoco = useRef(false);

  useEffect(() => {
    if (expiraDeshacer === 0) return;
    const timer = setTimeout(() => {
      if (ventanasDeshacer.get(clave) === expiraDeshacer) ventanasDeshacer.delete(clave);
      setExpiraDeshacer(0);
    }, Math.max(0, expiraDeshacer - Date.now()));
    return () => clearTimeout(timer);
  }, [clave, expiraDeshacer]);

  // Si la publicación cambia por otra vía (Deshacer, otro editor), el diálogo de retiro no debe quedar abierto.
  const [publicadaPrevia, setPublicadaPrevia] = useState(publicada);
  if (publicada !== publicadaPrevia) {
    setPublicadaPrevia(publicada);
    if (!publicada) setConfirmarRetiro(false);
  }

  useEffect(() => {
    if (!devolverFoco.current || confirmarRetiro || !publicada) return;
    retirarRef.current?.focus();
    devolverFoco.current = false;
  }, [confirmarRetiro, publicada]);

  // Tras retirar, la fila vuelve a «Por verificar» (otro componente): el foco va a la raíz estable.
  useEffect(() => {
    // Una entrada que sigue publicada tras montar es obsoleta: el retiro no llegó a reflejarse.
    if (publicada) enfocarRaiz.delete(clave);
    else if (enfocarRaiz.delete(clave)) raizRef.current?.focus();
  }, [clave, publicada]);

  function mostrarDeshacer() {
    const expira = Date.now() + VENTANA_DESHACER_MS;
    ventanasDeshacer.set(clave, expira);
    setExpiraDeshacer(expira);
  }

  function ocultarDeshacer() {
    ventanasDeshacer.delete(clave);
    setExpiraDeshacer(0);
  }

  function cancelarRetiro() {
    devolverFoco.current = true;
    setConfirmarRetiro(false);
  }

  // Diálogo modal: Tab y Shift+Tab ciclan dentro de sus botones; Escape cancela.
  function atraparFoco(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      cancelarRetiro();
      return;
    }
    if (e.key !== "Tab") return;
    e.preventDefault();
    const botones = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
    if (botones.length === 0) return;
    const i = botones.indexOf(document.activeElement as HTMLButtonElement);
    const siguiente = e.shiftKey ? (i <= 0 ? botones.length - 1 : i - 1) : i === -1 || i === botones.length - 1 ? 0 : i + 1;
    botones[siguiente].focus();
  }

  if (publicada) {
    return (
      <div className="pub-control" data-testid={`pub-${id}`} ref={raizRef} tabIndex={-1}>
        <span className="chip tone-green" title={nota ?? ""}>
          Publicada {fecha ? `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}` : ""}
        </span>
        {!confirmarRetiro ? (
          <button
            ref={retirarRef}
            type="button"
            className="btn btn-ghost btn-sm"
            data-testid="publish-control-retract"
            onClick={() => setConfirmarRetiro(true)}
            disabled={busy}
          >
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
            onKeyDown={atraparFoco}
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
                  if (!(await send({ tipo, id, publicar: false }))) return;
                  enfocarRaiz.add(clave);
                  ocultarDeshacer();
                  setConfirmarRetiro(false);
                }}
              >
                {busy ? "…" : "Sí, retirar"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                data-testid="publish-confirm-cancel"
                autoFocus
                onClick={cancelarRetiro}
                disabled={busy}
              >
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
                if (await send({ tipo, id, publicar: false })) {
                  ocultarDeshacer();
                  setConfirmarRetiro(false);
                }
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
    <div className="pub-control" data-testid={`pub-${id}`} ref={raizRef} tabIndex={-1}>
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
                  mostrarDeshacer();
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
