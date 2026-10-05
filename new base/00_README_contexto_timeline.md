# Contexto para agente IA — Actualización del timeline del proyecto Comparador Financiero / BenchHub (Ecopetrol)

> Leer este archivo primero. Explica qué contiene cada documento, cómo se relacionan, qué fuente manda para cada tipo de dato y dónde se contradicen.
> Fecha de esta conversión: **2026-10-02** (viernes). Según el working plan, a esta fecha está en curso el **Sprint 1 (2026-09-28 → 2026-10-09)**. Ningún documento registra avance real: no asumir tareas completadas.

## 1. Archivos del paquete

| Archivo MD | Fuente original | Qué representa | Úsalo para |
|---|---|---|---|
| `01_propuesta_benchmark_financiero.md` | `Ecopetrol_-_Comparador_Financiero_-_V3.pdf` | **Línea base contractual** (junio 2026): 3 etapas, 18 semanas, 11 perfiles, RF01–RF15, Definition of Ready, presupuesto, riesgos, olas | Alcance comprometido, hitos contractuales, criterios del DoR, roles y dedicaciones, qué está fuera del MVP |
| `02_working_plan_benchhub.md` | `working_plan_BenchHub_1.xlsx` | **Cronograma técnico de ejecución** del MVP "BenchHub": Sprint 0 + 6 sprints, 60 HU / 263 SP, 80 tareas con fechas, hitos H-01…H-07 | **Base principal del timeline**: fechas, tareas, predecesoras, ruta crítica, capacidad, riesgos y supuestos |
| `03_tareas_mvp_ecopetrol.md` | `ecopetrol-mvp-tasks-v1.xlsx` | **Lista de trabajo de definición/planeación y construcción** (54 filas): accesos, validaciones, mapeo de métricas, diccionario, arquitectura, construcción en Databricks | Bloqueantes reales y prerrequisitos que condicionan el working plan; **sin estado ni fechas** |

## 2. Identidad del proyecto

- **Cliente:** Ecopetrol S.A. — Vicepresidencia de Tecnología e Innovación (VTI).
- **Proveedor:** VML / WPP Enterprise Solutions — Contrato Marco 3048550 – CW321794.
- **Nombres usados para lo mismo:** Benchmark Financiero (propuesta) · Comparador Financiero (nombre del PDF y del proyecto internamente) · **BenchHub** (nombre del producto en el working plan).
- **Equipo de ejecución** [contexto adicional del usuario, no proviene de los 3 archivos]: Manuel Rodríguez (Manu) — Líder Técnico; Marco García — Ingeniero de Datos (Ecopetrol); Walter Valdivia — DevOps (VML); Laura Rojas — Frontend (Ecopetrol).

### Equivalencia de roles entre documentos

| Propuesta (11 perfiles) | Working plan (6 roles) | Persona |
|---|---|---|
| Tech Lead MD | Líder Técnico | Manuel Rodríguez |
| Data Engineer MD | Ingeniero de Datos | Marco García |
| DevOps Engineer | DevOps | Walter Valdivia |
| Full Stack / Integration Engineer MD | Desarrollador Frontend + Desarrollador Backend | Laura Rojas (frontend); backend sin nombre en los documentos |
| QA Analyst MD | QA | sin nombre |
| Solution Architect & AI, Product Owner, PM, Consultor Financiero, UX/UI & Data Viz, Strategic Designer | — (no aparecen en el working plan) | — |

## 3. Línea de tiempo unificada

### 3.1 Según la propuesta (semanas relativas, sin fechas)

| Semanas | Etapa | Hito |
|---|---|---|
| S1 | Etapa 00 — Setup | Hito 1: Decisión V1 vs V2 (fin de S1) |
| S2–S6 | Etapa 01 — Exploración y Diseño (incluye Design Sprint y semana de definición ejecutable) | Hito 2: Definition of Ready (fin de S6) |
| S7–S18 | Etapa 02 — MVP, 6 sprints de 2 semanas | Hito 3: MVP entregado (S18) |

