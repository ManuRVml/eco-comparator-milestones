"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Same body as PublicarControl → POST /api/editor/publicacion (cambiarPublicacion). No new server rule. */
const ENDPOINT = "/api/editor/publicacion";
const UNDO_MS = 8000;

export type BatchItem = { id: string; nombre: string };

type Resultado = { id: string; nombre: string; ok: boolean; detalle: string };

function hoyLocal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

function kebabId(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function checkboxes(formId: string) {
  return [...document.querySelectorAll<HTMLInputElement>(`input[name="ids"][form="${formId}"]`)];
}

function idsMarcados(formId: string) {
  return checkboxes(formId).filter((input) => input.checked).map((input) => input.value);
}

async function postPublicacion(body: { tipo: "tarea"; id: string; publicar: boolean; nota?: string; fecha?: string }) {
  try {
    const res = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { error?: string; cambiado?: boolean };
    if (!res.ok) return { ok: false, detalle: data.error ?? `Error ${res.status}` };
    if (data.cambiado === false) return { ok: false, detalle: body.publicar ? "No se publicó: ya estaba publicada" : "No se retiró: ya estaba en la cola" };
    return { ok: true, detalle: body.publicar ? "Publicada" : "Publicación retirada" };
  } catch {
    return { ok: false, detalle: "No se pudo conectar con el servidor" };
  }
}

/**
 * Publica varias tareas Hecha con una sola nota y fecha, una por una, vía la acción existente de publicación.
 * Informa el resultado de cada una y ofrece Deshacer (retirar solo las publicadas) durante 8 s. Las casillas viven en
 * la tabla del Server Component (atributo form); aquí se leen del DOM, sin pasar funciones desde el servidor.
 */
export function BatchPublish({ formId, items }: { formId: string; items: BatchItem[] }) {
  const router = useRouter();
  const notaId = useId();
  const fechaId = useId();
  const tituloId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const undoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusResult = useRef(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [dia, setDia] = useState("");
  const [busy, setBusy] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [undoLeft, setUndoLeft] = useState(0);
  const max = hoyLocal();
  const elegidas = selected.flatMap((id) => items.filter((row) => row.id === id));
  const todas = items.length > 0 && elegidas.length === items.length;
  const puedePublicar = elegidas.length > 0 && texto.trim().length >= 5 && !!dia && dia <= max && !busy;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (undoTimer.current) clearInterval(undoTimer.current);
    };
  }, []);

  // Casillas nativas de la tabla: se sincroniza el conteo al cambiar cualquiera y cuando cambian las filas.
  useEffect(() => {
    const sync = () => setSelected(idsMarcados(formId));
    sync();
    document.addEventListener("change", sync);
    return () => document.removeEventListener("change", sync);
  }, [formId, items]);

  // <dialog> nativo con showModal: foco atrapado, Esc y fondo inerte sin código propio.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) {
      dialog.close();
      // Al cerrarse tras una corrida, el abridor queda deshabilitado (nada seleccionado): el foco pasa al resultado.
      if (focusResult.current) {
        focusResult.current = false;
        resultRef.current?.focus();
      }
    }
  }, [abierto]);

  function marcar(on: boolean) {
    for (const input of checkboxes(formId)) input.checked = on;
    setSelected(idsMarcados(formId));
  }

  function desmarcar(ids: string[]) {
    for (const input of checkboxes(formId)) if (ids.includes(input.value)) input.checked = false;
    setSelected(idsMarcados(formId));
  }

  function cancelarUndo() {
    if (undoTimer.current) clearInterval(undoTimer.current);
    undoTimer.current = null;
    setUndoLeft(0);
  }

  // Cuenta regresiva de Deshacer, independiente de la lista: los ids publicados salen de `resultados`.
  function iniciarUndo() {
    cancelarUndo();
    let left = UNDO_MS / 1000;
    setUndoLeft(left);
    undoTimer.current = setInterval(() => {
      left -= 1;
      if (left > 0) setUndoLeft(left);
      else cancelarUndo();
    }, 1000);
  }

  async function publicar() {
    if (!puedePublicar) return;
    const nota = texto.trim();
    const lote = elegidas;
    cancelarUndo();
    setResultados([]);
    setProgreso(0);
    setBusy(true);
    const out: Resultado[] = [];
    for (const item of lote) {
      const result = await postPublicacion({ tipo: "tarea", id: item.id, publicar: true, nota, fecha: dia });
      if (!alive.current) return;
      out.push({ id: item.id, nombre: item.nombre, ...result });
      setProgreso(out.length);
    }
    setResultados(out);
    setBusy(false);
    focusResult.current = true;
    setAbierto(false);
    const publicadas = out.filter((row) => row.ok).map((row) => row.id);
    desmarcar(publicadas);
    // Las filas publicadas salen de «Por verificar» de inmediato; Deshacer sigue disponible desde `resultados`.
    router.refresh();
    if (publicadas.length > 0) iniciarUndo();
  }

  async function deshacer() {
    const publicadas = resultados.filter((row) => row.ok);
    cancelarUndo();
    resultRef.current?.focus();
    setBusy(true);
    const out: Resultado[] = [];
    for (const item of publicadas) {
      const result = await postPublicacion({ tipo: "tarea", id: item.id, publicar: false });
      if (!alive.current) return;
      out.push({ id: item.id, nombre: item.nombre, ...result });
    }
    setResultados(out);
    setBusy(false);
    router.refresh();
  }

  if (items.length === 0 && resultados.length === 0) return null;

  const okCount = resultados.filter((row) => row.ok).length;
  const failCount = resultados.length - okCount;

  return (
    <form id={formId} className="toolbar is-stacked" data-testid="batch-publish" onSubmit={(event) => event.preventDefault()}>
      <div className="pub-actions">
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 32 }}>
          <input
            type="checkbox"
            data-testid="verificacion-select-all"
            checked={todas}
            disabled={items.length === 0 || busy}
            onChange={(event) => marcar(event.target.checked)}
          />
          <span className="small">Seleccionar todas</span>
        </label>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          data-testid="batch-publish-open"
          disabled={elegidas.length === 0 || busy}
          onClick={() => {
            setDia(max);
            setAbierto(true);
          }}
        >
          {`Publicar seleccionadas (${elegidas.length})`}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        data-testid="batch-publish-dialog"
        aria-labelledby={tituloId}
        onClose={() => setAbierto(false)}
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
        style={{ width: "min(520px, 92vw)", padding: 20, border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-card)", background: "var(--color-surface-card)" }}
      >
        <div className="evidencia-box pub-box">
          <h3 id={tituloId}>{`Publicar ${elegidas.length} ${elegidas.length === 1 ? "tarea" : "tareas"}`}</h3>
          <p className="small">La misma nota y la misma fecha se aplican a todas las seleccionadas.</p>
          <label htmlFor={notaId}>Nota de entrega para el equipo Ecopetrol</label>
          <input
            id={notaId}
            className="pub-input"
            data-testid="batch-publish-note"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="Demostrado en weekly 15/10"
            maxLength={300}
            disabled={busy}
          />
          <label htmlFor={fechaId}>Completada el</label>
          <input id={fechaId} type="date" className="pub-input" data-testid="batch-publish-date" value={dia} max={max} onChange={(event) => setDia(event.target.value)} disabled={busy} />
          <p className="small">Vista previa</p>
          <ul className="small" data-testid="batch-publish-preview">
            {elegidas.map((item) => (
              <li key={item.id}>{`${item.id} · ${item.nombre}`}</li>
            ))}
          </ul>
          <div className="pub-actions">
            <button type="button" className="btn btn-primary btn-sm" data-testid="batch-publish-confirm" disabled={!puedePublicar} onClick={() => void publicar()}>
              {busy ? `Publicando ${progreso} de ${elegidas.length}…` : "Publicar"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" data-testid="batch-publish-cancel" onClick={() => setAbierto(false)} disabled={busy}>
              Cancelar
            </button>
          </div>
        </div>
      </dialog>

      {resultados.length > 0 && (
        <div ref={resultRef} tabIndex={-1} data-testid="batch-publish-result" role="status" aria-live="polite">
          <p className="small">{`${okCount} correctas · ${failCount} con error`}</p>
          <ul className="small">
            {resultados.map((row) => (
              <li key={row.id} data-testid={`batch-publish-result-${kebabId(row.id)}`} className={row.ok ? undefined : "form-error"}>
                {`${row.id} · ${row.nombre}: ${row.detalle}`}
              </li>
            ))}
          </ul>
          {undoLeft > 0 && okCount > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" data-testid="batch-publish-undo" onClick={() => void deshacer()} disabled={busy}>
              {`Deshacer (${undoLeft} s)`}
            </button>
          )}
        </div>
      )}
    </form>
  );
}
