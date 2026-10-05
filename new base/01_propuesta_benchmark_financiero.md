# Propuesta Técnica y Económica — Benchmark Financiero: Design Sprint + MVP (Ecopetrol)

> **Origen:** `Ecopetrol_-_Comparador_Financiero_-_V3.pdf` (2 páginas tipo landing, muy largas).
> **Emisor:** WPP Enterprise Solutions / VML · **Cliente:** Ecopetrol S.A. — Vicepresidencia de Tecnología e Innovación (VTI).
> **Marco contractual:** Contrato Marco 3048550 – CW321794. **Fecha del documento:** junio 2026 (pie de página: "Confidencial · Junio 2026"). **Vigencia:** 30 días calendario desde emisión.
> **Qué es para el agente:** la línea base contractual (alcance, etapas, semanas, equipo, hitos, presupuesto). El working plan y la lista de tareas son la ejecución posterior y en varios puntos se apartan de esta base (ver `00_README_contexto_timeline.md`).
> El diagrama de Gantt del PDF es una imagen; aquí se transcribió celda a celda. Las secciones marcadas **[Nota de conversión]** no están en el PDF.

---

## 0. Ficha del proyecto

| Campo | Valor |
|---|---|
| Nombre | Benchmark Financiero — Design Sprint + MVP (también llamado "Comparador Financiero"; en el working plan el producto se llama **BenchHub**) |
| Objetivo | Conceptualizar y desarrollar una solución de inteligencia financiera comparativa; Design Sprint consultivo + MVP funcional sobre **Databricks + Streamlit** |
| Inversión total | **$542.604.840 COP** (sin IVA) |
| Duración | **18 semanas** |
| Equipo | **11 perfiles · 3 etapas** |
| Etapas | Etapa 00 Setup (1 sem) · Etapa 01 Exploración y Diseño (5 sem) · Etapa 02 Desarrollo MVP (12 sem, 6 sprints de 2 sem) |
| Esfuerzo Etapa 02 | 2.680 horas activas |
| Contacto | Gustavo Hurtado — CTO Colombia, WPP Enterprise Solutions — gustavo.hurtado@vml.com |
| Hoja de ruta | Esta propuesta = **Ola 1** de 4 olas |

---

## 1. Punto de partida — El reto de Ecopetrol

Ecopetrol necesita fortalecer su análisis financiero comparativo para conectar el desempeño de las compañías del grupo con decisiones estratégicas de largo plazo. Hoy el proceso es fragmentado, reactivo y sin trazabilidad: depende de fuentes dispersas, modelos en archivos separados y validaciones manuales entre equipos. Se busca una solución que permita **leer, estructurar, mapear, comparar y visualizar** información financiera de compañías internas y externas bajo criterios comparables, trazables y accionables.

Cinco problemas identificados:

1. **Fragmentación de fuentes y modelos** — estados financieros en archivos dispersos, sin modelo común ni capa de ingesta/estructuración.
2. **Métricas no homologadas entre compañías** — EBITDA, márgenes y ratios varían entre compañías y estándares contables (IFRS, US GAAP).
3. **Ausencia de trazabilidad** — sin registro del origen del dato, fórmula aplicada ni versión del archivo; Finanzas no puede auditar resultados.
4. **Desconexión entre datos y decisión** — los análisis tardan semanas y no llegan a tiempo a la dirección.
5. **Sin gobierno del proceso** — sin responsable ni flujo de validación; cada equipo aplica su propio criterio.

## 2. Visión — Tres dimensiones de la solución

| Dimensión | Lema | Enfoque |
|---|---|---|
| Experiencia de usuario | Transformar complejidad en claridad accionable | Experiencias diferenciadas para usuarios financieros, técnicos y ejecutivos |
| Tecnología | IA especializada en análisis financiero comparativo | Arquitectura de IA con automatización + validación humana; seguridad, trazabilidad, escalabilidad |
| Habilitadores operativos | Una solución que se integra al ecosistema | Flujos de ingesta, validación y gobierno continuos, con retroalimentación y mejora |

