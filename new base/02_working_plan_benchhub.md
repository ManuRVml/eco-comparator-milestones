# Working Plan BenchHub — Cronograma técnico del MVP (Ecopetrol)

> **Origen:** `working_plan_BenchHub_1.xlsx` (10 hojas). Conversión fiel a Markdown para consumo de un agente IA que actualiza el timeline del proyecto.
> **Convenciones de esta conversión:**
> - Las fechas venían como número serial de Excel; aquí están convertidas a ISO `AAAA-MM-DD` con el día de la semana.
> - `N/A` se conserva tal como aparece en el origen.
> - Listas de IDs en el origen van separadas por `;` y así se conservan.
> - En el Excel, `Dias_Habiles`, `SP_Comprometidos` (Tabla_Sprints) y `Duracion_Dias` (Tabla_Cronograma) **son fórmulas** que dependen de fechas, `Tabla_Festivos` y `Tabla_Asignacion_HU`. Si el agente cambia fechas o asignaciones, debe recalcular esos campos con la misma lógica (días hábiles lun–vie excluyendo festivos; suma de SP de las HU del sprint).
> - La sección final **"Observaciones de consistencia"** no existe en el Excel: la generó la conversión verificando los datos, para que el agente sepa dónde hay holguras o contradicciones.

---

## 1. Resumen (hoja `Resumen`)
**Resumen_Ejecutivo:** El presente cronograma técnico detalla la planificación del Producto Mínimo Viable (MVP) para la plataforma BenchHub en Ecopetrol. Con un período de ejecución de 7 sprints  distribuidos en un Sprint 0 de alistamiento y 6 sprints de desarrollo, se estructuran las actividades para cumplir con el alcance acordado de 60 Historias de Usuario (60 HU) y 263 Story Points (263 SP). La estrategia prioriza los cimientos técnicos y de seguridad en el Sprint 0 y Sprint 1, seguidos de la definición e ingesta de datos en el Sprint 2, la homologación y cálculo de resultados en el Sprint 3, el Monitor de Valor y Sensibilidades en el Sprint 4 y Sprint 5, reservando el Sprint 6 para estabilización, pruebas integrales y despliegue a producción.

**Conclusion_Capacidad:** El desarrollo completo de las 60 Historias de Usuario del MVP es viable dentro de las 18 semanas de ejecución. Se identifica una alta concentración de esfuerzo en el Sprint 5 (80 SP), por lo que se requiere un estricto balanceo de tareas paralelas entre frontend, backend e ingeniería de datos. La incorporación tardía del rol QA desde el 28/09/2026 exige una ejecución de pruebas continuas durante cada sprint para evitar cuellos de botella al cierre del proyecto.

**Alcance_MVP:** 60 Historias de Usuario (263 Story Points)

**Estructura_Sprints:** Sprint 0 (alistamiento) y 6 Sprints de desarrollo de 2 semanas


## 2. Datos clave derivados
- **Producto:** BenchHub (MVP de benchmark/comparador financiero para Ecopetrol).
- **Inicio del cronograma:** 2026-09-21 (Lun) (Sprint 0).
- **Fin del cronograma / salida a producción (H-07):** 2026-12-18 (Vie).
- **Duración calendario:** 13 semanas (Sprint 0 de 1 semana + 6 sprints de 2 semanas). Nota: el `Resumen` habla de "18 semanas de ejecución"; ver observaciones.
- **Alcance:** 60 HU MVP = 263 SP. 5 HU adicionales marcadas `R2` (18 SP) sugeridas si sobra capacidad.
- **Roles del plan (6):** DevOps, Ingeniero de Datos, Desarrollador Frontend, Desarrollador Backend, Líder Técnico, QA.
- **Stack declarado en las tareas:** Databricks Apps (hosting), Lakebase (PostgreSQL transaccional), React + Vite (frontend con UI kit corporativo), BFF en Express (contratos OpenAPI), Microsoft Entra ID (SSO OIDC), Azure DevOps (repos y CI/CD), Databricks jobs para cálculo, Model Serving / Azure AI Foundry para el asistente IA "Yarbis", python-pptx para exportación de presentaciones, Plotly/Recharts para gráficos.
- **Ambientes mencionados:** DEV (T-007) y PRD (T-078, T-079).

## 3. Festivos considerados (hoja `Tabla_Festivos`)

Calendario Colombia; se excluyen del cálculo de días hábiles.

| Fecha | Dia_Semana | Festividad |
|---|---|---|
| 2026-10-12 | Lunes | Día de la Raza |
| 2026-11-02 | Lunes | Día de todos los Santos |
| 2026-11-16 | Lunes | Independencia de Cartagena |
| 2026-12-08 | Martes | Inmaculada Concepción |

## 4. Sprints (hoja `Tabla_Sprints`)

| Sprint | Fecha_Inicio | Fecha_Fin | Dias_Habiles | SP_Comprometidos | Epicas | Objetivo |
|---|---|---|---|---|---|---|
| Sprint 0 | 2026-09-21 (Lun) | 2026-09-25 (Vie) | 5 | 0 | E1;E14 | Alistamiento técnico, arquitectura base, ambientes en Databricks Apps, modelo Lakebase e integración Entra ID. |
| Sprint 1 | 2026-09-28 (Lun) | 2026-10-09 (Vie) | 10 | 52 | E1;E2;E4;E5 | Implementar autenticación, roles, navegación por perfil, seguimiento operativo e inicio de definición del análisis. |
| Sprint 2 | 2026-10-13 (Mar) | 2026-10-23 (Vie) | 9 | 39 | E5;E13 | Completar wizard de definición del análisis, selección de competidores e indicadores, confirmación de fuentes y generación. |
| Sprint 3 | 2026-10-26 (Lun) | 2026-11-06 (Vie) | 9 | 39 | E6;E7 | Ejecutar cálculo de cobertura, homologación de datos, navegación por categoría, comparativos gráficos y dashboard visual. |
| Sprint 4 | 2026-11-09 (Lun) | 2026-11-20 (Vie) | 9 | 53 | E7;E8;E9 | Implementar configuración del Monitor de Valor, tabla de KVIs, cumplimiento global, ranking y simulación de palancas reales. |
| Sprint 5 | 2026-11-23 (Lun) | 2026-12-04 (Vie) | 10 | 80 | E9;E11;E12;E13 | Desarrollar escenarios de sensibilidades, simulador de pesos, módulo de presentaciones, notificaciones y asistente Yarbis. |
| Sprint 6 | 2026-12-07 (Lun) | 2026-12-18 (Vie) | 9 | 0 | E1;E11;E12;E13 | Estabilización del sistema, corrección de defectos, pruebas integrales de regresión y despliegue final a producción. |

**Total SP comprometidos:** 263.

**Notas de calendario:** Sprint 2 arranca martes 2026-10-13 por el festivo del lunes 12-oct. Sprint 3 pierde el 02-nov, Sprint 4 el 16-nov y Sprint 6 el 08-dic (festivos).

### 4.1 HU incluidas por sprint

- **Sprint 0:** N/A
- **Sprint 1:** HU-001;HU-002;HU-003;HU-004;HU-005;HU-006;HU-008;HU-010;HU-018;HU-019;HU-020;HU-021;HU-022;HU-023
- **Sprint 2:** HU-024;HU-025;HU-026;HU-027;HU-028;HU-029;HU-030;HU-031;HU-085
- **Sprint 3:** HU-032;HU-033;HU-035;HU-036;HU-037;HU-039;HU-041;HU-042;HU-043
- **Sprint 4:** HU-046;HU-047;HU-048;HU-050;HU-051;HU-052;HU-053;HU-054;HU-059;HU-060;HU-061
- **Sprint 5:** HU-062;HU-063;HU-064;HU-065;HU-072;HU-073;HU-074;HU-075;HU-076;HU-077;HU-078;HU-079;HU-080;HU-082;HU-083;HU-084;HU-087
- **Sprint 6:** N/A

## 5. Asignación de Historias de Usuario (hoja `Tabla_Asignacion_HU`)

### 5.1 Épicas y features (derivado)

| Épica | Nombre | HU MVP | SP MVP | Sprints | HU R2 |
|---|---|---|---|---|---|
| E1 | Acceso y Seguridad | 4 | 18 | Sprint 1 | 0 |
| E2 | Dashboard Estratégico | 4 | 14 | Sprint 1 | 3 |
| E4 | Gestión de Análisis | 3 | 11 | Sprint 1 | 0 |
| E5 | Definición del Análisis | 11 | 45 | Sprint 1, Sprint 2 | 0 |
| E6 | Resultados y Homologación | 6 | 26 | Sprint 3 | 2 |
| E7 | Visualización | 4 | 16 | Sprint 3, Sprint 4 | 0 |
| E8 | Monitor de Valor | 7 | 34 | Sprint 4 | 0 |
| E9 | Sensibilidades | 7 | 37 | Sprint 4, Sprint 5 | 0 |
| E11 | Presentaciones | 8 | 34 | Sprint 5 | 0 |
| E12 | Notificaciones | 2 | 7 | Sprint 5 | 0 |
| E13 | Asistente Yarbis | 4 | 21 | Sprint 2, Sprint 5 | 0 |

