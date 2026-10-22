"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { InfoIcon, UserIcon } from "@/components/icons";
import { loginWithPin, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

/** Icono de alerta de trazo (currentColor) para el mensaje de error; decorativo, el texto ya lo describe. */
function AlertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16h.01" />
    </svg>
  );
}

/** Icono de ojo (mostrar/ocultar PIN); decorativo, el estado lo comunica aria-pressed del botón. */
function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function textoIntentos(restantes: number) {
  if (restantes === 0) return "Próximo fallo bloqueará el acceso temporalmente.";
  return `${restantes === 1 ? "Queda 1 intento" : `Quedan ${restantes} intentos`} antes de un bloqueo temporal.`;
}

/** Tarjeta de vidrio de SCR-01 (LoginForm del arquetipo) con un único campo: el PIN del rol. */
export function LoginForm() {
  const [state, action, pending] = useActionState(loginWithPin, initialState);
  const [mostrarPin, setMostrarPin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (state.error) inputRef.current?.focus();
  }, [state.error]);

  return (
    <form
      action={action}
      aria-labelledby={titleId}
      data-testid="login-form"
      className="flex flex-col rounded-login-card border border-dark-glass-border bg-dark-glass-card p-9 shadow-login-card backdrop-blur-md"
    >
      <div className="mb-26 flex flex-col items-center text-center">
        <span aria-hidden="true" className="mb-18 flex size-13 items-center justify-center rounded-card bg-brand-indigo text-text-inverse">
          <UserIcon size={24} />
        </span>
        <h2 id={titleId} className="mb-4 text-22 font-bold text-text-on-dark-heading">
          Iniciar sesión
        </h2>
        <p className="text-13 text-text-on-dark-lead">Acceso con el PIN de tu rol en el proyecto</p>
      </div>

      {state.error ? (
        <div id="pin-error" role="alert" data-testid="login-error" className="mb-16 flex gap-8 rounded-md border border-status-danger-base bg-status-danger-bg px-12 py-10 text-13 text-status-danger-text">
          <span className="mt-2 shrink-0">
            <AlertIcon />
          </span>
          <div className="flex flex-col gap-2">
            <span>{state.error}</span>
            {state.remaining !== undefined ? (
              <span data-testid="login-attempts" className="text-12">
                {textoIntentos(state.remaining)}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mb-22 flex flex-col gap-6">
        <label htmlFor="pin" className="text-small-medium text-text-on-dark-lead">
          PIN de acceso
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="pin"
            name="pin"
            data-testid="login-pin"
            type={mostrarPin ? "text" : "password"}
            inputMode="numeric"
            autoComplete="current-password"
            minLength={4}
            maxLength={128}
            required
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? "pin-error" : "pin-help"}
            placeholder="••••"
            className="w-full rounded-nav border border-dark-input-border bg-dark-input-bg py-12 pl-14 pr-[48px] text-14 text-text-on-dark-heading outline-none placeholder:text-text-on-dark-caption focus:border-border-focus"
          />
          <button
            type="button"
            data-testid="login-pin-toggle"
            aria-label="Mostrar PIN"
            aria-pressed={mostrarPin}
            onClick={() => setMostrarPin((v) => !v)}
            className="absolute right-6 top-1/2 flex size-36 -translate-y-1/2 items-center justify-center rounded-md text-text-on-dark-lead transition hover:text-text-on-dark-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <EyeIcon />
          </button>
        </div>
        <p id="pin-help" className="text-12 text-text-on-dark-note">
          Si no tienes PIN, contacta al PMO del proyecto
        </p>
      </div>

      <button
        type="submit"
        data-testid="login-submit"
        disabled={pending}
        className="w-full rounded-nav bg-(image:--gradient-login-cta) py-14 text-15 font-semibold text-text-inverse transition hover:brightness-105 disabled:cursor-wait disabled:opacity-80"
      >
        {pending ? "Validando acceso…" : "Ingresar"}
      </button>

      <p className="mt-20 flex gap-10 rounded-md border border-dark-input-border bg-dark-input-bg px-14 py-12 text-12 text-text-on-dark-note">
        <span aria-hidden="true" className="mt-2 shrink-0 text-ai-accent">
          <InfoIcon size={16} />
        </span>
        <span>
          El acceso se valida con el <strong className="font-semibold text-text-on-dark-heading">PIN de tu rol</strong> (Equipo Ecopetrol, editor o
          administrador). Los permisos se asignan automáticamente según el rol.
        </span>
      </p>
    </form>
  );
}
