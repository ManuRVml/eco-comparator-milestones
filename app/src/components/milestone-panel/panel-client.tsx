"use client";

import { createPortal } from "react-dom";
import { createContext, type CSSProperties, type ReactNode, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

interface PanelCtx {
  sel: string | null;
  ultimoPorLinea: Record<string, string>;
  toggle: (id: string, trigger?: HTMLElement) => void;
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
  window.history.pushState(window.history.state, "", `${u.pathname}${u.search}${u.hash}`);
}

/** Estado del panel de entregables de la línea de tiempo: selección, Esc, deep link ?m=. */
export function PanelProvider({ initial, lineaDe, children }: { initial: string | null; lineaDe: Record<string, string>; children: ReactNode }) {
  const mounted = useMounted();
  const [sel, setSel] = useState<string | null>(initial);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [ultimoPorLinea, setUltimo] = useState<Record<string, string>>(() => (initial && lineaDe[initial] ? { [lineaDe[initial]]: initial } : {}));

  const close = useCallback(() => {
    setSel(null);
    syncUrl(null);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const id = new URLSearchParams(window.location.search).get("m");
      setSel(id && id in lineaDe ? id : null);
      setTrigger(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [lineaDe]);

  useEffect(() => {
    if (!sel || !mounted) return;
    const dialog = document.querySelector<HTMLElement>(`[data-testid="slot-${lineaDe[sel]}"]`);
    if (!dialog) return;
    const changed: { node: HTMLElement; inert: boolean }[] = [];
    let current: HTMLElement | null = dialog;
    while (current?.parentElement && current !== document.body) {
      for (const sibling of Array.from(current.parentElement.children)) {
        if (sibling !== current && sibling instanceof HTMLElement && !sibling.classList.contains("rm-backdrop")) {
          changed.push({ node: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      current = current.parentElement;
    }
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLElement>(".panel-x")?.focus({ preventScroll: true });
    return () => {
      for (const item of changed) item.node.inert = item.inert;
      document.body.style.overflow = priorOverflow;
      window.requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
    };
  }, [lineaDe, sel, trigger, mounted]);

  const toggle = useCallback(
    (id: string, element?: HTMLElement) => {
      const next = sel === id ? null : id;
      setSel(next);
      if (next && element) setTrigger(element);
      syncUrl(next);
      if (lineaDe[id]) setUltimo((u) => ({ ...u, [lineaDe[id]]: id }));
    },
    [sel, lineaDe],
  );

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
      <PanelBackdrop />
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
        toggle(id, e.currentTarget);
      }}
    >
      {children}
    </a>
  );
}

const subscribeMounted = () => () => {};
function useMounted() {
  return useSyncExternalStore(subscribeMounted, () => true, () => false);
}
function PanelBackdrop() {
  const { sel, close } = usePanel();
  const mounted = useMounted();
  return mounted ? createPortal(<div className={`rm-backdrop ${sel ? "is-open" : ""}`} onClick={close} aria-hidden="true" />, document.body) : null;
}

/** Panel lateral fuera del timeline: conserva la posición de la página. */
export function LaneSlot({ lineaId, panels }: { lineaId: string; panels: Record<string, ReactNode> }) {
  const { sel, ultimoPorLinea } = usePanel();
  const mounted = useMounted();
  const abierto = !!sel && sel in panels;
  const mostrado = abierto ? sel : ultimoPorLinea[lineaId];
  if (!mounted) return null;
  return createPortal(
    <div
      id={`rm-slot-${lineaId}`}
      className={`rm-panel-wrap ${abierto ? "is-open" : ""}`}
      role={abierto ? "dialog" : undefined}
      aria-modal={abierto ? true : undefined}
      aria-labelledby={abierto ? `panel-heading-${mostrado}` : undefined}
      tabIndex={abierto ? -1 : undefined}
      onKeyDown={abierto ? (event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')).filter((el) => el.getClientRects().length > 0);
        if (!controls.length) { event.preventDefault(); event.currentTarget.focus(); return; }
        const first = controls[0], last = controls.at(-1)!;
        if (event.shiftKey && (document.activeElement === first || !event.currentTarget.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !event.currentTarget.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      } : undefined}
      aria-hidden={!abierto}
      inert={!abierto}
      data-testid={`slot-${lineaId}`}
    >
      <div className="rm-panel-inner">{mostrado ? panels[mostrado] : null}</div>
    </div>, document.body
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