Épicas referenciadas en sprints pero sin HU en la tabla: **E14** (Sprint 0, alistamiento técnico). E3 y E10 no aparecen en ninguna hoja.

### 5.2 Features

| Feature_ID | Feature | Epica_ID |
|---|---|---|
| F1.1 | Autenticación corporativa | E1 |
| F1.2 | Roles y permisos | E1 |
| F2.1 | Resumen ejecutivo | E2 |
| F2.2 | Panorama de mercado en inicio | E2 |
| F2.3 | Análisis habilitados y accesos rápidos | E2 |
| F2.4 | Seguimiento operativo | E2 |
| F4.1 | Listado de análisis | E4 |
| F4.2 | Estados del análisis | E4 |
| F5.1 | Información general | E5 |
| F5.2 | Selección de competidores | E5 |
| F5.3 | Selección de indicadores | E5 |
| F5.4 | Fuentes de datos | E5 |
| F5.5 | Validación y generación | E5 |
| F6.1 | Cobertura y homologación | E6 |
| F6.2 | Resultados por categoría | E6 |
| F6.3 | Comparativo y ponderación | E6 |
| F6.4 | Reporte y hallazgos | E6 |
| F7.1 | Panorama comparativo | E7 |
| F7.2 | Exploración por categoría | E7 |
| F7.4 | Publicación | E7 |
| F8.1 | Configuración del monitor | E8 |
| F8.2 | KPIs y cumplimiento | E8 |
| F8.3 | Peso y ranking | E8 |
| F9.1 | Palancas reales | E9 |
| F9.2 | Escenarios y variables | E9 |
| F9.3 | Simulador de pesos | E9 |
| F11.1 | Gestión de presentaciones | E11 |
| F11.2 | Creación de presentación | E11 |
| F11.3 | Publicación y distribución | E11 |
| F12.1 | Centro de notificaciones | E12 |
| F13.1 | Asistente transversal | E13 |
| F13.2 | Sugerencias contextuales | E13 |

### 5.3 Tabla completa de HU

| HU_ID | HU_Nombre | Epica_ID | Feature_ID | Prioridad | SP | Sprint | Estado_Plan | Dependencias_HU | Justificacion |
|---|---|---|---|---|---|---|---|---|---|
| HU-001 | Autenticar usuarios | E1 | F1.1 | MVP | 5 | Sprint 1 | Planificada | N/A | N/A |
| HU-002 | Seleccionar contexto de acceso | E1 | F1.1 | MVP | 3 | Sprint 1 | Planificada | HU-001 | N/A |
| HU-003 | Cambiar de rol / vista | E1 | F1.2 | MVP | 5 | Sprint 1 | Planificada | HU-001 | N/A |
| HU-004 | Restringir acceso por rol | E1 | F1.2 | MVP | 5 | Sprint 1 | Planificada | HU-001;HU-003 | N/A |
| HU-005 | Visualizar resumen ejecutivo | E2 | F2.1 | MVP | 3 | Sprint 1 | Planificada | HU-001;HU-004 | N/A |
| HU-006 | Visualizar indicadores de mercado | E2 | F2.2 | MVP | 3 | Sprint 1 | Planificada | HU-001 | N/A |
| HU-008 | Visualizar análisis habilitados | E2 | F2.3 | MVP | 3 | Sprint 1 | Planificada | HU-004;HU-018 | N/A |
| HU-010 | Visualizar pendientes | E2 | F2.4 | MVP | 5 | Sprint 1 | Planificada | HU-004 | N/A |
| HU-018 | Listar análisis | E4 | F4.1 | MVP | 3 | Sprint 1 | Planificada | HU-004 | N/A |
| HU-019 | Consultar detalle de análisis | E4 | F4.1 | MVP | 3 | Sprint 1 | Planificada | HU-018 | N/A |
| HU-020 | Visualizar estado del análisis | E4 | F4.2 | MVP | 5 | Sprint 1 | Planificada | HU-018 | N/A |
| HU-021 | Seleccionar tipo de análisis | E5 | F5.1 | MVP | 3 | Sprint 1 | Planificada | HU-018 | N/A |
| HU-022 | Registrar objetivo y pregunta | E5 | F5.1 | MVP | 3 | Sprint 1 | Planificada | HU-021 | N/A |
| HU-023 | Configurar periodo y alcance | E5 | F5.1 | MVP | 3 | Sprint 1 | Planificada | HU-021 | N/A |
| HU-024 | Seleccionar competidores | E5 | F5.2 | MVP | 5 | Sprint 2 | Planificada | HU-021;HU-023 | N/A |
| HU-025 | Filtrar competidores por línea de negocio | E5 | F5.2 | MVP | 2 | Sprint 2 | Planificada | HU-024 | N/A |
| HU-026 | Sugerir competidores con IA | E5 | F5.2 | MVP | 5 | Sprint 2 | Planificada | HU-024 | N/A |
| HU-027 | Seleccionar indicadores de pares | E5 | F5.3 | MVP | 5 | Sprint 2 | Planificada | HU-021;HU-024 | N/A |
| HU-028 | Seleccionar indicadores TBG / ILP | E5 | F5.3 | MVP | 5 | Sprint 2 | Planificada | HU-021;HU-024 | N/A |
| HU-029 | Confirmar fuentes de datos | E5 | F5.4 | MVP | 3 | Sprint 2 | Planificada | HU-027;HU-028 | N/A |
| HU-030 | Validar configuración del análisis | E5 | F5.5 | MVP | 3 | Sprint 2 | Planificada | HU-029 | N/A |
| HU-031 | Generar análisis | E5 | F5.5 | MVP | 8 | Sprint 2 | Planificada | HU-030 | N/A |
| HU-032 | Calcular cobertura de datos | E6 | F6.1 | MVP | 5 | Sprint 3 | Planificada | HU-031 | N/A |
| HU-033 | Visualizar cobertura por compañía | E6 | F6.1 | MVP | 5 | Sprint 3 | Planificada | HU-032 | N/A |
| HU-035 | Navegar resultados por categoría | E6 | F6.2 | MVP | 5 | Sprint 3 | Planificada | HU-031 | N/A |
| HU-036 | Comparar indicador vs. pares | E6 | F6.2 | MVP | 3 | Sprint 3 | Planificada | HU-035 | N/A |
| HU-037 | Graficar comparativo GE vs. pares | E6 | F6.3 | MVP | 5 | Sprint 3 | Planificada | HU-035 | N/A |
| HU-039 | Exportar resumen a Excel | E6 | F6.4 | MVP | 3 | Sprint 3 | Planificada | HU-035 | N/A |
| HU-041 | Visualizar KPIs por dimensión | E7 | F7.1 | MVP | 5 | Sprint 3 | Planificada | HU-037 | N/A |
| HU-042 | Rankear compañías por categoría | E7 | F7.1 | MVP | 5 | Sprint 3 | Planificada | HU-035 | N/A |
| HU-043 | Explorar indicadores por categoría | E7 | F7.2 | MVP | 3 | Sprint 3 | Planificada | HU-041 | N/A |
| HU-046 | Generar presentación desde dashboard | E7 | F7.4 | MVP | 3 | Sprint 4 | Planificada | HU-041 | N/A |
| HU-047 | Configurar fechas y fuentes del monitor | E8 | F8.1 | MVP | 5 | Sprint 4 | Planificada | HU-004 | N/A |
| HU-048 | Seleccionar indicadores del monitor | E8 | F8.1 | MVP | 5 | Sprint 4 | Planificada | HU-047;HU-027 | N/A |
| HU-050 | Visualizar tabla de KVIs | E8 | F8.2 | MVP | 8 | Sprint 4 | Planificada | HU-048 | N/A |
| HU-051 | Editar meta y real por KVI | E8 | F8.2 | MVP | 5 | Sprint 4 | Planificada | HU-050 | N/A |
| HU-052 | Visualizar cumplimiento global | E8 | F8.2 | MVP | 5 | Sprint 4 | Planificada | HU-050 | N/A |
| HU-053 | Visualizar peso por dimensión | E8 | F8.3 | MVP | 3 | Sprint 4 | Planificada | HU-050 | N/A |
| HU-054 | Rankear pares por indicador | E8 | F8.3 | MVP | 3 | Sprint 4 | Planificada | HU-050 | N/A |
| HU-059 | Simular palancas reales | E9 | F9.1 | MVP | 8 | Sprint 4 | Planificada | HU-050 | N/A |
| HU-060 | Visualizar fórmula del indicador | E9 | F9.1 | MVP | 3 | Sprint 4 | Planificada | HU-059 | N/A |
| HU-061 | Comparar base vs. simulado | E9 | F9.1 | MVP | 5 | Sprint 4 | Planificada | HU-059 | N/A |
| HU-062 | Ajustar variables de escenario | E9 | F9.2 | MVP | 5 | Sprint 5 | Planificada | HU-059 | N/A |
| HU-063 | Comparar ROACE before / after | E9 | F9.2 | MVP | 3 | Sprint 5 | Planificada | HU-062 | N/A |
| HU-064 | Ajustar pesos por indicador | E9 | F9.3 | MVP | 8 | Sprint 5 | Planificada | HU-053 | N/A |
| HU-065 | Restablecer pesos | E9 | F9.3 | MVP | 5 | Sprint 5 | Planificada | HU-064 | N/A |
| HU-072 | Listar presentaciones | E11 | F11.1 | MVP | 3 | Sprint 5 | Planificada | HU-004 | N/A |
| HU-073 | Editar presentación | E11 | F11.1 | MVP | 5 | Sprint 5 | Planificada | HU-072 | N/A |
| HU-074 | Crear presentación | E11 | F11.2 | MVP | 3 | Sprint 5 | Planificada | HU-046 | N/A |
| HU-075 | Seleccionar tipo de presentación | E11 | F11.2 | MVP | 5 | Sprint 5 | Planificada | HU-074 | N/A |
| HU-076 | Seleccionar slides a incluir | E11 | F11.2 | MVP | 3 | Sprint 5 | Planificada | HU-075 | N/A |
| HU-077 | Previsualizar presentación | E11 | F11.3 | MVP | 5 | Sprint 5 | Planificada | HU-076 | N/A |
| HU-078 | Descargar presentación | E11 | F11.3 | MVP | 5 | Sprint 5 | Planificada | HU-077;HU-039 | N/A |
| HU-079 | Publicar y compartir presentación | E11 | F11.3 | MVP | 5 | Sprint 5 | Planificada | HU-077;HU-020 | N/A |
| HU-080 | Listar notificaciones | E12 | F12.1 | MVP | 5 | Sprint 5 | Planificada | HU-001 | N/A |
| HU-082 | Visualizar notificaciones no leídas | E12 | F12.1 | MVP | 2 | Sprint 5 | Planificada | HU-080 | N/A |
| HU-083 | Habilitar asistente Yarbis | E13 | F13.1 | MVP | 8 | Sprint 5 | Planificada | HU-001 | N/A |
| HU-084 | Detectar cambios relevantes con IA | E13 | F13.1 | MVP | 5 | Sprint 5 | Planificada | HU-083 | N/A |
| HU-085 | Sugerir competidores de forma contextual | E13 | F13.2 | MVP | 3 | Sprint 2 | Planificada | HU-026 | N/A |
| HU-087 | Trazar contenido generado por IA | E13 | F13.2 | MVP | 5 | Sprint 5 | Planificada | HU-083 | N/A |
| HU-007 | Visualizar noticias recientes | E2 | F2.2 | R2 | 3 | N/A | Sugerida R2 | HU-014 | Sugerida si sobra capacidad |
| HU-009 | Acceder a presentaciones recientes | E2 | F2.3 | R2 | 2 | N/A | Sugerida R2 | HU-072 | Sugerida si sobra capacidad |
| HU-011 | Visualizar actividad reciente | E2 | F2.4 | R2 | 3 | N/A | Sugerida R2 | HU-001 | Sugerida si sobra capacidad |
| HU-034 | Gestionar indicadores faltantes | E6 | F6.1 | R2 | 5 | N/A | Sugerida R2 | HU-032 | Sugerida si sobra capacidad |
| HU-038 | Editar composición de pesos | E6 | F6.3 | R2 | 5 | N/A | Sugerida R2 | HU-035 | Sugerida si sobra capacidad |