**Ambición:** conceptualizar la herramienta de benchmark financiero para comparar el desempeño de las compañías del grupo con inteligencia, anticipar tendencias y acelerar decisiones basadas en datos financieros comparables.

---

## 3. Metodología — Tres etapas, dieciocho semanas

Misma lógica Setup / Exploración / Definición y desarrollo usada en proyectos previos con Ecopetrol. "El MVP es consecuencia del proceso consultivo, no su punto de partida."

### 3.1 Etapa 00 — Setup (1 semana · semana 1)

Objetivo: punto de partida técnico y consultivo; alinear expectativas, definir gobierno, identificar stakeholders, inventariar documentación financiera. Cierra con decisión formal de alcance del MVP y fuentes candidatas.

- **Gobierno del proyecto:** priorización de esfuerzos y entregables con el equipo core; ceremonias (Daily, Weekly); mapeo de stakeholders de Finanzas, Tecnología, Datos y Negocio.
- **Alineamiento de expectativas:** revisión del proceso actual; sesiones con el equipo core; canales de comunicación, repositorio documental y calendario.
- **Definición de alcance y fuentes:** shortlist de fuentes candidatas (impacto, disponibilidad, licencias); inventario de fuentes internas (ERP, data lake, BI) y externas (reportes públicos, APIs financieras); dominio de datos y lineamientos de seguridad iniciales.

**Decisión V1 vs V2 (hito de gobierno al cierre de la Etapa 00):**

| | V1 — Híbrida | V2 — Autónoma |
|---|---|---|
| Modo | Carga manual (Excel/CSV) + IA asistida | Ingesta automatizada desde fuentes internas (ERP, data lake) y externas licenciadas |
| IA | Sugiere mapeos, detecta anomalías, genera narrativas | Orquesta ingesta, normalización y cálculo completos |
| Ventajas | Menor tiempo de implementación; sin dependencia de APIs externas; más validación humana | Más automatización end-to-end; escalabilidad a largo plazo |
| Contras | Menor automatización | Requiere integración con fuentes |

**Entregables Etapa 00:** Kick-off · Mapa de stakeholders · Plan de trabajo · Calendario de sesiones · Inventario de fuentes · Decisión V1 vs V2 · Shortlist de fuentes MVP · Dominio de datos y seguridad.

### 3.2 Etapa 01 — Exploración y Diseño (5 semanas · semanas 2–6)

Núcleo consultivo. Incluye Design Sprint presencial de 2–3 días y una semana adicional (S5 de la etapa) de definición ejecutable, para que la Etapa 02 sea solo desarrollo.

- **Exploración:** hasta 10 entrevistas de 1 h (perfiles financieros, técnicos, ejecutivos); diagnóstico de fuentes seleccionadas; exploración del proceso de decisión; mapeo de flujos actuales (carga, validación, cálculo, visualización).
- **Design Sprint (2–3 días presenciales):** codiseño de la propuesta de valor; primeras definiciones de arquitectura (motor de cálculo, modelo de mapeo, capas); prototipo no funcional de la experiencia piloto y dashboard comparativo; validación con máx. 5 stakeholders (entrevistas de 45 min); habilitadores operativos y organizacionales.
- **Arquitectura técnica preliminar:** middleware de ingesta por fuente (API REST o batch file); modelo de datos (campos, metadatos, taxonomía financiera estándar, rastreo del origen); normalización IFRS/US GAAP; definición de agentes **Lector, Mapeador, Calculador, Visualizador** (rol, inputs, outputs, límites).
- **Semana adicional — definición ejecutable:**
  - Definición única documentada de **ROACE, EBITDA** y demás métricas en conflicto, validada con Finanzas de Ecopetrol → condición obligatoria del Definition of Ready.
  - Definición de MVP y refinamiento del backlog con criterios de aceptación formales; priorización de funcionalidades.
  - Estimados de implementación por componente.
  - Arquitectura To-Be alineada con la decisión V1/V2.
  - Plan de seguridad (Security-by-Design): RBAC, cifrado, gestión de secretos, auditoría.
  - Recomendaciones de fuentes internas y externas.
  - Costos de componentes de IA, MLOps y agentes para escala.
  - Esa semana la concentran Solution Architect & AI Engineer y Product Owner; el resto mantiene disponibilidad puntual sin horas adicionales.