### 3.2 Según el working plan (fechas reales)

| Sprint | Fechas | SP | Hito |
|---|---|---|---|
| Sprint 0 | 2026-09-21 → 09-25 | 0 | H-01 Ambientes y arquitectura base (09-25) |
| Sprint 1 | 2026-09-28 → 10-09 | 52 | H-02 Autenticación y navegación (10-09) |
| Sprint 2 | 2026-10-13 → 10-23 | 39 | H-03 Definición del análisis e ingesta (10-23) |
| Sprint 3 | 2026-10-26 → 11-06 | 39 | H-04 Homologación y resultados (11-06) |
| Sprint 4 | 2026-11-09 → 11-20 | 53 | H-05 Monitor de Valor y simulación (11-20) |
| Sprint 5 | 2026-11-23 → 12-04 | 80 | H-06 Presentaciones y Yarbis (12-04) |
| Sprint 6 | 2026-12-07 → 12-18 | 0 | H-07 Salida a producción (12-18) |

Festivos ya descontados: 12-oct, 02-nov, 16-nov, 08-dic.

### 3.3 Cómo encajan

Los documentos **no dicen** qué semana contractual corresponde al 2026-09-21. Dos lecturas posibles, a confirmar con el usuario antes de recalcular:
- **(a)** El Sprint 0 del working plan es la semana 7 del contrato (Setup y Exploración ya ocurrieron) → el MVP termina el 2026-12-18, pero la propuesta prevé 12 semanas de MVP y el plan usa 13 (Sprint 0 + 6×2).
- **(b)** El Sprint 0 coincide con el Setup → el contrato de 18 semanas terminaría a finales de enero de 2027, y la Exploración no estaría planificada en el working plan.

Pista a favor de (a): la lista de tareas (`03`) muestra que todavía hay trabajo de definición (accesos, ROACE, diccionario, DoR) abierto en paralelo a los sprints, lo que sugiere que la Exploración terminó sin cerrar el DoR completo.

## 4. Diferencias críticas entre documentos (verificar antes de actualizar)