**Resumen SP por sprint (HU MVP):** Sprint 1 = 14 HU / 52 SP · Sprint 2 = 9 / 39 · Sprint 3 = 9 / 39 · Sprint 4 = 11 / 53 · Sprint 5 = 17 / 80 · Sprints 0 y 6 = sin HU (0 SP).

## 6. Cronograma de tareas (hoja `Tabla_Cronograma`)

80 tareas (T-001 a T-080). Cada tarea tiene un único rol responsable. `Ruta_Critica = Sí` marca la ruta crítica.

### Sprint 0 — 2026-09-21 (Lun) → 2026-09-25 (Vie)

*Objetivo:* Alistamiento técnico, arquitectura base, ambientes en Databricks Apps, modelo Lakebase e integración Entra ID.

| ID_Tarea | Fase | Epica_ID | Feature_ID | HU_ID | Tarea | Descripcion | Rol | Tipo_Tarea | Inicio | Fin | Días | Predecesoras | RC | Paralelo_Con |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T-001 | Alistamiento | E1 | F1.1 | N/A | Configurar arquitectura base Databricks Apps | Aprovisionar el workspace y la infraestructura en nube. | DevOps | Infraestructura | 2026-09-21 | 2026-09-25 | 5 | N/A | Sí | T-002;T-003 |
| T-002 | Alistamiento | E1 | F1.1 | N/A | Configurar repositorios y pipelines CI CD | Establecer repositorios en Azure DevOps y flujos de integración. | DevOps | Infraestructura | 2026-09-21 | 2026-09-25 | 5 | N/A | No | T-001;T-003 |
| T-003 | Alistamiento | E1 | F1.1 | N/A | Diseñar modelo relacional en Lakebase | Crear las tablas transaccionales base PostgreSQL en Lakebase. | Ingeniero de Datos | Datos | 2026-09-21 | 2026-09-25 | 5 | N/A | Sí | T-001;T-002 |
| T-004 | Alistamiento | E1 | F1.1 | N/A | Configurar autenticación Microsoft Entra ID | Habilitar el protocolo OIDC para inicio de sesión único. | Desarrollador Backend | Backend | 2026-09-21 | 2026-09-25 | 5 | N/A | Sí | T-001 |
| T-005 | Alistamiento | E1 | F1.1 | N/A | Inicializar proyecto React Vite frontend | Estructurar el repositorio frontend con el UI kit corporativo. | Desarrollador Frontend | Frontend | 2026-09-21 | 2026-09-25 | 5 | N/A | No | T-001 |
| T-006 | Alistamiento | E1 | F1.1 | N/A | Definir arquitectura y contratos de API | Establecer la especificación OpenAPI entre frontend y BFF Express. | Líder Técnico | Arquitectura | 2026-09-21 | 2026-09-25 | 5 | N/A | Sí | T-001;T-003;T-004 |

### Sprint 1 — 2026-09-28 (Lun) → 2026-10-09 (Vie)

*Objetivo:* Implementar autenticación, roles, navegación por perfil, seguimiento operativo e inicio de definición del análisis.

| ID_Tarea | Fase | Epica_ID | Feature_ID | HU_ID | Tarea | Descripcion | Rol | Tipo_Tarea | Inicio | Fin | Días | Predecesoras | RC | Paralelo_Con |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T-007 | Pruebas | N/A | N/A | N/A | Validar ambientes DEV de backend y frontend | Verificar conectividad y despliegue inicial en Databricks Apps. | QA | Pruebas | 2026-09-28 | 2026-09-29 | 2 | T-001;T-004;T-005 | Sí | T-008 |
| T-008 | Desarrollo | E1 | F1.1 | HU-001 | Implementar login con Directorio Activo | Desarrollar el endpoint de autenticación y validación de tokens AD. | Desarrollador Backend | Backend | 2026-09-28 | 2026-10-02 | 5 | T-004 | Sí | T-007;T-009 |
| T-009 | Desarrollo | E1 | F1.1 | HU-001 | Construir pantalla de Login UI | Diseñar la interfaz de ingreso corporativo con mensajes de error. | Desarrollador Frontend | Frontend | 2026-09-28 | 2026-10-02 | 5 | T-005 | No | T-008 |
| T-010 | Desarrollo | E1 | F1.1 | HU-002 | Construir selector de contexto de acceso | Desarrollar pantalla para elegir la vista de la herramienta. | Desarrollador Frontend | Frontend | 2026-10-05 | 2026-10-07 | 3 | T-009 | No | T-011 |
| T-011 | Desarrollo | E1 | F1.2 | HU-003 | Implementar selector de rol en header | Crear componente en cabecera para alternar roles de usuario. | Desarrollador Frontend | Frontend | 2026-10-05 | 2026-10-08 | 4 | T-009 | No | T-010;T-012 |
| T-012 | Desarrollo | E1 | F1.2 | HU-004 | Implementar RBAC en backend y middleware | Validar permisos por rol en cada ruta y consulta de Express. | Desarrollador Backend | Backend | 2026-10-05 | 2026-10-09 | 5 | T-008 | Sí | T-011 |
| T-013 | Desarrollo | E2 | F2.1 | HU-005 | Construir tarjetas de resumen ejecutivo | Diseñar métricas agregadas de análisis en pantalla de Inicio. | Desarrollador Frontend | Frontend | 2026-10-07 | 2026-10-09 | 3 | T-010 | No | T-014 |
| T-014 | Desarrollo | E2 | F2.2 | HU-006 | Integrar indicadores de mercado en Inicio | Consumir precios de Brent TRM y accionarios para vista inicial. | Desarrollador Backend | Backend | 2026-10-07 | 2026-10-09 | 3 | T-012 | No | T-013 |
| T-015 | Desarrollo | E2 | F2.3 | HU-008 | Construir tarjetas de análisis habilitados | Renderizar lista de análisis según perfil del usuario. | Desarrollador Frontend | Frontend | 2026-10-08 | 2026-10-09 | 2 | T-011 | No | T-016 |
| T-016 | Desarrollo | E2 | F2.4 | HU-010 | Construir panel de pendientes operativos | Mostrar cola de tareas y alertas con antigüedad en Inicio. | Desarrollador Backend | Backend | 2026-10-08 | 2026-10-09 | 2 | T-012 | No | T-015 |
| T-017 | Desarrollo | E4 | F4.1 | HU-018 | Construir tabla paginada de listado de análisis | Desarrollar interfaz y API de consulta de análisis guardados. | Desarrollador Frontend | Frontend | 2026-10-05 | 2026-10-08 | 4 | T-010 | Sí | T-018 |
| T-018 | Desarrollo | E4 | F4.1 | HU-019 | Implementar consulta detallada del análisis | Habilitar vista de parámetros y metadatos de un análisis. | Desarrollador Backend | Backend | 2026-10-06 | 2026-10-08 | 3 | T-012 | No | T-017 |
| T-019 | Desarrollo | E4 | F4.2 | HU-020 | Implementar máquina de estados del análisis | Gestionar transiciones de borrador a publicado en Lakebase. | Desarrollador Backend | Backend | 2026-10-07 | 2026-10-09 | 3 | T-018 | Sí | T-020 |
| T-020 | Desarrollo | E5 | F5.1 | HU-021 | Construir Paso 1 del wizard de definición | Desarrollar interfaz para seleccionar tipo de análisis. | Desarrollador Frontend | Frontend | 2026-10-07 | 2026-10-09 | 3 | T-017 | Sí | T-019;T-021 |
| T-021 | Desarrollo | E5 | F5.1 | HU-022 | Implementar guardado de objetivo y pregunta | Crear endpoint de persistencia del Paso 1 del wizard. | Desarrollador Backend | Backend | 2026-10-08 | 2026-10-09 | 2 | T-019 | No | T-020 |
| T-022 | Pruebas | E1 | F1.1 | HU-001 | Ejecutar casos de prueba de autenticación y roles | Validar criterios de aceptación de login y restricciones RBAC. | QA | Pruebas | 2026-10-05 | 2026-10-09 | 5 | T-008;T-012 | Sí | T-021 |

