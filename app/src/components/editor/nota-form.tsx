"use client";

import { useState } from "react";
import { usePost } from "./use-post";

export function NotaForm({ entidadTipo, entidadId }: { entidadTipo: "tarea" | "historia" | "milestone"; entidadId: string }) {
  const [texto, setTexto] = useState("");
  const [visible, setVisible] = useState(false);
  const { send, error, busy } = usePost("/api/editor/nota");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (await send({ entidadTipo, entidadId, texto, visibleCliente: visible })) {
      setTexto("");
      setVisible(false);
    }
  }

  return (
    <form className="nota-form" onSubmit={enviar} data-testid="nota-form">
      <label className="sr-only" htmlFor={`nota-${entidadId}`}>
        Nueva nota
      </label>
      <textarea id={`nota-${entidadId}`} rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Agrega una nota, un enlace o un acuerdo…" disabled={busy} />
      <div className="nota-form-foot">
        <div className="seg" role="radiogroup" aria-label="Visibilidad de la nota">
          <button type="button" role="radio" aria-checked={!visible} className={!visible ? "is-on" : ""} onClick={() => setVisible(false)}>
            Interna
          </button>
          <button type="button" role="radio" aria-checked={visible} className={visible ? "is-on" : ""} onClick={() => setVisible(true)}>
            Visible para Ecopetrol
          </button>
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy || texto.trim().length < 2}>
          {busy ? "Guardando…" : "Agregar nota"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}