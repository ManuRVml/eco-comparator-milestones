"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { BarChartIcon, BookIcon, GaugeIcon, InfoIcon } from "./icons";

const ICONS = { info: InfoIcon, book: BookIcon, gauge: GaugeIcon, chart: BarChartIcon } as const;

export type InfoToolbarItem = { id: string; label: string; icon: keyof typeof ICONS; content: ReactNode };

/** Fila compacta de botones-icono; cada uno abre su contenido en un panel bajo la barra (Esc o clic fuera lo cierra). */
export function InfoToolbar({ items, label }: { items: InfoToolbarItem[]; label: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const active = items.find((i) => i.id === open);
  return (
    <div className="info-toolbar" ref={root} data-testid="info-toolbar">
      <div className="info-toolbar-row" role="toolbar" aria-label={label}>
        {items.map((it) => {
          const Icon = ICONS[it.icon];
          const on = open === it.id;
          return (
            <button
              key={it.id}
              type="button"
              className={`info-toolbar-btn ${on ? "is-active" : ""}`}
              aria-label={it.label}
              title={it.label}
              aria-expanded={on}
              aria-controls={`${uid}-${it.id}`}
              onClick={() => setOpen(on ? null : it.id)}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
      {active && (
        <div className="info-toolbar-panel" id={`${uid}-${active.id}`} role="region" aria-label={active.label}>
          {active.content}
        </div>
      )}
    </div>
  );
}