### Sprint 2 — 2026-10-13 (Mar) → 2026-10-23 (Vie)

*Objetivo:* Completar wizard de definición del análisis, selección de competidores e indicadores, confirmación de fuentes y generación.

| ID_Tarea | Fase | Epica_ID | Feature_ID | HU_ID | Tarea | Descripcion | Rol | Tipo_Tarea | Inicio | Fin | Días | Predecesoras | RC | Paralelo_Con |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T-023 | Desarrollo | E5 | F5.2 | HU-024 | Construir Paso 2 de selección de competidores | Desarrollar interfaz de tarjetas de compañías por categoría. | Desarrollador Frontend | Frontend | 2026-10-13 | 2026-10-16 | 4 | T-020 | Sí | T-024;T-025 |
| T-024 | Desarrollo | E5 | F5.2 | HU-025 | Implementar filtro por línea de negocio en UI | Filtrar competidores dinámicamente según segmento O&G. | Desarrollador Frontend | Frontend | 2026-10-14 | 2026-10-16 | 3 | T-023 | No | T-023;T-025 |
| T-025 | Desarrollo | E5 | F5.2 | HU-026 | Integrar sugerencias de competidores con IA | Conectar endpoint de Yarbis para recomendar pares relevantes. | Desarrollador Backend | Backend | 2026-10-13 | 2026-10-19 | 5 | T-021 | No | T-023;T-024 |
| T-026 | Desarrollo | E5 | F5.3 | HU-027 | Construir Paso 3 de selección de indicadores de pares | Desarrollar selector de métricas financieras de pares. | Desarrollador Frontend | Frontend | 2026-10-16 | 2026-10-20 | 3 | T-023 | Sí | T-027 |
| T-027 | Desarrollo | E5 | F5.3 | HU-028 | Construir selector de indicadores TBG y ILP | Desarrollar selector de indicadores estratégicos corporativos. | Desarrollador Frontend | Frontend | 2026-10-16 | 2026-10-20 | 3 | T-023 | No | T-026 |
| T-028 | Desarrollo | E5 | F5.4 | HU-029 | Construir Paso 4 de confirmación de fuentes | Interfaz de revisión de fuentes integradas Capital IQ Bloomberg. | Desarrollador Frontend | Frontend | 2026-10-19 | 2026-10-21 | 3 | T-026 | Sí | T-029 |
| T-029 | Datos | E5 | F5.4 | HU-029 | Configurar conectores de ingesta Capital IQ | Establecer pipelines de extracción automática desde fuentes. | Ingeniero de Datos | Datos | 2026-10-13 | 2026-10-21 | 7 | T-003 | Sí | T-028 |
| T-030 | Desarrollo | E5 | F5.5 | HU-030 | Construir Paso 5 de resumen y validación | Interfaz de revisión final antes de ejecutar el análisis. | Desarrollador Frontend | Frontend | 2026-10-21 | 2026-10-22 | 2 | T-028 | Sí | T-031 |
| T-031 | Desarrollo | E5 | F5.5 | HU-031 | Implementar motor de generación asíncrona | Orquestar job de cálculo en Databricks y cambiar estado a construcción. | Desarrollador Backend | Backend | 2026-10-20 | 2026-10-23 | 4 | T-029 | Sí | T-030 |
| T-032 | Desarrollo | E13 | F13.2 | HU-085 | Implementar algoritmo de sugerencias contextuales | Desarrollar lógica de recomendación basada en similitud. | Desarrollador Backend | Backend | 2026-10-19 | 2026-10-22 | 4 | T-025 | No | T-031 |
| T-033 | Pruebas | E5 | F5.1 | HU-021 | Pruebas de integración del wizard de definición | Validar flujos del Paso 1 al Paso 5 y mensajes de error. | QA | Pruebas | 2026-10-19 | 2026-10-23 | 5 | T-030;T-031 | Sí | T-031;T-032 |

### Sprint 3 — 2026-10-26 (Lun) → 2026-11-06 (Vie)

*Objetivo:* Ejecutar cálculo de cobertura, homologación de datos, navegación por categoría, comparativos gráficos y dashboard visual.

| ID_Tarea | Fase | Epica_ID | Feature_ID | HU_ID | Tarea | Descripcion | Rol | Tipo_Tarea | Inicio | Fin | Días | Predecesoras | RC | Paralelo_Con |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T-034 | Datos | E6 | F6.1 | HU-032 | Desarrollar algoritmo de cálculo de cobertura | Calcular porcentaje de datos disponibles vs faltantes por par. | Ingeniero de Datos | Datos | 2026-10-26 | 2026-10-29 | 4 | T-029;T-031 | Sí | T-035 |
| T-035 | Desarrollo | E6 | F6.1 | HU-033 | Construir tarjetas de cobertura por compañía | Renderizar barras de progreso y banderas de falta de dato. | Desarrollador Frontend | Frontend | 2026-10-28 | 2026-10-30 | 3 | T-034 | No | T-034;T-036 |
| T-036 | Desarrollo | E6 | F6.2 | HU-035 | Construir pestaña de navegación por categoría | Interfaz de pastillas de categorías Rentabilidad Liquidez Solvencia. | Desarrollador Frontend | Frontend | 2026-10-26 | 2026-10-29 | 4 | T-031 | Sí | T-037 |
| T-037 | Desarrollo | E6 | F6.2 | HU-036 | Implementar tabla comparativa de indicadores vs pares | Desarrollar grilla de comparación de valores GE y promedio pares. | Desarrollador Frontend | Frontend | 2026-10-29 | 2026-11-03 | 3 | T-036 | Sí | T-038 |
| T-038 | Desarrollo | E6 | F6.3 | HU-037 | Construir gráfico de barras comparativo GE vs pares | Renderizar gráficos comparativos con Plotly Recharts. | Desarrollador Frontend | Frontend | 2026-11-03 | 2026-11-05 | 3 | T-037 | Sí | T-039 |
| T-039 | Desarrollo | E6 | F6.4 | HU-039 | Implementar exportación de resumen a Excel | Generar reporte descargable .xlsx desde el backend Express. | Desarrollador Backend | Backend | 2026-11-03 | 2026-11-06 | 4 | T-037 | No | T-038;T-040 |
| T-040 | Desarrollo | E7 | F7.1 | HU-041 | Construir tarjetas KPI por dimensión en Visualización | Mostrar promedios del sector y brecha de Ecopetrol. | Desarrollador Frontend | Frontend | 2026-11-03 | 2026-11-05 | 3 | T-038 | Sí | T-041 |
| T-041 | Desarrollo | E7 | F7.1 | HU-042 | Construir componente de ranking de compañías | Renderizar tabla ordenada por desempeño en la categoría. | Desarrollador Frontend | Frontend | 2026-11-04 | 2026-11-06 | 3 | T-040 | No | T-042 |
| T-042 | Desarrollo | E7 | F7.2 | HU-043 | Implementar exploración detallada por categoría en dashboard | Sincronizar filtros de categoría entre widgets del dashboard. | Desarrollador Frontend | Frontend | 2026-11-05 | 2026-11-06 | 2 | T-041 | No | T-043 |
| T-043 | Pruebas | E6 | F6.1 | HU-032 | Pruebas de precisión de cálculos y cobertura | Validar exactitud de porcentajes de cobertura y gráficos. | QA | Pruebas | 2026-11-03 | 2026-11-06 | 4 | T-034;T-038 | Sí | T-042 |

