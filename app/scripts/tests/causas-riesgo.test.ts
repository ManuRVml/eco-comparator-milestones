import { test } from "node:test";
import assert from "node:assert/strict";
import { computeModel, vistaCliente } from "../../src/lib/model";
import type { CausaRiesgo, MilestoneRow, Raw, Riesgo, Tarea } from "../../src/lib/model";

const HOY = "2026-10-18";

function tarea(over: Partial<Tarea> & { id: string; nombre: string }): Tarea {
  return {
    sprintId: null,
    fase: null,
    epicaId: null,
    featureId: null,
    historiaId: null,
    descripcion: null,
    rol: null,
    tipoTarea: null,
    areaId: "A",
    fechaInicio: "2026-10-01",
    fechaFin: "2026-10-10",
    duracionDias: 5,
    rutaCritica: false,
    paraleloCon: null,
    diasHabiles: 5,
    publicadoCliente: false,
    fechaPublicacion: null,
    notaPublicacion: null,
    estado: "Pendiente",
    estadoOrigen: "plan",
    visibleCliente: true,
    fechaEstado: null,
    evidencia: null,
    fechaCierre: null,
    creadoEn: "2026-10-01T00:00:00.000Z",
    actualizadoEn: "2026-10-01T00:00:00.000Z",
    ...over,
  };
}

function milestone(over: Partial<MilestoneRow> & { id: string }): MilestoneRow {
  return {
    nombre: over.id,
    descripcion: null,
    lineaId: null,
    sprintId: null,
    fechaObjetivo: "2026-11-01",
    criterio: null,
    orden: 1,
    valorCliente: null,
    sprintsTexto: null,
    epicas: null,
    avanceCodigoPct: null,
    avanceCodigoEvidencia: null,
    estado: "No iniciado",
    estadoOrigen: "plan",
    visibleCliente: true,
    fechaEstado: null,
    evidencia: null,
    fechaCierre: null,
    creadoEn: "2026-10-01T00:00:00.000Z",
    actualizadoEn: "2026-10-01T00:00:00.000Z",
    ...over,
  };
}

function riesgo(over: Partial<Riesgo> & { id: string; descripcion: string }): Riesgo {
  return {
    categoria: null,
    probabilidad: null,
    impacto: null,
    mitigacion: null,
    fuente: null,
    interno: false,
    actualizadoEn: "2026-10-01T00:00:00.000Z",
    ...over,
  };
}

function raw(parts: {
  tareas?: Tarea[];
  riesgos?: Riesgo[];
  msTarea?: { milestoneId: string; tareaId: string }[];
  msRiesgo?: { milestoneId: string; riesgoId: string }[];
  config?: Record<string, string>;
}): Raw {
  return {
    lineas: [],
    areas: [],
    sprints: [],
    festivos: [],
    calendario: [],
    milestones: [milestone({ id: "M-1" })],
    historias: [],
    tareas: parts.tareas ?? [],
    predecesoras: [],
    msHu: [],
    msTarea: parts.msTarea ?? [],
    msDep: [],
    msRiesgo: parts.msRiesgo ?? [],
    riesgos: parts.riesgos ?? [],
    notas: [],
    agendaWeekly: [],
    agendaHu: [],
    base: [],
    config: parts.config ?? {},
  };
}

function causas(model: ReturnType<typeof computeModel>): CausaRiesgo[] {
  return model.milestoneById.get("M-1")!.causasRiesgo;
}

test("una tarea crítica vencida produce una causa técnica con su nombre y fecha", () => {
  const model = computeModel(
    raw({
      tareas: [
        tarea({
          id: "T-1",
          nombre: "Publicar contrato",
          rutaCritica: true,
          fechaFin: "2026-10-01",
          estado: "En curso",
        }),
        tarea({
          id: "T-2",
          nombre: "No crítica",
          rutaCritica: false,
          fechaFin: "2026-10-01",
        }),
        tarea({
          id: "T-3",
          nombre: "Crítica a tiempo",
          rutaCritica: true,
          fechaFin: "2026-10-20",
        }),
        tarea({
          id: "T-4",
          nombre: "Crítica hecha",
          rutaCritica: true,
          fechaFin: "2026-10-01",
          estado: "Hecha",
        }),
      ],
      msTarea: [
        { milestoneId: "M-1", tareaId: "T-1" },
        { milestoneId: "M-1", tareaId: "T-2" },
        { milestoneId: "M-1", tareaId: "T-3" },
        { milestoneId: "M-1", tareaId: "T-4" },
      ],
    }),
    HOY,
  );
  assert.deepEqual(causas(model), [
    {
      tipo: "tecnica",
      texto: "Publicar contrato venció 2026-10-01",
      ref: "T-1",
    },
  ]);
});