**Entregables Etapa 01:** Propuesta de valor · Historias de usuario · Backlog priorizado · Wireframes / prototipo · Diccionario de métricas · Arquitectura preliminar C4 · Modelo de datos + rastreo de origen · Definición de agentes · Definition of Ready Etapa 02 · Alcance recomendado MVP.

### 3.3 Etapa 02 — Desarrollo del MVP (12 semanas · 6 sprints · semanas 7–18)

Solo desarrollo; toda la definición queda cerrada en la Etapa 01. Se construye un **MVP funcional real**, de extremo a extremo, que reemplaza el proceso manual en Excel y que operan usuarios reales (Analista financiero, IR, CFO, Ejecutivo), sobre **Databricks + Streamlit** dentro del workspace gobernado de Ecopetrol.

- **No pasa por el proceso formal de paso a producción de Ecopetrol** (gates de arquitectura empresarial, DevOps y QA regulares). El control de calidad se concentra en **Unity Catalog** y validaciones dentro de cada sprint.

**Definition of Ready (condición de entrada a la Etapa 02).** El Sprint 1 no inicia sin, validado y documentado:
1. Backlog RF01–RF14 con criterios de aceptación formales.
2. Definición única de ROACE, EBITDA y métricas en conflicto, cerrada con Finanzas de Ecopetrol.
3. Arquitectura To-Be y plan de seguridad aprobados.
4. Fuentes internas y externas priorizadas con acceso confirmado.
5. Estimados de esfuerzo por componente validados.

Si falta alguno, se replantea el inicio de la Etapa 02 antes de comprometer el cronograma.

**Arquitectura y flujo de datos (Databricks + Streamlit):**
- Un solo workspace gobernado: ingesta, transformación, cálculo y visualización en Databricks.
- Streamlit desplegado como **Databricks App** (nativa, sin servidor propio ni CI/CD externo) — esto permite saltar los procesos regulares de paso a producción.
- Arquitectura **medallion**: Bronze (crudo versionado) → Silver (mapeo de cuentas y normalización de moneda/periodo) → Gold (métricas y escenarios calculados).
- Gobierno desde el día uno con Unity Catalog (permisos, linaje, auditoría), que sustituye los controles formales de DevOps/QA omitidos en el MVP.
- Flujo: `Capital IQ (pares)` + `Carga manual Ecopetrol / ISA` → Landing Zone → Bronze → Silver (mapeo) → Gold (métricas) → Streamlit · Databricks App → Usuarios.
- **Bloomberg, Bloomberg NEF y Wood Mackenzie no se integran en el MVP inicial.**

**Equipo dedicado a la Etapa 02:**

| Rol | Dedicación en Etapa 02 |
|---|---|
| Data Engineer MD | Tiempo completo los 6 sprints |
| Tech Lead MD | Tiempo completo los 6 sprints |
| Full Stack / Integration Engineer MD | Tiempo completo los 6 sprints |
| Solution Architect & AI Engineer | Tiempo completo solo Sprint 1; parcial desde Sprint 2 |
| Consultor Financiero / CFO Advisor | 10 h/semana (20 h/sprint) toda la etapa; valida reglas de cálculo |
| Product Owner | 24 h/sprint los 6 sprints; punto único de decisión funcional |
| PM | 10 h/semana (16 h/sprint) toda la etapa |
| UX/UI & Data Viz Specialist | Parcial toda la etapa (dashboard y configuración del benchmark) |
| DevOps Engineer | Parcial en Sprint 1–2 (montaje del workspace) y Sprint 5–6 (revisión de despliegue como Databricks App); nada en Sprint 3–4 |
| QA Analyst MD | Parcial desde Sprint 3 hasta Sprint 6 |
| Resto del equipo | Dedicación variable según foco del sprint |

**Plan de sprints Etapa 02 (semanas relativas a la etapa):**