### Sprint 4 — 2026-11-09 (Lun) → 2026-11-20 (Vie)

*Objetivo:* Implementar configuración del Monitor de Valor, tabla de KVIs, cumplimiento global, ranking y simulación de palancas reales.

| ID_Tarea | Fase | Epica_ID | Feature_ID | HU_ID | Tarea | Descripcion | Rol | Tipo_Tarea | Inicio | Fin | Días | Predecesoras | RC | Paralelo_Con |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T-044 | Desarrollo | E7 | F7.4 | HU-046 | Implementar botón 'Crear presentación' desde dashboard | Redirigir a creador de presentaciones con datos precargados. | Desarrollador Frontend | Frontend | 2026-11-09 | 2026-11-11 | 3 | T-042 | No | T-045 |
| T-045 | Desarrollo | E8 | F8.1 | HU-047 | Construir panel de configuración del Monitor de Valor | Desarrollar interfaz de parametrización de fechas y fuentes. | Desarrollador Frontend | Frontend | 2026-11-09 | 2026-11-12 | 4 | T-012 | Sí | T-046 |
| T-046 | Desarrollo | E8 | F8.1 | HU-048 | Implementar selector de indicadores del monitor | Permitir elegir métricas del tablero de valor y sus fuentes. | Desarrollador Frontend | Frontend | 2026-11-12 | 2026-11-13 | 2 | T-045 | Sí | T-047 |
| T-047 | Desarrollo | E8 | F8.2 | HU-050 | Construir tabla interactiva de KVIs con semáforos | Renderizar grilla de indicadores de valor con colores de estado. | Desarrollador Frontend | Frontend | 2026-11-13 | 2026-11-18 | 3 | T-046 | Sí | T-048 |
| T-048 | Desarrollo | E8 | F8.2 | HU-051 | Implementar edición inline de Meta y Real por KVI | Permitir modificar valores directamente en la tabla con guardado. | Desarrollador Frontend | Frontend | 2026-11-17 | 2026-11-19 | 3 | T-047 | Sí | T-049 |
| T-049 | Desarrollo | E8 | F8.2 | HU-052 | Implementar cálculo de porcentaje de cumplimiento global | Desarrollar API de agregación de cumplimiento de KVIs. | Desarrollador Backend | Backend | 2026-11-17 | 2026-11-20 | 4 | T-048 | Sí | T-050 |
| T-050 | Desarrollo | E8 | F8.3 | HU-053 | Construir gráfico de distribución de peso por dimensión | Renderizar barra apilada de pesos Financiero Operativo Transversal. | Desarrollador Frontend | Frontend | 2026-11-18 | 2026-11-20 | 3 | T-047 | No | T-049;T-051 |
| T-051 | Desarrollo | E8 | F8.3 | HU-054 | Construir ranking de pares por KVI | Renderizar lista ordenada de competidores por indicador del monitor. | Desarrollador Frontend | Frontend | 2026-11-18 | 2026-11-20 | 3 | T-047 | No | T-050 |
| T-052 | Desarrollo | E9 | F9.1 | HU-059 | Construir simulador de palancas reales con sliders | Desarrollar componentes interactivos para ajustar variables. | Desarrollador Frontend | Frontend | 2026-11-12 | 2026-11-18 | 4 | T-047 | Sí | T-053 |
| T-053 | Datos | E9 | F9.1 | HU-059 | Implementar motor determinístico de simulación | Ejecutar fórmulas de impacto de palancas en tiempo real. | Ingeniero de Datos | Datos | 2026-11-13 | 2026-11-19 | 4 | T-048 | Sí | T-052;T-054 |
| T-054 | Desarrollo | E9 | F9.1 | HU-060 | Construir vista de desglose de fórmula del indicador | Mostrar componentes y variables de la fórmula en popup. | Desarrollador Frontend | Frontend | 2026-11-19 | 2026-11-20 | 2 | T-052 | No | T-055 |
| T-055 | Desarrollo | E9 | F9.1 | HU-061 | Construir vista comparativa Base vs Simulado | Mostrar tarjetas Before After con brechas resultantes. | Desarrollador Frontend | Frontend | 2026-11-19 | 2026-11-20 | 2 | T-052 | No | T-054 |
| T-056 | Pruebas | E8 | F8.2 | HU-050 | Pruebas funcionales de KVIs y simulación de palancas | Validar edición de metas recálculos y respuesta de sliders. | QA | Pruebas | 2026-11-17 | 2026-11-20 | 4 | T-048;T-053 | Sí | T-055 |

### Sprint 5 — 2026-11-23 (Lun) → 2026-12-04 (Vie)

*Objetivo:* Desarrollar escenarios de sensibilidades, simulador de pesos, módulo de presentaciones, notificaciones y asistente Yarbis.

| ID_Tarea | Fase | Epica_ID | Feature_ID | HU_ID | Tarea | Descripcion | Rol | Tipo_Tarea | Inicio | Fin | Días | Predecesoras | RC | Paralelo_Con |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T-057 | Desarrollo | E9 | F9.2 | HU-062 | Implementar ajuste de variables de escenario | Desarrollar controles para escenarios optimista y conservador. | Desarrollador Frontend | Frontend | 2026-11-23 | 2026-11-26 | 4 | T-053 | Sí | T-058 |
| T-058 | Desarrollo | E9 | F9.2 | HU-063 | Construir comparador ROACE Before After y brecha | Mostrar porcentaje de brecha cerrada frente a pares. | Desarrollador Frontend | Frontend | 2026-11-26 | 2026-11-27 | 2 | T-057 | No | T-059 |
| T-059 | Desarrollo | E9 | F9.3 | HU-064 | Construir simulador de pesos por indicador | Permitir modificar ponderaciones y recalcular resultados. | Desarrollador Frontend | Frontend | 2026-11-27 | 2026-12-02 | 4 | T-057 | Sí | T-060 |
| T-060 | Desarrollo | E9 | F9.3 | HU-065 | Implementar botón de restablecimiento de pesos | Volver ponderaciones a la distribución base del modelo. | Desarrollador Frontend | Frontend | 2026-12-02 | 2026-12-03 | 2 | T-059 | No | T-061 |
| T-061 | Desarrollo | E11 | F11.1 | HU-072 | Construir tabla de listado de presentaciones | Renderizar entregables creados con fecha y estado. | Desarrollador Frontend | Frontend | 2026-11-23 | 2026-11-25 | 3 | T-012 | No | T-062 |
| T-062 | Desarrollo | E11 | F11.1 | HU-073 | Implementar interfaz de edición de presentaciones | Permitir modificar orden de slides y textos ejecutivos. | Desarrollador Frontend | Frontend | 2026-11-25 | 2026-11-27 | 3 | T-061 | No | T-063 |
| T-063 | Desarrollo | E11 | F11.2 | HU-074 | Construir wizard de creación de presentación | Formulario de título audiencia e idioma para nuevo PPT. | Desarrollador Frontend | Frontend | 2026-11-23 | 2026-11-26 | 4 | T-044 | Sí | T-064 |
| T-064 | Desarrollo | E11 | F11.2 | HU-075 | Implementar selector de tipo de presentación | Elegir entre Directorio Ejecutivo Storytelling o Detalle. | Desarrollador Frontend | Frontend | 2026-11-26 | 2026-11-30 | 3 | T-063 | Sí | T-065 |
| T-065 | Desarrollo | E11 | F11.2 | HU-076 | Construir selector de slides a incluir | Marcar checkboxes de diapositivas de la presentación. | Desarrollador Frontend | Frontend | 2026-11-30 | 2026-12-01 | 2 | T-064 | Sí | T-066 |
| T-066 | Desarrollo | E11 | F11.3 | HU-077 | Implementar previsualización de diapositivas | Renderizar vista previa interactiva del slide deck. | Desarrollador Frontend | Frontend | 2026-12-01 | 2026-12-03 | 3 | T-065 | Sí | T-067 |
| T-067 | Desarrollo | E11 | F11.3 | HU-078 | Implementar servicio de exportación a PPTX y PDF | Generar archivo editable .pptx con python-pptx en backend. | Desarrollador Backend | Backend | 2026-11-30 | 2026-12-04 | 5 | T-066 | Sí | T-068 |
| T-068 | Desarrollo | E11 | F11.3 | HU-079 | Implementar publicación y compartición de presentaciones | Habilitar distribución de presentaciones a audiencias. | Desarrollador Backend | Backend | 2026-12-02 | 2026-12-04 | 3 | T-067 | Sí | T-069 |
| T-069 | Desarrollo | E12 | F12.1 | HU-080 | Construir centro de notificaciones UI | Renderizar lista de notificaciones con severidad y filtros. | Desarrollador Frontend | Frontend | 2026-11-23 | 2026-11-26 | 4 | T-011 | No | T-070 |
| T-070 | Desarrollo | E12 | F12.1 | HU-082 | Implementar badge de notificaciones no leídas | Mostrar contador dinámico en campana de encabezado. | Desarrollador Frontend | Frontend | 2026-11-26 | 2026-11-27 | 2 | T-069 | No | T-071 |
| T-071 | Desarrollo | E13 | F13.1 | HU-083 | Construir widget flotante de asistente Yarbis | Desarrollar componente global de chat de IA flotante. | Desarrollador Frontend | Frontend | 2026-11-23 | 2026-11-30 | 6 | T-005 | Sí | T-072 |
| T-072 | Desarrollo | E13 | F13.1 | HU-084 | Integrar servicio de IA contextual Yarbis | Conectar endpoint de Model Serving para responder consultas. | Desarrollador Backend | Backend | 2026-11-26 | 2026-12-03 | 6 | T-071 | Sí | T-073 |
| T-073 | Desarrollo | E13 | F13.2 | HU-087 | Implementar trazabilidad de respuestas de IA | Registrar cita de fuentes y evidencia en respuestas de Yarbis. | Desarrollador Backend | Backend | 2026-12-02 | 2026-12-04 | 3 | T-072 | No | T-074 |
| T-074 | Pruebas | E11 | F11.3 | HU-078 | Pruebas integrales de presentaciones y Yarbis | Validar generación de PPTX descargas y respuestas de IA. | QA | Pruebas | 2026-11-30 | 2026-12-04 | 5 | T-067;T-072 | Sí | T-073 |

