"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, useEffect, useSyncExternalStore } from "react";
import { logout } from "@/app/login/actions";
import { AreasIcon, CalendarIcon, CheckIcon, EditIcon, HomeIcon, LogoutIcon, ReportIcon, TimelineIcon } from "@/components/icons";

type Item = { href: string; label: string; icon: ComponentType<{ size?: number }>; match: (p: string) => boolean; equipo?: boolean; admin?: boolean };

function getItems(canEdit: boolean): Item[] {
  return [
    { href: "/", label: "Resumen de milestones", icon: HomeIcon, match: (p) => p === "/" },
    { href: "/lineas", label: "Timeline de milestones", icon: TimelineIcon, match: (p) => p.startsWith("/lineas") || p.startsWith("/milestones") },
    { href: "/areas", label: "Avance por área", icon: AreasIcon, match: (p) => p.startsWith("/areas") },
    { href: "/agenda", label: canEdit ? "Agenda de milestones" : "Entregas por fecha", icon: CalendarIcon, match: (p) => p.startsWith("/agenda") },
    { href: "/editor", label: "Panel del editor", icon: EditIcon, match: (p) => p.startsWith("/editor"), equipo: true },
    { href: "/flujo", label: "Trabajo por equipo", icon: AreasIcon, match: (p) => p.startsWith("/flujo"), equipo: true },
    { href: "/reconciliacion", label: "Fuentes y compromisos", icon: ReportIcon, match: (p) => p.startsWith("/reconciliacion"), equipo: true },
    { href: "/verificacion", label: "Verificación", icon: CheckIcon, match: (p) => p.startsWith("/verificacion"), equipo: true },
    { href: "/bitacora", label: "Bitácora", icon: ReportIcon, match: (p) => p.startsWith("/bitacora"), equipo: true },
    { href: "/configuracion", label: "Configuración", icon: AreasIcon, match: (p) => p.startsWith("/configuracion"), admin: true },
  ];
}

const TITULOS: [RegExp, string][] = [
  [/^\/$/, "Resumen de milestones"],
  [/^\/lineas/, "Timeline de milestones"],
  [/^\/milestones/, "Milestone: resultado y aceptación"],
  [/^\/areas/, "Avance por área"],
  [/^\/agenda/, "Agenda de milestones"],
  [/^\/editor/, "Panel del editor"],
  [/^\/flujo/, "Trabajo por equipo"],
  [/^\/reconciliacion/, "Fuentes y compromisos"],
  [/^\/bitacora/, "Bitácora"],
  [/^\/verificacion/, "Pendiente de verificación"],
  [/^\/historias/, "Historia de usuario"],
  [/^\/tareas/, "Tarea"],
];

const CLAVE = "seg-sidebar";
const EVENTO = "seg-sidebar";

function leerColapsado() {
  try {
    return window.localStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}

function suscribir(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENTO, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Sidebar oscuro del arquetipo (widgets/app-shell/Sidebar.tsx): 220 / 68 px, fila activa brand-nav-active. */
export function Sidebar({ canEdit, isAdmin }: { canEdit: boolean; isAdmin: boolean }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(suscribir, leerColapsado, () => false);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    document.querySelector<HTMLElement>(".app-sidebar-nav [aria-current='page']")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  function toggle() {
    try {
      window.localStorage.setItem(CLAVE, collapsed ? "0" : "1");
    } catch {
      /* almacenamiento no disponible */
    }
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <aside id="app-sidebar" className={`app-sidebar ${collapsed ? "is-collapsed" : ""}`} data-collapsed={collapsed} aria-label="Menú principal de BenchHub">
      <div className="app-sidebar-inner">
      <div className="app-sidebar-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collapsed ? "/brand/benchud-logo-compact.png" : "/brand/benchud-logo-shell.png"} alt="BenchHub" className="app-sidebar-logo" />
      </div>
      <nav aria-label="Navegación principal" className="app-sidebar-nav">
        <ul>
           {getItems(canEdit).filter((it) => (it.admin ? isAdmin : canEdit || !it.equipo)).map((it) => {
            const active = it.match(pathname);
            const Icon = it.icon;
            return (
              <li key={it.href}>
                <Link href={it.href} className={`app-nav-row ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined} title={collapsed ? (isAdmin && it.href === "/editor" ? "Administración" : it.label) : undefined}>
                  <Icon size={20} />
                  <span className="app-nav-label">{isAdmin && it.href === "/editor" ? "Administración" : it.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <form action={logout}>
              <button type="submit" className="app-nav-row is-logout" title={collapsed ? "Salir" : undefined}>
                <LogoutIcon size={20} />
                <span className="app-nav-label">Salir</span>
              </button>
            </form>
          </li>
        </ul>
      </nav>
      <div className="app-sidebar-foot">
        <button type="button" className="app-collapse" aria-expanded={!collapsed} aria-controls="app-sidebar" aria-label={collapsed ? "Expandir menú" : undefined} onClick={toggle}>
          {collapsed ? "›" : "‹ Colapsar"}
        </button>
      </div>
      </div>
    </aside>
  );
}

export function HeaderTitle({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const titulo = pathname.startsWith("/editor") && isAdmin ? "Administración" : TITULOS.find(([re]) => re.test(pathname))?.[1] ?? "Seguimiento";
  return (
    <h1 className="app-title" data-testid="app-title">
      {titulo}
    </h1>
  );
}
