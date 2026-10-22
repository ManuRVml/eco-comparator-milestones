"use client";

import { useRef } from "react";
import { GLOSSARY_TERMS } from "@/lib/glossary";

/** Botón de cabecera que abre el glosario en un diálogo nativo (foco atrapado, Esc y retorno de foco incluidos). */
export function GlossaryButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="btn btn-sm glossary-trigger"
        data-testid="header-glossary-button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        Glosario
      </button>
      <dialog
        ref={dialogRef}
        className="glossary-dialog"
        data-testid="glossary-dialog"
        aria-labelledby="glossary-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="glossary-dialog-head">
          <h2 id="glossary-dialog-title">Glosario</h2>
          <button type="button" className="btn btn-sm glossary-trigger" onClick={() => dialogRef.current?.close()}>
            Cerrar
          </button>
        </div>
        <dl className="definition-grid">
          {GLOSSARY_TERMS.map(({ slug, term, definition }) => (
            <div key={slug} data-testid={`glossary-term-${slug}`}>
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      </dialog>
    </>
  );
}