| # | Tema | Propuesta (`01`) | Working plan (`02`) | Tareas (`03`) |
|---|---|---|---|---|
| 1 | **Stack de aplicación** | Streamlit como Databricks App, sin servidor propio ni CI/CD externo | React + Vite, BFF Express, OpenAPI, Azure DevOps CI/CD, Databricks Apps como hosting | Databricks Apps (frontend) conectado a Gold vía SQL Warehouse y a Lakebase |
| 2 | **Base transaccional** | No se menciona (persistencia vía medallion/Unity Catalog) | Lakebase (PostgreSQL) desde Sprint 0 (T-003) y usada en varios sprints | #12: Lakebase en estado "No sigue (se evalúan alternativas)", pendiente de decisión de Manuel; #16 "Baselake" (errata probable) |
| 3 | **Paso a producción** | No pasa por el proceso formal de paso a producción de Ecopetrol | Pipeline de despliegue a PRD (T-079) y validación en PRD (T-078, T-080) | — |
| 4 | **Alcance funcional** | RF01–RF15 (ingesta, mapeo, cálculo, dashboard, exportación, narrativa IA) | 60 HU en 11 épicas, incluye Monitor de Valor (E8), Sensibilidades/simulación (E9), Presentaciones PPTX (E11), Notificaciones (E12), asistente Yarbis (E13) | Ingesta Bronze/Silver/Gold, motores de homologación y cálculo, gobernanza de IA |
| 5 | **Simulación what-if / Monitor de Valor** | Explícitamente **fuera de alcance** (Ola 3 o posterior) | **Dentro**: HU-059 a HU-065 (palancas, escenarios, ROACE before/after, simulador de pesos) en Sprints 4–5 | — |
| 6 | **Fuentes** | MVP = Capital IQ + carga manual Ecopetrol/ISA; Bloomberg, Bloomberg NEF y Wood Mackenzie fuera | Capital IQ (conectores en Sprint 2) y Bloomberg mencionado en el paso de confirmación de fuentes (T-028) | Capital IQ sin credenciales técnicas aún; se evalúa adelantar Bloomberg; Wood Mackenzie no conectable; nuevas fuentes: Artemisa, Hyperion, Átomo, SEC EDGAR, BI Control y Reportes |
| 7 | **Definition of Ready** | Debe estar completo **antes** del Sprint 1 (incluye ROACE/EBITDA cerrados y accesos confirmados) | Supuestos S-01 (accesos habilitados al inicio de Sprint 0) y S-02 (fórmulas no cambian) | DoR aún en construcción (#38); ROACE/EBITDA sin firma (#21); accesos clave pendientes (#1, #2, #3, #6, #7) |
| 8 | **QA** | Desde Sprint 3 del MVP | Desde 2026-09-28 (Sprint 1) | #51–#53 QA de datos, revisión financiera, auditoría SFC/BVC |
| 9 | **DevOps** | Parcial en Sprints 1–2 y 5–6 | Solo tareas en Sprint 0 y Sprint 6; ocupación 75 % (2 h diarias) | — |
| 10 | **Duración** | 18 semanas totales (células facturadas suman 17) | 13 semanas; el `Resumen` dice "18 semanas" | — |
| 11 | **Unidad de alcance** | Requerimientos RF | Historias de usuario HU + Story Points | Tareas sin estimación |

## 5. Riesgos que impactan directamente el timeline

1. **Accesos y credenciales (R-01 del plan, #1–#11 de tareas):** sin credenciales técnicas de Capital IQ ni egress a Internet desde Databricks, T-029 (conectores Capital IQ, Sprint 2, ruta crítica) y todo lo que depende de él (T-031, T-034, H-03, H-04) se retrasa. Contingencia prevista: carga manual en Landing Zone.
2. **ROACE/EBITDA sin definición firmada (#15, #21, #25, #28):** afecta el motor de cálculo (#45), HU-063 "Comparar ROACE before/after" (Sprint 5) y el cálculo del Monitor de Valor. En la propuesta es bloqueante.
3. **Decisión Lakebase (#12):** el plan la usa desde Sprint 0 (T-003) y en T-019 (máquina de estados). Si se descarta, hay que replanear modelo transaccional, T-003, T-019 y la configuración de #50.
4. **Sprint 5 sobrecargado:** 80 SP, 17 HU, 13 tareas de frontend; candidato natural para mover HU a Sprint 6 o a R2.
5. **Alcance mayor al contratado:** Monitor de Valor, simulación, presentaciones y Yarbis no están en los RF de la propuesta; cualquier recorte debería empezar por ahí si el timeline se aprieta (validar con el usuario).
6. **Dependencia de ISA:** datos llegan tarde o no llegan (riesgo alto en la propuesta; supuesto S-05 en el plan).

## 6. Reglas para el agente al actualizar el timeline

- Tomar **el working plan como fuente de verdad de fechas y tareas**; la propuesta como fuente de verdad de **compromisos contractuales e hitos**; la lista de tareas como fuente de **prerrequisitos y bloqueantes**.
- Respetar el esquema y valores permitidos del `Diccionario_Columnas` (sección 11 de `02`). Valores válidos de `Estado_Plan`: `Planificada`, `En riesgo`, `Recortada`, `Sugerida R2`.
- Recalcular días hábiles con lunes–viernes menos `Tabla_Festivos`, y SP por sprint sumando las HU asignadas.
- Las predecesoras del plan **no son fin-a-inicio estrictas** (muchas tareas arrancan antes de que termine su predecesora; ver sección 12 de `02`). No "corregirlas" automáticamente sin que el usuario lo pida.
- HU-023 no tiene tarea asociada: si se actualiza el cronograma, señalarlo o crear la tarea.
- No asumir estado de avance: ninguno de los tres archivos registra tareas completadas.
- Cuando un cambio contradiga la propuesta (por ejemplo, alcance o duración), señalarlo explícitamente en lugar de resolverlo en silencio.
