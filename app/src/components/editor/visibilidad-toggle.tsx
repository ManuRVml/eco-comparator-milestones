"use client";

import { usePost } from "./use-post";

export function VisibilidadToggle({
  tipo,
  id,
  visible,
  etiqueta,
}: {
  tipo: "tarea" | "historia" | "milestone" | "nota" | "riesgo";
  id: string | number;
  visible: boolean;
  etiqueta?: string;
}) {
  const { send, error, busy } = usePost("/api/editor/visibilidad");
  return (
    <span className="vis-toggle-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        className={`vis-toggle ${visible ? "is-on" : ""}`}
        onClick={() => send({ tipo, id, visible: !visible })}
        disabled={busy}
        title={visible ? "Visible para el equipo Ecopetrol (clic para ocultar)" : "Oculto al equipo Ecopetrol (clic para mostrar)"}
        data-testid={`vis-${tipo}-${id}`}
      >
        <span className="vis-knob" />
        <span className="vis-label">{etiqueta ?? (visible ? "Ecopetrol lo ve" : "Interno")}</span>
      </button>
      {error && <span className="form-error">{error}</span>}
    </span>
  );
}