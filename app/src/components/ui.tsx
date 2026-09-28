import Link from "next/link";
import type { ReactNode } from "react";
import { colorArea, colorEstado, fmtPct, tono } from "@/lib/format";

export function StatusBadge({ estado, size = "md", title }: { estado: string; size?: "sm" | "md"; title?: string }) {
  return (
    <span className={`status-badge tone-${tono(estado)} ${size === "sm" ? "is-sm" : ""}`} title={title}>
      <span className="status-dot" />
      {estado}
    </span>
  );
}

export function Chip({ children, tone, href, title }: { children: ReactNode; tone?: string; href?: string; title?: string }) {
  const cls = `chip ${tone ? `tone-${tone}` : ""}`;
  return href ? (
    <Link className={cls} href={href} title={title}>
      {children}
    </Link>
  ) : (
    <span className={cls} title={title}>
      {children}
    </span>
  );
}

export function AreaDot({ areaId }: { areaId: string }) {
  return <span className="area-dot" style={{ background: colorArea(areaId) }} aria-hidden="true" />;
}

export function ProgressBar({
  value,
  plan,
  color = "var(--brand-primary)",
  height = 8,
  label,
}: {
  value: number;
  plan?: number;
  color?: string;
  height?: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="progress"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="progress-fill" style={{ width: `${v}%`, background: color }} />
      {plan !== undefined && <div className="progress-plan" style={{ left: `${Math.max(0, Math.min(100, plan))}%` }} title={`Planificado ${fmtPct(plan)}`} />}
    </div>
  );
}

/** Anillo de progreso SVG. */
export function Ring({
  value,
  size = 120,
  stroke = 12,
  color = "var(--brand-primary)",
  track = "var(--ring-track)",
  plan,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  plan?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  // Con extremos redondeados el trazo sobresale stroke/2 por cada lado: se descuenta del largo y se gira el inicio,
  // así un valor pequeño es un arco corto que empieza exactamente a las 12 y termina en su valor.
  const capDeg = (stroke / 2 / r) * (180 / Math.PI);
  const largo = Math.max((v / 100) * c - stroke, 0.01);
  const planAngle = plan !== undefined ? (Math.max(0, Math.min(100, plan)) / 100) * 360 - 90 : null;
  return (
    <div className="gring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: track }} strokeWidth={stroke} />
        {v > 0 && (
        <circle
          className="gring-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${largo} ${c}`}
          transform={`rotate(${-90 + capDeg} ${size / 2} ${size / 2})`}
          style={{ stroke: color, ["--ring-c" as string]: `${c}` }}
        />
        )}
        {planAngle !== null && (
          <circle
            className="gring-plan"
            cx={size / 2 + r * Math.cos((planAngle * Math.PI) / 180)}
            cy={size / 2 + r * Math.sin((planAngle * Math.PI) / 180)}
            r={Math.max(2.5, stroke * 0.24)}
            style={{ fill: "var(--ring-plan)", stroke: "var(--ring-plan-edge)" }}
            strokeWidth={2}
          >
            <title>Planificado a hoy</title>
          </circle>
        )}
      </svg>
      <div className="gring-center">{children}</div>
    </div>
  );
}

export function MiniRing({ value, estado, size = 44 }: { value: number; estado: string; size?: number }) {
  return (
    <Ring value={value} size={size} stroke={5} color={colorEstado(estado)}>
      <span className="mini-ring-label">{Math.round(value)}%</span>
    </Ring>
  );
}

export function PageHeading({ kicker, title, children, aside }: { kicker: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {aside && <div className="page-heading-aside">{aside}</div>}
    </div>
  );
}

export function Card({ title, kicker, children, className = "", actions }: { title?: ReactNode; kicker?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`card ${className}`}>
      {(title || kicker || actions) && (
        <header className="card-head">
          <div>
            {kicker && <span className="kicker">{kicker}</span>}
            {title && <h3>{title}</h3>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty-note">{children}</p>;
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumb" aria-label="Ruta">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && <span className="breadcrumb-sep">/</span>}
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function CriticalBadge() {
  return (
    <span className="critical-badge" title="Tarea en ruta crítica">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 1.5 13.5h13L8 1.5Z" fill="currentColor" opacity=".18" /><path d="M8 6v3.5M8 11.6v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      Ruta crítica
    </span>
  );
}