"use client";

import { usePost } from "./use-post";

export function ConfigToggle({ clave, activo, titulo, descripcion }: { clave: string; activo: boolean; titulo: string; descripcion: string }) {
  const { send, error, busy } = usePost("/api/editor/config");
  return (
    <div className="config-row">
      <div>
        <strong>{titulo}</strong>
        <p>{descripcion}</p>
        {error && <p className="form-error">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={titulo}
        className={`switch ${activo ? "is-on" : ""}`}
        onClick={() => send({ clave, valor: activo ? "0" : "1" })}
        disabled={busy}
        data-testid={`config-${clave}`}
      >
        <span className="switch-knob" />
      </button>
    </div>
  );
}