| Sprint | Semanas de la etapa | Semanas del proyecto [Nota de conversión] | Foco | RF |
|---|---|---|---|---|
| Sprint 1 | S1–S2 | S7–S8 | Fundamentos Databricks (Unity Catalog, Landing Zone, Bronze) sobre backlog y métricas cerrados en el DoR | RF01 |
| Sprint 2 | S3–S4 | S9–S10 | Ingesta: conexión a Capital IQ y carga manual controlada de Ecopetrol/ISA | RF02, RF03, RF04 |
| Sprint 3 | S5–S6 | S11–S12 | Silver: mapeo financiero (MappingRule) y vista previa, con taxonomía estándar y ROACE resueltos | RF05, RF06 |
| Sprint 4 | S7–S8 | S13–S14 | Gold: motor de cálculo de métricas núcleo y configuración de escenarios | RF07, RF08 |
| Sprint 5 | S9–S10 | S15–S16 | Streamlit (Databricks App): dashboard comparativo, ranking, tendencia, trazabilidad/drill-down | RF09, RF10 |
| Sprint 6 | S11–S12 | S17–S18 | Cierre: configuraciones guardadas, exportación, sugerencia de mapeo, validación de una fuente externa priorizada, narrativa automática con IA | RF11, RF12, RF13, RF14, RF15 |
| **Total** | 12 semanas | | **2.680 horas activas** | |

**Métricas en alcance del MVP y fuente de datos:**

| Métrica | Fuente en el MVP | Riesgo |
|---|---|---|
| Net Sales | Capital IQ (pares) + carga manual (Ecopetrol/ISA) | Bajo |
| EBITDA | Capital IQ (pares); cálculo interno cuando la definición reportada no coincide con la de Ecopetrol | Medio |
| EBITDA Margin | Derivada en Gold (EBITDA / Net Sales) | Bajo |
| EBIT | Capital IQ (directo) | Bajo |
| Net Income | Capital IQ (pares); cálculo interno confirmado para Ecopetrol | Bajo-Medio |
| Revenue Growth | Derivada en Gold sobre Net Sales histórico | Bajo |
| Net Debt | Capital IQ (pares) / cálculo interno para Ecopetrol | Medio |
| Net Debt / EBITDA | Derivada en Gold | Bajo |
| ROE / ROA | Capital IQ (directo) | Bajo |
| ROIC | Capital IQ; posible cálculo interno si no viene estandarizado | Medio |
| Free Cash Flow | Capital IQ (directo) o cálculo (CFO – CapEx) | Medio |
| CapEx | Capital IQ (directo) | Bajo |
| ROACE | No disponible en Capital IQ; cálculo 100 % interno (capital + notepad de utilidad operacional) | **Alto — Bloqueante** |
| Lifting cost / costo "comunitario" | Sin fuente sistemática; búsqueda manual por empresa | Alto — **Fuera del MVP** |
| Reservas (probadas, probables, 2P) | Wood Mackenzie vía equipo de precios | Alto — **Fuera del MVP** |
| Indicadores ESG | Capital IQ, taxonomía cambia año a año | Medio-Alto — **Fuera del MVP** |
| Datos financieros de ISA | Envío manual de ISA; históricamente llegan tarde | Alto |

Se priorizan métricas con disponibilidad directa en Capital IQ o con regla interna documentada; las de riesgo alto quedan como candidatas a Ola 2/3. El MVP es una aplicación de uso real, no un ejercicio descartable.

**Entregables Etapa 02:** Arquitectura Databricks + Streamlit · Flujo Bronze/Silver/Gold · Backlog RF01–RF14 por sprint · Definición única de ROACE/EBITDA · MVP validado con usuarios reales · Diccionario de métricas y fuentes · Unity Catalog (gobierno y auditoría) · Hoja de ruta por olas.

---

## 4. Timeline — 18 semanas y hitos de decisión

El equipo escala: 6 perfiles en Setup, 9 en Exploración, hasta 11 en el MVP (con menos carga de DevOps y QA que el ciclo estándar). Tres hitos formales con Ecopetrol (el encabezado de la sección dice "3 hitos de decisión").

### 4.1 Gantt por rol (transcripción de la imagen del PDF)

