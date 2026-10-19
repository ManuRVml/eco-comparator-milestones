"use client";

import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { StatusBadge } from "@/components/ui";
import type { CausaRiesgo, EstadoMilestone } from "@/lib/model";

const MARGIN = 8;

function placePopover(button: HTMLElement, panel: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const width = Math.min(320, window.innerWidth - MARGIN * 2);
  panel.style.width = `${width}px`;
  let left = rect.left;
  if (left + width > window.innerWidth - MARGIN) left = window.innerWidth - width - MARGIN;
  if (left < MARGIN) left = MARGIN;
  const height = panel.offsetHeight;
  let top = rect.bottom + 6;
  if (top + height > window.innerHeight - MARGIN && rect.top - height - 6 >= MARGIN) top = rect.top - height - 6;
  panel.style.left = `${left}px`;
  panel.style.top = `${Math.max(MARGIN, top)}px`;
  panel.classList.add("is-placed");
}

function CauseGroup({ titulo, causas }: { titulo: string; causas: CausaRiesgo[] }) {
  if (causas.length === 0) return null;
  return (
    <section>
      <h4>{titulo}</h4>
      <ul>
        {causas.map((c, i) => (
          <li key={`${c.ref ?? c.texto}-${i}`}>{c.texto}</li>
        ))}
      </ul>
    </section>
  );
}

/** Badge de milestone. "En riesgo" abre las causas; el resto se ve igual que StatusBadge. */
export function MilestoneStatus({ m, size }: { m: { estadoFinal: EstadoMilestone; causasRiesgo: CausaRiesgo[] }; size?: "sm" | "md" }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const riesgo = m.estadoFinal === "En riesgo" && m.causasRiesgo.length > 0;

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const panel = panelRef.current;
    if (!button || !panel) return;

    const place = () => placePopover(button, panel);
    place();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      button.focus();
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (button.contains(target) || panel.contains(target)) return;
      setOpen(false);
      const next = target instanceof Element ? target : null;
      if (!next?.closest("a, button, input, select, textarea, summary, [tabindex]")) button.focus();
    };

    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  if (!riesgo) return <StatusBadge estado={m.estadoFinal} size={size} />;

  const tecnicas = m.causasRiesgo.filter((c) => c.tipo === "tecnica");
  const negocio = m.causasRiesgo.filter((c) => c.tipo === "negocio");

  const guard = (e: ReactMouseEvent | ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="status-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          guard(e);
          setOpen((v) => !v);
        }}
      >
        <StatusBadge estado={m.estadoFinal} size={size} />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className="status-popover"
            role="dialog"
            aria-label="Causas del riesgo"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={guard}
          >
            <CauseGroup titulo="Causa técnica" causas={tecnicas} />
            <CauseGroup titulo="Causa de negocio" causas={negocio} />
          </div>,
          document.body,
        )}
    </>
  );
}
