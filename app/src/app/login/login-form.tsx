"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { InfoIcon, UserIcon } from "@/components/icons";
import { loginWithPin, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

/** Tarjeta de vidrio de SCR-01 (LoginForm del arquetipo) con un único campo: el PIN del rol. */
export function LoginForm() {
  const [state, action, pending] = useActionState(loginWithPin, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (state.error) inputRef.current?.focus();
  }, [state.error]);

  return (
    <form
      action={action}
      aria-labelledby={titleId}
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
        <p id="pin-error" role="alert" className="mb-16 rounded-md border border-status-danger-base bg-status-danger-bg px-12 py-10 text-13 text-status-danger-text">
          {state.error}
        </p>
      ) : null}

      <div className="mb-22 flex flex-col gap-6">
        <label htmlFor="pin" className="text-small-medium text-text-on-dark-lead">
          PIN de acceso
        </label>
        <input
          ref={inputRef}
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          minLength={4}
          maxLength={128}
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "pin-error" : undefined}
          placeholder="••••"
          className="w-full rounded-nav border border-dark-input-border bg-dark-input-bg px-14 py-12 text-14 text-text-on-dark-heading outline-none placeholder:text-text-on-dark-caption focus:border-border-focus"
        />
      </div>

      <button
        type="submit"
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