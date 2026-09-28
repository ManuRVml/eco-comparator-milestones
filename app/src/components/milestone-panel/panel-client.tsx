"use client";

import { createContext, type CSSProperties, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface PanelCtx {
  sel: string | null;
  ultimoPorLinea: Record<string, string>;
  toggle: (id: string) => void;
  close: () => void;
}

const Ctx = createContext<PanelCtx | null>(null);

function usePanel() {
  const c = useContext(Ctx);
  if (!c) throw new Error("PanelProvider requerido");
  return c;
}

function syncUrl(id: string | null) {
  const u = new URL(window.location.href);
  if (id) u.searchParams.set("m", id);
  else u.searchParams.delete("m");
  window.history.replaceState(null, "", `${u.pathname}${u.search}${u.hash}`);
}

function revelar(lineaId: string | undefined) {
  if (!lineaId) return;
  window.setTimeout(() => {
    const el = document.getElementById(`rm-slot-${lineaId}`);
    if (el && window.matchMedia("(min-width: 761px)").matches) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 60);
}

/** Estado del panel de entregables de la línea de tiempo: selección, Esc, deep link ?m=. */
export function PanelProvider({ initial, lineaDe, children }: { initial: string | null; lineaDe: Record<string, string>; children: ReactNode }) {
  const [sel, setSel] = useState<string | null>(initial);
  const [ultimoPorLinea, setUltimo] = useState<Record<string, string>>(() => (initial && lineaDe[initial] ? { [lineaDe[initial]]: initial } : {}));

  const close = useCallback(() => {
    setSel(null);
    syncUrl(null);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const next = sel === id ? null : id;
      setSel(next);
      syncUrl(next);
      if (next) revelar(lineaDe[next]);
      if (lineaDe[id]) setUltimo((u) => ({ ...u, [lineaDe[id]]: id }));
    },
    [sel, lineaDe],
  );

  useEffect(() => {
    if (initial) revelar(lineaDe[initial]);
    // solo al montar (deep link)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, close]);

  const value = useMemo(() => ({ sel, ultimoPorLinea, toggle, close }), [sel, ultimoPorLinea, toggle, close]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={`rm-backdrop ${sel ? "is-open" : ""}`} onClick={close} aria-hidden="true" />
    </Ctx.Provider>
  );
}

export function RoadmapNode({ id, href, className, style, title, children }: { id: string; href: string; className: string; style: CSSProperties; title: string; children: ReactNode }) {
  const { sel, toggle } = usePanel();
  const activo = sel === id;
  return (
    <a
      href={href}
      className={`${className} ${activo ? "is-selected" : ""}`}
      style={style}
      title={title}
      aria-expanded={activo}
      data-testid={`node-${id}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        toggle(id);
      }}
    >
      {children}
    </a>
  );
}

/** Ranura bajo la fila de una línea: se expande con el panel del milestone seleccionado. */
export function LaneSlot({ lineaId, panels }: { lineaId: string; panels: Record<string, ReactNode> }) {
  const { sel, ultimoPorLinea } = usePanel();
  const abierto = !!sel && sel in panels;
  const mostrado = abierto ? sel : ultimoPorLinea[lineaId];
  return (
    <div
      id={`rm-slot-${lineaId}`}
      className={`rm-panel-wrap ${abierto ? "is-open" : ""}`}
      aria-hidden={!abierto}
      inert={!abierto}
      data-testid={`slot-${lineaId}`}
    >
      <div className="rm-panel-inner">{mostrado ? panels[mostrado] : null}</div>
    </div>
  );
}

export function PanelClose() {
  const { close } = usePanel();
  return (
    <button type="button" className="panel-x" onClick={close} aria-label="Cerrar panel (Esc)" title="Cerrar (Esc)">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}