Leyenda: **SET** = Etapa 00 Setup · **EXP-C** = Exploración tiempo completo · **EXP-P** = Exploración dedicación parcial · **MVP-C** = MVP tiempo completo · **MVP-P** = MVP dedicación parcial · **—** = sin asignación.

| Rol | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | S12 | S13 | S14 | S15 | S16 | S17 | S18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Solution Architect & AI | SET | EXP-C | EXP-C | EXP-C | EXP-C | EXP-C | MVP-C | MVP-C | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P |
| Product Owner | SET | EXP-C | EXP-C | EXP-C | EXP-C | EXP-C | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P |
| PM | SET | EXP-P | EXP-P | EXP-P | EXP-P | EXP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P |
| Tech Lead MD | SET | EXP-P | EXP-C | EXP-C | EXP-C | EXP-P | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C |
| Consultor Financiero | SET | EXP-C | EXP-C | EXP-C | EXP-C | EXP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P |
| Strategic Designer | SET | EXP-P | EXP-C | EXP-C | EXP-P | EXP-P | MVP-P | MVP-P | MVP-P | MVP-P | — | — | — | — | — | — | — | — |
| UX/UI & Data Viz | — | EXP-C | EXP-C | EXP-C | EXP-C | EXP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P |
| Data Engineer MD | — | EXP-P | EXP-C | EXP-C | EXP-P | EXP-P | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C |
| DevOps Engineer | — | — | EXP-P | EXP-P | EXP-P | EXP-P | MVP-P | MVP-P | MVP-P | MVP-P | — | — | — | — | MVP-P | MVP-P | MVP-P | MVP-P |
| Full Stack / Integration | — | — | — | — | — | — | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C | MVP-C |
| QA Analyst MD | — | — | — | — | — | — | — | — | — | — | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P | MVP-P |

Conteo por fase: Setup = 6 roles · Exploración = 9 roles · MVP = 11 roles (coincide con el texto).

### 4.2 Hitos formales

| # | Semana | Hito | Criterio |
|---|---|---|---|
| 1 | Semana 1 · Kick-off | **Decisión V1 vs V2** | Selección formal del alcance y confirmación de fuentes candidatas |
| 2 | Semana 6 · Cierre Etapa 01 | **Definition of Ready** | Backlog refinado con criterios de aceptación, arquitectura To-Be, definición única de ROACE/EBITDA resuelta y documentada. Condición para iniciar la Etapa 02 |
| 3 | Semana 18 · Presentación final | **MVP entregado** | MVP funcional validado con usuarios reales, criterios de aceptación cumplidos y hoja de ruta por olas |

---

## 5. Alcance funcional y técnico

### 5.1 Requerimientos funcionales

| ID | Requerimiento | Sprint | Prioridad |
|---|---|---|---|
| RF01 | Acceso controlado a la experiencia piloto con autenticación por rol | Sprint 1 | Alta |
| RF02 | Crear o seleccionar compañías internas y externas para el ejercicio | Sprint 2 | Alta |
| RF03 | Cargar archivos financieros en Excel o CSV desde la interfaz | Sprint 2 | Alta |
| RF04 | Asociar cada archivo a compañía, periodo, moneda y tipo de reporte | Sprint 2 | Alta |
| RF05 | Visualizar datos extraídos del archivo antes de procesarlos | Sprint 3 | Alta |
| RF06 | Mapear cuentas cargadas contra un modelo financiero estándar con validación del usuario | Sprint 3 | Alta |
| RF07 | Configurar benchmark por compañía, periodo, métrica principal y grupo comparable | Sprint 4 | Alta |
| RF08 | Calcular métricas base: Net Sales, EBITDA, EBITDA Margin, EBIT, Net Income, Revenue Growth, Net Debt, Net Debt/EBITDA, ROE, ROA, ROIC, Free Cash Flow, CapEx y ROACE (este último solo una vez resuelta su definición única) | Sprint 4 | Alta |
| RF09 | Dashboard comparativo piloto con ranking, tendencia y comparación por métrica | Sprint 5 | Alta |
| RF10 | Consultar fuente original, cuenta financiera y regla de cálculo de cada resultado | Sprint 5 | Alta |
| RF11 | Guardar configuraciones simples de benchmark para reutilización | Sprint 6 | Media |
| RF12 | Exportar resultados del benchmark en formato controlado | Sprint 6 | Media |
| RF13 | Sugerir mapeos de cuentas mediante reglas básicas o asistencia inteligente | Sprint 6 | Media |
| RF14 | Validar lectura y extracción desde una fuente externa priorizada | Sprint 6 | Media |
| RF15 | Generar narrativa automática de hallazgos financieros con IA | Sprint 6 | Media |

