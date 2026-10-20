"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { placePopover } from "@/lib/popover-position";

type Side = "top" | "bottom";
/** Reusable, viewport-clamped tooltip for a single interactive trigger. */
export function Tooltip({ label, side = "bottom", children }: { label: string; side?: Side; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const describedTriggerRef = useRef<HTMLElement | null>(null);
  const originalDescribedByRef = useRef<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;
    const place = () => placePopover(trigger, tooltip, 260, side);
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, side]);

  useEffect(() => {
    const trigger = rootRef.current?.firstElementChild;
    if (!(trigger instanceof HTMLElement)) return;
    triggerRef.current = trigger;
    if (open) {
      describedTriggerRef.current = trigger;
      originalDescribedByRef.current = trigger.getAttribute("aria-describedby");
      const describedBy = [originalDescribedByRef.current, id].filter(Boolean).join(" ");
      trigger.setAttribute("aria-describedby", describedBy);
    }
    return () => {
      if (describedTriggerRef.current !== trigger) return;
      if (originalDescribedByRef.current === null) trigger.removeAttribute("aria-describedby");
      else trigger.setAttribute("aria-describedby", originalDescribedByRef.current);
      describedTriggerRef.current = null;
      originalDescribedByRef.current = null;
    };
  }, [open, id]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <>
      <span
        ref={rootRef}
        style={{ display: "contents" }}
        onPointerEnter={(event) => {
          const triggerElement = rootRef.current?.firstElementChild;
          if (triggerElement instanceof HTMLElement) triggerRef.current = triggerElement;
          if (event.pointerType === "touch") return;
          clearTimer();
          timerRef.current = setTimeout(() => setOpen(true), 250);
        }}
        onPointerLeave={() => {
          clearTimer();
          setOpen(false);
        }}
        onFocusCapture={(event) => {
          const triggerElement = event.target;
          if (!(triggerElement instanceof HTMLElement)) return;
          triggerRef.current = triggerElement;
          if (triggerElement.matches(":focus-visible")) setOpen(true);
        }}
        onBlurCapture={() => {
          clearTimer();
          setOpen(false);
        }}
        onKeyDownCapture={(event) => {
          if (event.key === "Escape") {
            clearTimer();
            setOpen(false);
          }
        }}
      >
        {children}
      </span>
      {open && typeof document !== "undefined" && createPortal(
        <div ref={tooltipRef} id={id} className="ui-tooltip" role="tooltip">{label}</div>,
        document.body,
      )}
    </>
  );
}