### Sprint 6 — 2026-12-07 (Lun) → 2026-12-18 (Vie)

*Objetivo:* Estabilización del sistema, corrección de defectos, pruebas integrales de regresión y despliegue final a producción.

| ID_Tarea | Fase | Epica_ID | Feature_ID | HU_ID | Tarea | Descripcion | Rol | Tipo_Tarea | Inicio | Fin | Días | Predecesoras | RC | Paralelo_Con |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T-075 | Pruebas | N/A | N/A | N/A | Ejecutar suite de pruebas de regresión E2E | Verificar funcionamiento de todos los módulos del MVP. | QA | Pruebas | 2026-12-07 | 2026-12-11 | 4 | T-074 | Sí | T-076;T-077 |
| T-076 | Estabilización | N/A | N/A | N/A | Corregir defectos y hallazgos de pruebas E2E | Resolver bugs detectados durante las pruebas integrales. | Desarrollador Backend | Backend | 2026-12-07 | 2026-12-14 | 5 | T-075 | Sí | T-075;T-077 |
| T-077 | Estabilización | N/A | N/A | N/A | Ajustar estilos y pulido de interfaz UI | Resolver inconsistencias visuales y usabilidad frontend. | Desarrollador Frontend | Frontend | 2026-12-07 | 2026-12-14 | 5 | T-075 | No | T-075;T-076 |
| T-078 | Datos | N/A | N/A | N/A | Validar integridad de datos en entorno PRD | Comprobar consistencia de catálogos y tablas Gold en PRD. | Ingeniero de Datos | Datos | 2026-12-10 | 2026-12-15 | 4 | T-076 | Sí | T-079 |
| T-079 | Despliegue | N/A | N/A | N/A | Ejecutar pipeline de despliegue a Producción | Promover versión compilada de Databricks Apps a ambiente PRD. | DevOps | Infraestructura | 2026-12-14 | 2026-12-17 | 4 | T-076;T-078 | Sí | T-080 |
| T-080 | Despliegue | N/A | N/A | N/A | Realizar humo y validación de salida a producción | Verificar disponibilidad de la aplicación en entorno final. | Líder Técnico | Gestión | 2026-12-17 | 2026-12-18 | 2 | T-079 | Sí | N/A |

### 6.1 Distribución de tareas por sprint y rol (derivado)

| Sprint | Desarrollador Backend | Desarrollador Frontend | DevOps | Ingeniero de Datos | Líder Técnico | QA | Total |
|---|---|---|---|---|---|---|---|
| Sprint 0 | 1 | 1 | 2 | 1 | 1 | 0 | 6 |
| Sprint 1 | 7 | 7 | 0 | 0 | 0 | 2 | 16 |
| Sprint 2 | 3 | 6 | 0 | 1 | 0 | 1 | 11 |
| Sprint 3 | 1 | 7 | 0 | 1 | 0 | 1 | 10 |
| Sprint 4 | 1 | 10 | 0 | 1 | 0 | 1 | 13 |
| Sprint 5 | 4 | 13 | 0 | 0 | 0 | 1 | 18 |
| Sprint 6 | 1 | 1 | 1 | 1 | 1 | 1 | 6 |

### 6.2 Ruta crítica (tareas con `Ruta_Critica = Sí`)

Listadas por ID dentro de cada sprint; el encadenamiento real está en la columna `Predecesoras`.

- **Sprint 0:** T-001 (DevOps), T-003 (Ingeniero de Datos), T-004 (Desarrollador Backend), T-006 (Líder Técnico)
- **Sprint 1:** T-007 (QA), T-008 (Desarrollador Backend), T-012 (Desarrollador Backend), T-017 (Desarrollador Frontend), T-019 (Desarrollador Backend), T-020 (Desarrollador Frontend), T-022 (QA)
- **Sprint 2:** T-023 (Desarrollador Frontend), T-026 (Desarrollador Frontend), T-028 (Desarrollador Frontend), T-029 (Ingeniero de Datos), T-030 (Desarrollador Frontend), T-031 (Desarrollador Backend), T-033 (QA)
- **Sprint 3:** T-034 (Ingeniero de Datos), T-036 (Desarrollador Frontend), T-037 (Desarrollador Frontend), T-038 (Desarrollador Frontend), T-040 (Desarrollador Frontend), T-043 (QA)
- **Sprint 4:** T-045 (Desarrollador Frontend), T-046 (Desarrollador Frontend), T-047 (Desarrollador Frontend), T-048 (Desarrollador Frontend), T-049 (Desarrollador Backend), T-052 (Desarrollador Frontend), T-053 (Ingeniero de Datos), T-056 (QA)
- **Sprint 5:** T-057 (Desarrollador Frontend), T-059 (Desarrollador Frontend), T-063 (Desarrollador Frontend), T-064 (Desarrollador Frontend), T-065 (Desarrollador Frontend), T-066 (Desarrollador Frontend), T-067 (Desarrollador Backend), T-068 (Desarrollador Backend), T-071 (Desarrollador Frontend), T-072 (Desarrollador Backend), T-074 (QA)
- **Sprint 6:** T-075 (QA), T-076 (Desarrollador Backend), T-078 (Ingeniero de Datos), T-079 (DevOps), T-080 (Líder Técnico)

## 7. Hitos (hoja `Tabla_Hitos`)

| ID_Hito | Hito | Fecha | Sprint | Criterio_Cumplimiento | Tareas_Asociadas |
|---|---|---|---|---|---|
| H-01 | Ambientes y Arquitectura Base Listos | 2026-09-25 (Vie) | Sprint 0 | Workspace Databricks Apps configurado, repositorios creados y SSO Entra ID integrado. | T-001;T-002;T-003;T-004;T-005;T-006 |
| H-02 | Autenticación y Navegación Operativa | 2026-10-09 (Vie) | Sprint 1 | Inicio de sesión funcional con RBAC y listado de análisis operativo. | T-008;T-012;T-017;T-022 |
| H-03 | Definición del Análisis e Ingesta Lista | 2026-10-23 (Vie) | Sprint 2 | Wizard de 5 pasos completado y pipeline de carga desde Capital IQ validado. | T-023;T-029;T-030;T-031;T-033 |
| H-04 | Homologación y Resultados Calculados | 2026-11-06 (Vie) | Sprint 3 | Motor de cobertura funcional, grilla de resultados comparativos y dashboard de KPIs visible. | T-034;T-037;T-038;T-040;T-043 |
| H-05 | Monitor de Valor y Simulación Operativa | 2026-11-20 (Vie) | Sprint 4 | Tabla de KVIs con edición inline y simulador de palancas calculando brechas. | T-047;T-048;T-052;T-053;T-056 |
| H-06 | Presentaciones y Yarbis Integrados | 2026-12-04 (Vie) | Sprint 5 | Generación de PPTX descargable, centro de notificaciones y asistente Yarbis activo. | T-063;T-067;T-068;T-072;T-074 |
| H-07 | Salida a Producción MVP | 2026-12-18 (Vie) | Sprint 6 | Aplicación desplegada en ambiente PRD con pruebas E2E aprobadas y sin defectos críticos. | T-075;T-076;T-079;T-080 |

