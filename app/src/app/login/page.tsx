import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BarChartIcon, ClockIcon, TrendUpIcon } from "@/components/icons";
import { LoginForm } from "@/app/login/login-form";
import { getRole } from "@/lib/auth";

function Feature({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <li className="flex items-start gap-14">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-nav border border-ai-accent/35 bg-ai-accent/18 text-ai-accent">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-14 font-semibold text-text-on-dark-heading">{title}</span>
        <span className="text-13 text-text-on-dark-caption">{subtitle}</span>
      </span>
    </li>
  );
}

/**
 * Réplica de SCR-01 (eco-comparator-web/src/pages/login/LoginPage.tsx): foto de refinería bajo
 * --gradient-login-overlay sobre dark-bg, panel de marca a la izquierda y tarjeta de vidrio de 420 px a la derecha.
 * Única diferencia funcional: el acceso es por PIN de rol.
 */
export default async function LoginPage() {
  if (await getRole()) redirect("/");

  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-dark-bg px-24 py-48 laptop:p-64" data-testid="login-page">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/login-bg.webp" alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-(image:--gradient-login-overlay)" />
      <div className="mx-auto flex w-full max-w-310 flex-col-reverse items-center gap-48 laptop:flex-row laptop:gap-64">
        <section className="flex w-full min-w-0 flex-1 flex-col">
          <div className="mb-28 flex items-center gap-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/benchud-logo.png" alt="BenchHub" className="h-32" />
            <span aria-hidden="true" className="h-28 w-px bg-dark-glass-border" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-ecopetrol.png" alt="Ecopetrol" className="h-9" />
          </div>
          <p className="mb-16 text-13 font-semibold tracking-wide text-ai-accent">Seguimiento del proyecto</p>
          <h1 className="mb-20 text-display-login text-text-on-dark-heading">Avance del MVP BenchHub, claro y a tiempo</h1>
          <p className="mb-32 max-w-120 text-16 leading-relaxed text-text-on-dark-lead">
            Espacio de seguimiento del MVP BenchHub para Ecopetrol. Consulta las líneas de tiempo, los entregables de cada milestone y lo
            que verás en cada weekly, en un solo entorno.
          </p>
          <ul className="flex flex-col gap-16">
            <Feature icon={<TrendUpIcon size={18} />} title="Líneas de tiempo" subtitle="Milestones y entregables por línea de valor" />
            <Feature icon={<BarChartIcon size={18} />} title="Avance oficial" subtitle="Lo entregado y publicado en cada weekly" />
            <Feature icon={<ClockIcon size={18} />} title="Qué verás y cuándo" subtitle="Agenda de demos por jueves de weekly" />
          </ul>
        </section>

        <div className="flex w-full max-w-105 shrink-0 flex-col gap-18">
          <LoginForm />
          <p className="text-center text-12 text-text-on-dark-caption">Acceso del proyecto · Ecopetrol S.A. · Uso interno</p>
        </div>
      </div>
    </main>
  );
}