La priorización definitiva se hará en el Design Sprint (Etapa 01) con Ecopetrol.

### 5.2 Requerimientos no funcionales

| RNF | Descripción |
|---|---|
| Seguridad | Acceso controlado, autorización por rol, protección de información financiera sensible |
| Auditoría | Registro de cargas, cambios de mapeo, versiones de archivos y ajustes de métricas |
| Trazabilidad | Cada métrica rastreable hasta su fuente, cuenta y regla aplicada |
| Escalabilidad | Preparado para nuevas compañías, fuentes, métricas y visualizaciones |
| Calidad de datos | Validaciones de consistencia, formato, periodos, moneda y completitud antes de calcular |
| Interoperabilidad | Conexión futura con sistemas internos y fuentes externas vía API o batch |
| Usabilidad | Flujos simples para usuarios financieros sin perfil técnico |
| Mantenibilidad | Separación entre experiencia, servicios, datos, reglas financieras e integraciones |
| Gobierno | Control sobre quién carga, valida, modifica o consume información |
| Cumplimiento | Alineación con políticas de seguridad, arquitectura, datos y gobierno de Ecopetrol |

### 5.3 Arquitectura de referencia — 8 capas

1. **Experiencia de usuario** — carga, configuración, validación y visualización.
2. **Servicios de aplicación** — usuarios, compañías, escenarios, reglas y permisos.
3. **Módulo de ingesta** — lectura, extracción, validación y normalización.
4. **Módulo financiero** — cálculo de métricas y reglas de comparación.
5. **Repositorio de datos** — persistencia de compañías, métricas y escenarios.
6. **Capa de integración** — conectores futuros con fuentes internas y externas.
7. **Capa analítica** — dashboards, reportes, rankings e insights.
8. **Seguridad y auditoría** — roles, permisos, logs, versiones y trazabilidad.

### 5.4 Modelo de datos inicial — 12 entidades

En el PDF las entidades críticas para el MVP están resaltadas en naranja (verificado visualmente en la conversión).

| Entidad | Descripción | Crítica MVP |
|---|---|---|
| Company | Compañía interna o externa analizada | ✅ |
| FinancialStatement | Estado financiero cargado o integrado | ✅ |
| FinancialAccount | Cuenta financiera original del archivo fuente | ✅ |
| StandardMetric | Métrica estándar definida por la solución | ✅ |
| MappingRule | Regla de equivalencia cuenta original → estándar | ✅ |
| BenchmarkScenario | Configuración de un ejercicio de comparación | ✅ |
| BenchmarkResult | Resultado calculado para un escenario | |
| Period | Año, trimestre, mes o rango temporal | |
| Currency | Moneda de origen y moneda normalizada | |
| DataSource | Fuente del dato: archivo, sistema o API externa | |
| User | Usuario con rol y permisos | |
| AuditLog | Registro de acciones, cargas y cambios | |

El modelo completo se refina en la Etapa 01.

### 5.5 Agenda financiera del Design Sprint (preguntas que el Consultor Financiero / CFO Advisor debe resolver en la Etapa 01)

Desde la visión CFO, el éxito depende de comparabilidad, consistencia y trazabilidad, no solo de la visualización.