## 8. Capacidad por rol (hoja `Tabla_Capacidad`)

`Nivel_Ocupacion` es porcentaje (sin el símbolo %).

| Rol | Carga_Estimada | Nivel_Ocupacion | Observacion |
|---|---|---|---|
| DevOps | Media | 75 | Capacidad de 2h diarias enfocada en infraestructura CI CD y despliegue final en Databricks Apps. |
| Ingeniero de Datos | Alta | 88 | Carga intensa en Sprint 0 2 y 3 para diseño de Lakebase pipelines Capital IQ y motor de simulación. |
| Desarrollador Frontend | Alta | 95 | Máxima demanda por desarrollo de interfaces React wizard de definición dashboards y simuladores. |
| Desarrollador Backend | Alta | 90 | Construcción de APIs Express middleware RBAC integración con Model Serving y exportador PPTX. |
| Líder Técnico | Media | 80 | Liderazgo de arquitectura revisión de código contratos API y coordinación de despliegues. |
| QA | Alta | 85 | Incorporación desde el 28/09 con responsabilidad de pruebas continuas por sprint y regresión E2E. |

## 9. Riesgos (hoja `Tabla_Riesgos`)

| ID_Riesgo | Riesgo | Categoria | Probabilidad | Impacto | HU_Afectadas | Mitigacion | Rol_Responsable |
|---|---|---|---|---|---|---|---|
| R-01 | Retraso en habilitación de credenciales API de fuentes externas Capital IQ y Bloomberg | Dependencia externa | Alta | Alta | HU-029;HU-031;HU-032 | Implementar ingesta por carga manual controlada de archivos Excel en Landing Zone como mecanismo de contingencia. | Ingeniero de Datos |
| R-02 | Latencia o indisponibilidad en la integración con Model Serving para respuestas de Yarbis | Técnico | Media | Media | HU-026;HU-083;HU-084;HU-085;HU-087 | Implementar timeout estricto y fallback con respuestas estandarizadas precalculadas cuando el modelo no responda. | Desarrollador Backend |
| R-03 | Desviación de estimaciones derivadas del prototipo al refinar criterios técnicos | Alcance | Alta | Media | HU-031;HU-050;HU-059;HU-078 | Validar estimaciones y notas técnicas en sesiones de refinamiento previas al inicio de cada sprint. | Líder Técnico |

## 10. Supuestos (hoja `Tabla_Supuestos`)

| ID_Supuesto | Supuesto | Impacto_Si_Falla |
|---|---|---|
| S-01 | Los accesos al workspace de Databricks y Azure Entra ID se encuentran habilitados para el inicio del Sprint 0. | Retraso en el alistamiento de ambientes y en la integración del inicio de sesión único. |
| S-02 | Las definiciones de fórmulas de métricas e indicadores de negocio no sufrirán cambios durante el desarrollo del MVP. | Necesidad de recálculos y ajustes en el modelo de datos Lakebase afectando la velocidad de los sprints. |
| S-03 | La cuota de procesamiento en Databricks y presupuesto de inferencia en Azure AI Foundry están aprobados. | Imposibilidad de ejecutar el motor de simulación o las sugerencias contextuales de Yarbis. |
| S-04 | El equipo asignado mantendrá la dedicación diaria convenida durante las 18 semanas de ejecución del proyecto. | Descalce en la velocidad del equipo y necesidad de reducir alcance o postergar la fecha de entrega. |
| S-05 | Las fuentes de datos de Ecopetrol e ISA entregarán archivos en los formatos y frecuencias acordados. | Generación de datos incompletos en los reportes y retrasos en la homologación de información. |

## 11. Diccionario de columnas (hoja `Diccionario_Columnas`)

Define el esquema y valores permitidos. **El agente debe respetar estos valores al actualizar el timeline.**

| Tabla | Columna | Definicion | Valores_Permitidos |
|---|---|---|---|
| Resumen | Campo | Identificador de la métrica o texto de resumen ejecutivo | Libre |
| Resumen | Valor | Contenido detallado del campo de resumen | Libre |
| Tabla_Festivos | Fecha | Fecha del día festivo no laborable | DD/MM/AAAA |
| Tabla_Festivos | Dia_Semana | Nombre del día de la semana correspondiente a la fecha | Lunes;Martes;Miércoles;Jueves;Viernes |
| Tabla_Festivos | Festividad | Nombre oficial de la festividad en Colombia | Libre |
| Tabla_Sprints | Sprint | Nombre identificador del sprint de trabajo | Sprint 0;Sprint 1;Sprint 2;Sprint 3;Sprint 4;Sprint 5;Sprint 6 |
| Tabla_Sprints | Fecha_Inicio | Fecha de inicio del sprint | DD/MM/AAAA |
| Tabla_Sprints | Fecha_Fin | Fecha de finalización del sprint | DD/MM/AAAA |
| Tabla_Sprints | Dias_Habiles | Número de días hábiles laborables en el sprint | Número entero |
| Tabla_Sprints | Objetivo | Propósito principal y entregable esperado del sprint | Libre |
| Tabla_Sprints | Epicas | Identificadores de las épicas abordadas en el sprint | IDs separados por punto y coma |
| Tabla_Sprints | HU_Incluidas | Lista de Historias de Usuario desarrolladas en el sprint | IDs separados por punto y coma o N/A |
| Tabla_Sprints | SP_Comprometidos | Suma total de Story Points planificados en el sprint | Número entero |
| Tabla_Asignacion_HU | HU_ID | Identificador único de la Historia de Usuario | Formato HU-### |
| Tabla_Asignacion_HU | HU_Nombre | Título o nombre corto de la Historia de Usuario | Libre |
| Tabla_Asignacion_HU | Epica_ID | Identificador de la Épica a la que pertenece la HU | Formato E# |
| Tabla_Asignacion_HU | Epica | Nombre de la Épica correspondiente | Libre |
| Tabla_Asignacion_HU | Feature_ID | Identificador del Feature que contiene la HU | Formato F#.# |
| Tabla_Asignacion_HU | Feature | Nombre del Feature correspondiente | Libre |
| Tabla_Asignacion_HU | Prioridad | Prioridad de entrega asignada a la Historia de Usuario | MVP;R2;R3 |
| Tabla_Asignacion_HU | SP | Estimación en Story Points según escala Fibonacci | Número entero (1;2;3;5;8) |
| Tabla_Asignacion_HU | Sprint | Sprint asignado para la ejecución de la HU | Sprint 1;Sprint 2;Sprint 3;Sprint 4;Sprint 5;N/A |
| Tabla_Asignacion_HU | Estado_Plan | Estado de planificación de la Historia de Usuario | Planificada;En riesgo;Recortada;Sugerida R2 |
| Tabla_Asignacion_HU | Dependencias_HU | Historias de Usuario predecesoras requeridas | IDs separados por punto y coma o N/A |
| Tabla_Asignacion_HU | Justificacion | Razón del estado o asignación de la Historia de Usuario | Libre o N/A |
| Tabla_Cronograma | ID_Tarea | Identificador único consecutivo de la tarea técnica | Formato T-### |
| Tabla_Cronograma | Sprint | Sprint en el que se ejecuta la tarea | Sprint 0;Sprint 1;Sprint 2;Sprint 3;Sprint 4;Sprint 5;Sprint 6 |
| Tabla_Cronograma | Fase | Fase del ciclo de desarrollo a la que corresponde la tarea | Alistamiento;Datos;Desarrollo;Integración;Pruebas;Estabilización;Despliegue |
| Tabla_Cronograma | Epica_ID | ID de la Épica asociada o N/A para transversales | Formato E# o N/A |
| Tabla_Cronograma | Feature_ID | ID del Feature asociado o N/A para transversales | Formato F#.# o N/A |
| Tabla_Cronograma | HU_ID | ID de la Historia de Usuario asociada o N/A | Formato HU-### o N/A |
| Tabla_Cronograma | Tarea | Nombre corto de la tarea iniciando con verbo infinitivo | Máximo 10 palabras |
| Tabla_Cronograma | Descripcion | Explicación detallada del trabajo técnico a realizar | Máximo 25 palabras |
| Tabla_Cronograma | Rol | Rol único responsable de la ejecución de la tarea | DevOps;Ingeniero de Datos;Desarrollador Frontend;Desarrollador Backend;Líder Técnico;QA |
| Tabla_Cronograma | Tipo_Tarea | Categorización técnica de la tarea | Infraestructura;Datos;Backend;Frontend;Pruebas;Arquitectura;Gestión |
| Tabla_Cronograma | Fecha_Inicio | Fecha de inicio de la tarea en día hábil | DD/MM/AAAA |
| Tabla_Cronograma | Fecha_Fin | Fecha de finalización de la tarea en día hábil | DD/MM/AAAA |
| Tabla_Cronograma | Duracion_Dias | Duración en días hábiles de la tarea | Número entero |
| Tabla_Cronograma | Predecesoras | IDs de tareas requeridas antes de iniciar | IDs separados por punto y coma o N/A |
| Tabla_Cronograma | Ruta_Critica | Indica si la tarea pertenece a la ruta crítica del proyecto | Sí;No |
| Tabla_Cronograma | Paralelo_Con | IDs de tareas ejecutadas de forma simultánea | IDs separados por punto y coma o N/A |
| Tabla_Hitos | ID_Hito | Identificador único del hito del proyecto | Formato H-## |
| Tabla_Hitos | Hito | Nombre del hito o evento clave | Libre |
| Tabla_Hitos | Fecha | Fecha compromiso de cumplimiento del hito | DD/MM/AAAA |
| Tabla_Hitos | Sprint | Sprint asociado a la entrega del hito | Sprint 0;Sprint 1;Sprint 2;Sprint 3;Sprint 4;Sprint 5;Sprint 6 |
| Tabla_Hitos | Criterio_Cumplimiento | Condición verificable para declarar el hito cumplido | Libre |
| Tabla_Hitos | Tareas_Asociadas | Lista de tareas que condicionan el hito | IDs separados por punto y coma |
| Tabla_Capacidad | Rol | Rol del equipo de desarrollo | DevOps;Ingeniero de Datos;Desarrollador Frontend;Desarrollador Backend;Líder Técnico;QA |
| Tabla_Capacidad | Carga_Estimada | Nivel cualitativo de carga de trabajo proyectada | Baja;Media;Alta;Sobrecargada |
| Tabla_Capacidad | Nivel_Ocupacion | Porcentaje estimado de uso de la capacidad | Número entero (sin %) |
| Tabla_Capacidad | Observacion | Comentario explicativo sobre la dedicación del rol | Libre |
| Tabla_Riesgos | ID_Riesgo | Identificador único del riesgo técnico | Formato R-## |
| Tabla_Riesgos | Riesgo | Descripción del evento de riesgo | Libre |
| Tabla_Riesgos | Categoria | Tipo o clasificación del riesgo | Técnico;Datos;Infraestructura;Capacidad;Alcance;Dependencia externa |
| Tabla_Riesgos | Probabilidad | Probabilidad de ocurrencia del riesgo | Alta;Media;Baja |
| Tabla_Riesgos | Impacto | Impacto potencial en el proyecto | Alta;Media;Baja |
| Tabla_Riesgos | HU_Afectadas | Historias de usuario potencialmente afectadas | IDs separados por punto y coma o N/A |
| Tabla_Riesgos | Mitigacion | Acción preventiva o plan de respuesta al riesgo | Libre |
| Tabla_Riesgos | Rol_Responsable | Rol encargado de monitorear y gestionar el riesgo | DevOps;Ingeniero de Datos;Desarrollador Frontend;Desarrollador Backend;Líder Técnico;QA |
| Tabla_Supuestos | ID_Supuesto | Identificador único del supuesto de planeación | Formato S-## |
| Tabla_Supuestos | Supuesto | Condición o premisa considerada verdadera para el plan | Libre |
| Tabla_Supuestos | Impacto_Si_Falla | Consecuencia técnica o en tiempo si el supuesto no se cumple | Libre |

