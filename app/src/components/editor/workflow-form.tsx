"use client";
import { useState, type FormEvent } from "react";
import { usePost } from "./use-post";

export interface Field { name: string; label: string; type?: "text" | "date" | "number" | "checkbox"; options?: readonly (string | { value: string; label: string })[]; value?: string | number | boolean; multiline?: boolean; required?: boolean; min?: number; max?: number; step?: number | "any"; when?: { field: string; equals: string } }
export function WorkflowForm({ title, endpoint, fixed, fields, submit = "Guardar" }: { title: string; endpoint: string; fixed: Record<string, unknown>; fields: Field[]; submit?: string }) {
  const { send, error, busy } = usePost(endpoint);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.name, String(field.value ?? "")] )));
  const [success, setSuccess] = useState(false);
  const key = `${fixed.id}-${fixed.accion}-${title}`;
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget), body: Record<string, unknown> = { ...fixed };
    for (const f of fields) {
      if (f.when && String(data.get(f.when.field) ?? "") !== f.when.equals) continue;
      body[f.name] = f.type === "checkbox" ? data.has(f.name) : f.type === "number" ? (String(data.get(f.name) ?? "").trim() === "" ? null : Number(data.get(f.name))) : data.get(f.name);
    }
    setSuccess(await send(body));
  }
  return <form className="workflow-form" onChange={() => setSuccess(false)} onSubmit={guardar}>
    <fieldset disabled={busy}><legend>{title}</legend>
      {fields.map((f) => <label className="workflow-field" key={f.name} htmlFor={`${key}-${f.name}`} hidden={!!f.when && values[f.when.field] !== f.when.equals}>
        <span>{f.label}</span>
        {f.options ? <select className="select" id={`${key}-${f.name}`} name={f.name} value={values[f.name] || String(f.value ?? (typeof f.options[0] === "string" ? f.options[0] : f.options[0]?.value))} onChange={(event) => setValues((current) => ({ ...current, [f.name]: event.target.value }))}>{f.options.map((v) => { const value = typeof v === "string" ? v : v.value; return <option key={value} value={value}>{typeof v === "string" ? v : v.label}</option>; })}</select>
          : f.multiline ? <textarea id={`${key}-${f.name}`} name={f.name} rows={2} defaultValue={String(f.value ?? "")} required={f.required !== false} maxLength={2000} />
          : <input id={`${key}-${f.name}`} name={f.name} type={f.type ?? "text"} defaultValue={f.type === "checkbox" ? undefined : String(f.value ?? "")} defaultChecked={f.type === "checkbox" ? Boolean(f.value) : undefined} required={f.type === "checkbox" ? false : f.required !== false} maxLength={2000} min={f.type === "number" ? f.min : undefined} max={f.max} step={f.type === "number" ? f.step ?? "any" : undefined} />}
      </label>)}
      <button className="btn btn-primary btn-sm" type="submit">{busy ? "Guardando…" : submit}</button>
    </fieldset>
    {error && <p className="form-error" role="alert">{error}</p>}
    {success && <p className="form-success" role="status" aria-live="polite">Cambios guardados.</p>}
  </form>;
}