- **Definiciones de métricas:** ¿definición oficial de EBITDA? ¿ajustes permitidos (reportado vs. ajustado)? ¿métricas obligatorias para un benchmark válido? ¿qué datos pueden estimarse y cuáles deben venir de fuente oficial?
- **Normalización y comparabilidad:** ¿manejo de monedas distintas? ¿periodos fiscales distintos? ¿comparación IFRS vs. US GAAP u otros? ¿qué diferencias se marcan como excepción y no como comparación directa?
- **Gobierno y trazabilidad:** ¿nivel de trazabilidad que requiere Finanzas? ¿criterios para agrupar por vertical o segmento? ¿cómo documentar supuestos? ¿qué hace comparable a una compañía con otra?

---

## 6. Equipo — 11 perfiles

| Rol | Responsabilidad | Etapas |
|---|---|---|
| Solution Architect & AI Engineer | Arquitectura de referencia, stack de IA, integración con el ecosistema de Ecopetrol, definición de agentes | E00, E01, E02 |
| Full Stack / Integration Engineer MD | Construcción del MVP sobre Streamlit (Databricks App), motor de cálculo e integraciones con fuentes candidatas | E02 (según Gantt) |
| Product Owner | Priorización de backlog, criterios de aceptación, punto único de decisión funcional | E00, E01, E02 |
| PM | Gestión operativa, cronograma y reporte a Ecopetrol; 10 h/semana en todo el proyecto | E00, E01, E02 |
| Data Engineer MD | Modelo de datos, lectura de archivos, normalización contable, trazabilidad fuente→métrica | E01, E02 |
| QA Analyst MD | Validación embebida por sprint (sin gate formal): cálculos, criterios de aceptación, trazabilidad | E02 (desde Sprint 3) |
| Tech Lead MD | Liderazgo técnico, estándares de código, revisión de arquitectura, calidad en el MVP | E00, E01, E02 |
| Consultor Financiero / CFO Advisor | Métricas, reglas de comparabilidad, supuestos, normalización; eje central del Design Sprint | E00, E01, E02 |
| UX/UI & Data Viz Specialist | Flujos, wireframes, prototipo no funcional, dashboard piloto | E01, E02 |
| Strategic Designer | Facilitación visual del Design Sprint, síntesis de hallazgos, artefactos de comunicación | E00, E01, inicio E02 (hasta S10) |
| DevOps Engineer | Configuración inicial del workspace Databricks y Unity Catalog; rol acotado (sin CI/CD externo ni gate DevOps) | E01, E02 (parcial) |

Nota: las etiquetas E00/E01/E02 del PDF aparecen en todas las tarjetas; la columna "Etapas" se ajustó con el Gantt de la sección 4.1.

**Equipo directivo (dedicación parcial, supervisión de calidad y escalamiento):** Gustavo Hurtado — CTO Colombia · Misael Albanil — Director de Tecnología · Gabriela Utrera — Directora de Operaciones · Luis Alveart — Director de Diseño / Cuenta.

---

## 7. Presupuesto y células

| Semanas | Célula | Valor (COP) |
|---|---|---|
| 1 | Célula Mediana de Desarrollo e Implementación | $10.930.468 |
| 6 | Célula Grande de Conceptualización | $118.295.172 |
| 10 | 2 Células Grandes de Desarrollo e Implementación | $413.379.200 |
| **Total** | | **$542.604.840** |

[Nota de conversión] Las semanas de células suman 17 (1 + 6 + 10), no 18; y la Etapa 02 se describe como 12 semanas pero se factura con células de 10 semanas. Validar antes de usar estas semanas como base del timeline.

**Condiciones generales:** sin IVA ni otras tasas (IVA vigente al facturar); pago según el Contrato Marco; Ecopetrol asegura disponibilidad del equipo core y stakeholders para talleres, sesiones y validación del backlog sprint a sprint.

---

## 8. Riesgos identificados

Se abordan como riesgos de producto en uso real (no de un ejercicio de validación).

