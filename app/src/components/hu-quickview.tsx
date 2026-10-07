"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export type HuQuickViewData = {
  id: string;
  nombre: string;
  sp: number | null;
  epica: string | null;
  sprint: string | null;
  tareasHechas: number;
  tareasTotal: number;
  demo: string | null;
};

const OPEN_DELAY = 200;
const CLOSE_DELAY = 120;
const GAP = 6;
const MARGIN = 8;

/** Envuelve el chip de una HU y muestra una vista rápida al pasar el cursor, enfocar o tocar. */
export function HuQuickView({
  data,
  badge,
  children,
}: {
  data: HuQuickViewData;
  badge: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touch = useRef(false);
  const popId = useId();

  const schedule = useCallback((next: boolean) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => setOpen(next),
      next ? OPEN_DELAY : CLOSE_DELAY,
    );
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Toque fuera cierra la vista rápida.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = (restoreFocus: boolean) => {
    clearTimeout(timer.current);
    setOpen(false);
    if (restoreFocus && wrapRef.current?.contains(document.activeElement))
      wrapRef.current.querySelector<HTMLElement>("a")?.focus();
  };

  return (
    <div
      ref={wrapRef}
      className="hu-qv"
      onPointerDown={(e) => {
        touch.current = e.pointerType === "touch";
      }}
      onPointerEnter={(e) => e.pointerType !== "touch" && schedule(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && schedule(false)}
      onFocus={() => schedule(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          schedule(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close(true);
        }
      }}
      onClickCapture={(e) => {
        // Táctil: el primer toque sobre el chip abre la vista rápida; el segundo (o "Ver historia") navega.
        if (
          touch.current &&
          !open &&
          !(e.target as Element).closest(".hu-qv-pop")
        ) {
          e.preventDefault();
          clearTimeout(timer.current);
          setOpen(true);
        }
      }}
    >
      {children}
      {open && (
        <HuQuickViewPop id={popId} data={data} badge={badge} anchor={wrapRef} />
      )}
    </div>
  );
}

function HuQuickViewPop({
  id,
  data,
  badge,
  anchor,
}: {
  id: string;
  data: HuQuickViewData;
  badge: ReactNode;
  anchor: RefObject<HTMLElement | null>;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const progreso = data.tareasTotal
    ? `${data.tareasHechas}/${data.tareasTotal} tareas hechas`
    : "Sin tareas";

  // Posición fija (no desplaza el layout) corregida para quedar dentro del viewport.
  useLayoutEffect(() => {
    const place = () => {
      const rect = anchor.current?.getBoundingClientRect();
      const pop = popRef.current;
      if (!rect || !pop) return;
      const { offsetWidth: w, offsetHeight: h } = pop;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const left = Math.max(MARGIN, Math.min(rect.left, vw - w - MARGIN));
      const below = rect.bottom + GAP;
      const top =
        below + h + MARGIN <= vh || rect.top - GAP - h < MARGIN
          ? below
          : rect.top - GAP - h;
      setPos({ top: Math.max(MARGIN, Math.min(top, vh - h - MARGIN)), left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor]);

  return (
    <div
      ref={popRef}
      id={id}
      role="group"
      aria-label={`Vista rápida de ${data.id}`}
      className="hu-qv-pop"
      style={
        pos
          ? { top: pos.top, left: pos.left }
          : { top: 0, left: 0, visibility: "hidden" }
      }
    >
      <div className="hu-qv-head">
        <b>{data.id}</b>
        {badge}
      </div>
      <strong className="hu-qv-name">{data.nombre}</strong>
      <dl className="hu-qv-meta">
        <div>
          <dt>SP</dt>
          <dd>{data.sp ?? 0}</dd>
        </div>
        <div>
          <dt>Épica</dt>
          <dd>{data.epica ?? "—"}</dd>
        </div>
        <div>
          <dt>Sprint</dt>
          <dd>{data.sprint ?? "—"}</dd>
        </div>
        {data.demo && (
          <div>
            <dt>Demo</dt>
            <dd>{data.demo}</dd>
          </div>
        )}
      </dl>
      <div className="hu-qv-progress" aria-label={progreso}>
        <span className="hu-qv-bar">
          <i
            style={{
              width: `${data.tareasTotal ? (data.tareasHechas / data.tareasTotal) * 100 : 0}%`,
            }}
          />
        </span>
        <small>{progreso}</small>
      </div>
      <Link className="hu-qv-link" href={`/historias/${data.id}`}>
        Ver historia →
      </Link>
    </div>
  );
}
