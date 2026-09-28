import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LiveSync } from "@/components/live-sync";
import { HeaderTitle, Sidebar } from "@/components/sidebar";
import { getRole } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth-constants";
import "../app.css";

// Todas las vistas leen la base de datos: runtime Node.js (nunca edge).
export const runtime = "nodejs";

/** Shell del arquetipo BenchHub (widgets/app-shell): sidebar oscuro + cabecera blanca con franja degradada. */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const role = await getRole();
  if (!role) redirect("/login");
  const canEdit = role === "editor" || role === "admin";

  return (
    <div className="app-shell">
      <Sidebar canEdit={canEdit} isAdmin={role === "admin"} />
      <div className="app-main">
        <header className="app-header">
          <div className="app-header-strip" aria-hidden="true" />
          <div className="app-header-bar">
            <HeaderTitle />
            <div className="app-header-right">
              <LiveSync />
              <span className="partner-logo" title="Ecopetrol">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-ecopetrol.png" alt="Ecopetrol" />
              </span>
              <span className="role-chip" data-testid="role-badge">
                <span className="role-avatar" aria-hidden="true">
                  {ROLE_LABELS[role].slice(0, 1)}
                </span>
                {ROLE_LABELS[role]}
              </span>
            </div>
          </div>
        </header>
        <div className="app-content">{children}</div>
        <footer className="app-footer">
          <span>BenchHub · MVP Ecopetrol</span>
          <span>{canEdit ? "Vista de equipo: incluye elementos internos" : "Vista Equipo Ecopetrol"}</span>
        </footer>
      </div>
    </div>
  );
}