| Nivel | Riesgo | Mitigación |
|---|---|---|
| Alto | Estructuras heterogéneas de estados financieros | Modelo estándar y reglas de mapeo definidos en el Design Sprint antes de la ejecución técnica |
| **Alto — Bloqueante** | ROACE y métricas no homologadas (2–3 definiciones de ROACE conviven entre áreas y frente a terceros) | El Consultor Financiero cierra la definición única en la semana adicional de la Etapa 01, como condición del DoR |
| Alto | Fuentes externas no disponibles o sin licencia | Selección de fuentes en el Setup; el MVP puede operar con carga manual controlada |
| Alto | Calidad inconsistente de datos financieros | Módulo de validación y trazabilidad de errores antes de calcular, con alertas visibles |
| Alto | Dependencia de ISA (envío manual, llega tarde o no llega) | SLA interno con ISA o publicación parcial (placeholder) |
| Alto | Fuentes fuera de Capital IQ sin integrar (lifting cost, reservas Wood Mackenzie, ESG, Bloomberg/Bloomberg NEF) | Excluidas del núcleo; candidatas a Ola 2/3 |
| Medio | Sobre-alcance del MVP | Decisión V1/V2 y criterios de aceptación por sprint; **la simulación what-if del Monitor de Valor queda como Ola 3 o posterior, no en los 6 sprints** |
| Medio | Restricciones de seguridad o infraestructura | Plan Security-by-Design en la semana adicional de la Etapa 01; workspace y Databricks App validados desde la semana 1 |
| Medio | Expectativa de capa conversacional y simulación what-if | RF15 (capa conversacional) incluido en Sprint 6; what-if fuera de alcance, comunicarlo activamente en el roadmap |

[Nota de conversión] Inconsistencia interna: la tabla de RF define RF15 como "narrativa automática de hallazgos con IA", mientras el riesgo la llama "capa conversacional tipo chat". Y el DoR menciona backlog "RF01–RF14" aunque existe RF15.

## 9. Condiciones comerciales

1. **Contrato Marco vigente:** 3048550 – CW321794.
2. **IVA y tasas:** no incluidos; IVA vigente al facturar según normativa colombiana.
3. **Disponibilidad del equipo Ecopetrol:** Ecopetrol asegura equipo e invitados para taller y entrevistas, y toda la documentación necesaria; participación activa en todas las sesiones, incluidas las revisiones de cierre de los 6 sprints.
4. **Información financiera disponible:** VML asume muestras de estados financieros en Excel/CSV; la conexión a fuentes licenciadas depende de gestión y autorización de Ecopetrol desde el Setup.
5. **Lineamientos técnicos y de seguridad:** workspace Databricks gobernado por Ecopetrol, Streamlit como Databricks App, sin proceso formal de paso a producción; alineación con Unity Catalog desde la Etapa 00.
6. **Vigencia:** 30 días calendario; cambios de alcance se evalúan aparte bajo el mismo Contrato Marco.
7. **Forma de pago:** según el Contrato Marco.

## 10. Hoja de ruta — Evolución en cuatro olas

| Ola | Nombre | Contenido |
|---|---|---|
| **Ola 1 (esta propuesta)** | Conceptualización y MVP | Design Sprint, definición funcional/financiera/técnica, decisión V1/V2, MVP en 6 sprints sobre Databricks + Streamlit, hoja de ruta. 18 semanas. $542.604.840 COP |
| Ola 2 | Validación de fuentes | Conexión con fuentes internas (ERP, data lake) y externas licenciadas; automatización de ingesta; más compañías comparables |
| Ola 3 | Evolución analítica | Agentes de mapeo inteligente, detección de anomalías, recomendaciones con benchmarks históricos, evolución de la narrativa automática (RF15) |
| Ola 4 | Escalamiento corporativo | Gobierno maduro, automatización completa, operación recurrente, nuevas compañías del grupo y nuevas áreas |

## 11. Cierre y próximos pasos

**Mensaje:** "Reducir incertidumbre antes de avanzar" — entregar un MVP funcional real que reemplace el proceso manual en Excel, validar el flujo con usuarios reales, resolver de forma bloqueante ROACE y definir capacidades para escalar.

**Próximos pasos:**
1. Revisión y aprobación por el sponsor de Ecopetrol y el equipo de contratos.
2. Emisión de ODS bajo el Contrato Marco 3048550 – CW321794.
3. Kick-off con el equipo core de Finanzas, Tecnología y Datos.
4. Decisión V1 vs V2 y selección de fuentes al cierre de la semana 1.