## 12. Observaciones de consistencia (generadas en la conversión)

Verificaciones hechas sobre los datos del Excel:

- ✅ Todas las `Duracion_Dias` coinciden con los días hábiles reales (lun–vie, sin festivos) entre `Fecha_Inicio` y `Fecha_Fin`.
- ✅ Ninguna tarea inicia o termina en fin de semana o festivo, y todas caen dentro de las fechas de su sprint.
- ✅ `HU_Incluidas` de cada sprint coincide con la columna `Sprint` de `Tabla_Asignacion_HU`. SP totales = 263.
- ⚠️ **Predecesoras no estrictamente fin-a-inicio.** El plan solapa tareas dependientes. 22 relaciones arrancan el mismo día en que termina la predecesora: T-013←T-010, T-015←T-011, T-026←T-023, T-027←T-023, T-030←T-028, T-032←T-025, T-037←T-036, T-038←T-037, T-039←T-037, T-046←T-045, T-047←T-046, T-050←T-047, T-051←T-047, T-058←T-057, T-060←T-059, T-062←T-061, T-064←T-063, T-065←T-064, T-066←T-065, T-070←T-069, T-079←T-076, T-080←T-079. Y 34 relaciones arrancan *antes* de que termine la predecesora (solape real):
  - T-014 inicia 10-07 y su predecesora T-012 termina 10-09
  - T-016 inicia 10-08 y su predecesora T-012 termina 10-09
  - T-017 inicia 10-05 y su predecesora T-010 termina 10-07
  - T-018 inicia 10-06 y su predecesora T-012 termina 10-09
  - T-019 inicia 10-07 y su predecesora T-018 termina 10-08
  - T-020 inicia 10-07 y su predecesora T-017 termina 10-08
  - T-021 inicia 10-08 y su predecesora T-019 termina 10-09
  - T-022 inicia 10-05 y su predecesora T-012 termina 10-09
  - T-024 inicia 10-14 y su predecesora T-023 termina 10-16
  - T-028 inicia 10-19 y su predecesora T-026 termina 10-20
  - T-031 inicia 10-20 y su predecesora T-029 termina 10-21
  - T-033 inicia 10-19 y su predecesora T-030 termina 10-22
  - T-033 inicia 10-19 y su predecesora T-031 termina 10-23
  - T-035 inicia 10-28 y su predecesora T-034 termina 10-29
  - T-040 inicia 11-03 y su predecesora T-038 termina 11-05
  - T-041 inicia 11-04 y su predecesora T-040 termina 11-05
  - T-042 inicia 11-05 y su predecesora T-041 termina 11-06
  - T-043 inicia 11-03 y su predecesora T-038 termina 11-05
  - T-048 inicia 11-17 y su predecesora T-047 termina 11-18
  - T-049 inicia 11-17 y su predecesora T-048 termina 11-19
  - T-052 inicia 11-12 y su predecesora T-047 termina 11-18
  - T-053 inicia 11-13 y su predecesora T-048 termina 11-19
  - T-056 inicia 11-17 y su predecesora T-048 termina 11-19
  - T-056 inicia 11-17 y su predecesora T-053 termina 11-19
  - T-067 inicia 11-30 y su predecesora T-066 termina 12-03
  - T-068 inicia 12-02 y su predecesora T-067 termina 12-04
  - T-072 inicia 11-26 y su predecesora T-071 termina 11-30
  - T-073 inicia 12-02 y su predecesora T-072 termina 12-03
  - T-074 inicia 11-30 y su predecesora T-067 termina 12-04
  - T-074 inicia 11-30 y su predecesora T-072 termina 12-03
  - T-076 inicia 12-07 y su predecesora T-075 termina 12-11
  - T-077 inicia 12-07 y su predecesora T-075 termina 12-11
  - T-078 inicia 12-10 y su predecesora T-076 termina 12-14
  - T-079 inicia 12-14 y su predecesora T-078 termina 12-15
  Interpretación sugerida: las dependencias funcionan como inicio-a-inicio con desfase o entrega parcial, no como fin-a-inicio. Si el agente aplica lógica FS estricta, el cronograma se alargaría.
- ⚠️ **`Paralelo_Con` incluye a la propia predecesora** en: T-024 (T-023), T-033 (T-031), T-035 (T-034), T-076 (T-075), T-077 (T-075).
- ⚠️ **HU-023 (Configurar periodo y alcance, Sprint 1, 3 SP) no tiene ninguna tarea** en `Tabla_Cronograma`, aunque es dependencia de HU-024.
- ⚠️ **HU-029 tiene dos tareas** (T-028 frontend y T-029 datos); HU-059 también (T-052 y T-053); HU-001 tiene tres (T-008, T-009, T-022).
- ⚠️ **Sprint 5 concentra 80 SP** (30 % del total) y 13 tareas de frontend; el propio Excel lo reconoce como riesgo de capacidad.
- ⚠️ **Sprint 0 y Sprint 6 tienen 0 SP**: alistamiento y estabilización no se estiman en puntos.
- ⚠️ **Duración:** el `Resumen` dice que las 60 HU caben "dentro de las 18 semanas de ejecución", pero el cronograma va del 2026-09-21 al 2026-12-18 (13 semanas). Probablemente las 18 semanas se refieren a la duración total del contrato (ver propuesta), no a este cronograma; conviene confirmarlo.
- ⚠️ **QA:** el plan incorpora QA desde el 2026-09-28 (Sprint 1), con primera tarea T-007.
- ℹ️ **Carga por rol:** el Ingeniero de Datos no tiene tareas en Sprint 1 ni Sprint 5; el Líder Técnico solo tiene 2 tareas explícitas (T-006 y T-080) — su trabajo de revisión/coordinación no está desglosado; DevOps solo aparece en Sprint 0 y Sprint 6.
- ℹ️ **Huecos en numeración de HU:** faltan HU-012–017, HU-040, HU-044–045, HU-049, HU-055–058, HU-066–071, HU-081, HU-086 (posiblemente fuera de alcance o en otro backlog; el Excel no lo explica). La validación (`Estado_Plan`) admite también `En riesgo` y `Recortada`, aunque hoy todas las HU MVP están `Planificada`.