test("un riesgo vinculado produce una causa de negocio, con categoría si existe", () => {
  const model = computeModel(
    raw({
      riesgos: [
        riesgo({
          id: "R-1",
          descripcion: "Falta el acceso",
          categoria: "Dependencia",
        }),
        riesgo({ id: "R-2", descripcion: "Sin categoría asignada" }),
      ],
      msRiesgo: [
        { milestoneId: "M-1", riesgoId: "R-1" },
        { milestoneId: "M-1", riesgoId: "R-2" },
      ],
    }),
    HOY,
  );
  assert.deepEqual(causas(model), [
    { tipo: "negocio", texto: "Dependencia: Falta el acceso", ref: "R-1" },
    { tipo: "negocio", texto: "Sin categoría asignada", ref: "R-2" },
  ]);
});

test("la vista cliente oculta el título de una tarea publicada que no es visibleCliente", () => {
  const model = computeModel(
    raw({
      tareas: [
        tarea({
          id: "T-H1",
          nombre: "Secreto uno publicado",
          rutaCritica: true,
          fechaFin: "2026-10-01",
          publicadoCliente: true,
          visibleCliente: false,
        }),
        tarea({
          id: "T-H2",
          nombre: "Secreto dos publicado",
          rutaCritica: true,
          fechaFin: "2026-10-02",
          publicadoCliente: true,
          visibleCliente: false,
        }),
        tarea({
          id: "T-V",
          nombre: "Título visible",
          rutaCritica: true,
          fechaFin: "2026-10-03",
          publicadoCliente: false,
          visibleCliente: true,
        }),
      ],
      msTarea: [
        { milestoneId: "M-1", tareaId: "T-H1" },
        { milestoneId: "M-1", tareaId: "T-H2" },
        { milestoneId: "M-1", tareaId: "T-V" },
      ],
    }),
    HOY,
  );
  assert.equal(
    causas(model).some((c) => c.texto.includes("Secreto uno publicado")),
    true,
  );
  const client = vistaCliente(model);
  const visibles = causas(client);
  assert.equal(JSON.stringify(visibles).includes("Secreto"), false);
  assert.deepEqual(visibles, [
    { tipo: "tecnica", texto: "Título visible venció 2026-10-03", ref: "T-V" },
    { tipo: "tecnica", texto: "2 tareas críticas vencidas" },
  ]);
  assert.equal(visibles[1].ref, undefined);
});

test("riesgos_ecopetrol=0 no deja causas de negocio en la vista cliente", () => {
  const model = computeModel(
    raw({
      riesgos: [riesgo({ id: "R-1", descripcion: "Riesgo externo", interno: false })],
      msRiesgo: [{ milestoneId: "M-1", riesgoId: "R-1" }],
      config: { riesgos_ecopetrol: "0" },
    }),
    HOY,
  );
  assert.equal(
    causas(model).some((c) => c.tipo === "negocio"),
    true,
  );
  const client = vistaCliente(model);
  assert.equal(
    causas(client).some((c) => c.tipo === "negocio"),
    false,
  );
  assert.equal(JSON.stringify(client.milestones).includes("Riesgo externo"), false);
});

test("un riesgo interno no se muestra al cliente ni en la capa oficial", () => {
  const base = raw({
    riesgos: [
      riesgo({
        id: "R-INT",
        descripcion: "Secreto interno",
        categoria: "Interno",
        interno: true,
      }),
      riesgo({ id: "R-PUB", descripcion: "Riesgo público", interno: false }),
    ],
    msRiesgo: [
      { milestoneId: "M-1", riesgoId: "R-INT" },
      { milestoneId: "M-1", riesgoId: "R-PUB" },
    ],
  });
  const tecnica = computeModel(base, HOY, "tecnica");
  assert.equal(
    causas(tecnica).some((c) => c.ref === "R-INT"),
    true,
  );
  const client = vistaCliente(tecnica);
  const textos = JSON.stringify(causas(client));
  assert.equal(textos.includes("Secreto interno"), false);
  assert.equal(textos.includes("R-INT"), false);
  assert.equal(
    causas(client).some((c) => c.ref === "R-PUB"),
    true,
  );

  const oficial = computeModel(base, HOY, "oficial");
  assert.equal(
    causas(oficial).some((c) => c.ref === "R-INT" || c.texto.includes("Secreto interno")),
    false,
  );
  assert.equal(
    causas(oficial).some((c) => c.ref === "R-PUB" && c.texto === "Riesgo público"),
    true,
  );
  const clientOficial = vistaCliente(oficial);
  assert.equal(JSON.stringify(causas(clientOficial)).includes("Secreto interno"), false);
});
