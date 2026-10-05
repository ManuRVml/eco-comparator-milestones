"use client";
import { type FormEvent } from "react";
import { usePost } from "./use-post";

export interface Field { name: string; label: string; type?: "text" | "date" | "number" | "checkbox"; options?: readonly (string | { value: string; label: string })[]; value?: string | number | boolean; multiline?: boolean; required?: boolean; min?: number; max?: number; step?: number | "any" }
export function WorkflowForm({ title, endpoint, fixed, fields, submit = "Guardar" }: { title: string; endpoint: string; fixed: Record<string, unknown>; fields: Field[]; submit?: string }) {
  const { send, error, busy } = usePost(endpoint);
  const key = `${fixed.id}-${fixed.accion}-${title}`;
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget), body: Record<string, unknown> = { ...fixed };
    for (const f of fields) body[f.name] = f.type === "checkbox" ? data.has(f.name) : f.type === "number" ? (String(data.get(f.name) ?? "").trim() === "" ? null : Number(data.get(f.name))) : data.get(f.name);
    await send(body);
  }
  return <form className="workflow-form" onSubmit={guardar}>
    <fieldset disabled={busy}><legend>{title}</legend>
      {fields.map((f) => <label className="workflow-field" key={f.name} htmlFor={`${key}-${f.name}`}>
        <span>{f.label}</span>
        {f.options ? <select className="select" id={`${key}-${f.name}`} name={f.name} defaultValue={String(f.value ?? (typeof f.options[0] === "string" ? f.options[0] : f.options[0]?.value))}>{f.options.map((v) => { const value = typeof v === "string" ? v : v.value; return <option key={value} value={value}>{typeof v === "string" ? v : v.label}</option>; })}</select>
          : f.multiline ? <textarea id={`${key}-${f.name}`} name={f.name} rows={2} defaultValue={String(f.value ?? "")} required={f.required !== false} maxLength={2000} />
          : <input id={`${key}-${f.name}`} name={f.name} type={f.type ?? "text"} defaultValue={f.type === "checkbox" ? undefined : String(f.value ?? "")} defaultChecked={f.type === "checkbox" ? Boolean(f.value) : undefined} required={f.type === "checkbox" ? false : f.required !== false} maxLength={2000} min={f.type === "number" ? f.min : undefined} max={f.max} step={f.type === "number" ? f.step ?? "any" : undefined} />}
      </label>)}
      <button className="btn btn-primary btn-sm" type="submit">{busy ? "Guardando…" : submit}</button>
    </fieldset>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>;
}
