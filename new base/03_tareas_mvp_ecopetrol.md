# Tareas de Planeación y Construcción del MVP — Comparador Financiero Ecopetrol (v1)

> **Origen:** `ecopetrol-mvp-tasks-v1.xlsx` (1 hoja, `Sheet1`, 54 filas de tareas).
> **Qué es:** lista de trabajo del equipo para cerrar accesos, validar plataformas, mapear métricas, consolidar el diccionario, planear la arquitectura y construir el MVP. Es la vista "real" del avance de la etapa de definición, más granular que la propuesta y previa/paralela al working plan.
> **Columnas originales:** `#`, `Fase`, `Tarea`, `Descripción`, `Entregable esperado`, `Status`.
> **Importante para el agente:** las columnas **`Entregable esperado` y `Status` están vacías en todas las filas** del Excel. Por lo tanto **no hay estado registrado** para ninguna tarea; no se debe asumir que algo está completado. La fila #39 (`Construcción`) está vacía (parece un separador de sección).
> Las notas marcadas como **[Nota de conversión]** no están en el Excel; se agregaron para relacionar con los otros documentos.

---

## 1. Resumen por fase

| Fase | Filas | Propósito |
|---|---|---|
| 0. Accesos | #1–#12 | Conseguir accesos y credenciales a plataformas y fuentes de datos |
| 1. Validación de accesos | #13–#19 | Probar que los accesos/servicios funcionan de verdad |
| 2. Mapeo de métricas en plataformas | #20–#23 | Confirmar en qué plataforma vive cada métrica |
| 3. Diccionario de métricas | #24–#25 | Unificar definiciones y resolver decisiones técnicas |
| Planeación | #26–#38 | Contrato de datos, arquitectura, modelo de datos, permisos, gobernanza de IA, Definition of Ready |
| Construcción | #39–#54 | Implementación sobre Databricks (#39 vacía) |

Secuencia lógica implícita: Accesos → Validación → Mapeo → Diccionario → Planeación (cierra con el **Definition of Ready**, #38) → Construcción.

## 2. Tareas completas por fase

### 0. Accesos

| # | Tarea | Descripción | Entregable esperado | Status |
|---|---|---|---|---|
| 1 | Resolver el bloqueo de acceso de Marco García al Portal de Azure | Hoy solo tiene acceso a Power BI; sin esto no avanza nada técnico del lado de datos | — | — |
| 2 | Obtener credenciales técnicas de API de Capital IQ | Distinto de la licencia (ya confirmada): endpoint, cuotas, latencia, derechos de uso/redistribución | — | — |
| 3 | Obtener acceso a Artemisa y Hyperion | Sistemas internos que alimentan la mayoría de las métricas del lado Ecopetrol (CapEx, EBITDA, etc.) | — | — |
| 4 | Reevaluar si Bloomberg debe adelantarse en el roadmap | El archivo de métricas actualizado muestra varias métricas (TRR, Bond Spread, Precio Objetivo Analistas, comparativos ISA) que ya dependen de Bloomberg. | — | — |
| 5 | Registrar que Wood Mackenzie no es conectable por ahora | Confirmado explícitamente en la sesión de mapeo — mantiene Reservas/RRR fuera del MVP con más certeza. Se plantea en Planificacion la revisión para ver si podemos encontrar una solucion. | — | — |
| 6 | Solicitar acceso a Atomo | No aparece en el inventario de 34 accesos; alimenta casi toda la hoja de Andrea (TBG): seguridad, emisiones GEI, flujo de caja libre TBG | — | — |
| 7 | Solicitar acceso a SEC EDGAR | No aparece como plataforma propia en el mapeo de metricas pero se define en la arquitectura inicial. | — | — |
| 8 | Dar seguimiento a credenciales técnicas de Capital IQ | Separado de la licencia (ya confirmada). Pedir cobertura real, extracto de ejemplo, método de acceso, límites de tasa y derechos de almacenamiento/redistribución | — | — |
| 9 | Validar la API de Bloomberg en cuanto llegue | Foco inicial: probar las fórmulas ya identificadas (TRA para TRR, ANR para Precio Objetivo Analistas) | — | — |
| 10 | Solicitar acceso a Artemisa y Hyperion, y probarlos con una métrica real | No basta con que otorguen el acceso — correr una consulta real de CapEx (Artemisa) y ROACE/Payout (Hyperion) y comparar contra lo que Alejandra entrega manualmente | — | — |
| 11 | Solicitar accesos al Bi de Control y Reportes | Confirmar acceso a tableros de Power BI del archivo metricas. | — | — |
| 12 | Confirmar con Manuel si Lakebase / BD relacional sigue en pie | Está en estado 'No sigue (se evalúan alternativas)' — tú eres el principal, no la dejes sin resolución explícita | — | — |

### 1. Validación de accesos

| # | Tarea | Descripción | Entregable esperado | Status |
|---|---|---|---|---|
| 13 | Probar conectividad real a Capital IQ (cobertura, límites, latencia) | Una vez otorgadas las credenciales técnicas | — | — |
| 14 | Probar acceso a Artemisa/Hyperion con una consulta real | Confirmar que el acceso de consulta realmente trae los campos necesarios | — | — |
| 15 | Confirmar acceso de Alejandra al tablero de ROACE en Power BI | Bloqueante directo para cerrar la definición de ROACE | — | — |
| 16 | Confirmar habilitación de Baselake | Confirmar que tenemos disponible el servicio de base de datos relacionas para mvp | — | — |
| 17 | Confirmar habilitación completa de Unity Catalog | Confirmar que tenemos disponible el servicio | — | — |
| 18 | Confirmar servicios adicionales en Databricks | Confirmar que tenemos disponible el servicio | — | — |
| 19 | Confirmar Egress a Internet (Databricks) | Necesario tanto para scraping de respaldo como para las APIs de Capital IQ/Bloomberg | — | — |

### 2. Mapeo de métricas en plataformas

| # | Tarea | Descripción | Entregable esperado | Status |
|---|---|---|---|---|
| 20 | Confirmar en Capital IQ real cuáles de los 47 campos ya mapeados (Alejandra+Mauricio) están efectivamente disponibles | Antes se mapeó con base en el archivo del cliente; falta validar contra la plataforma real | — | — |
| 21 | Cerrar firma de negocio sobre la definición oficial de ROACE y EBITDA | Documentación de definiciones de métricas — pendiente según el archivo de accesos | — | — |
| 22 | Mapear los 33 Campos Base a su fuente real confirmada | Seguían sin fuente Ecopetrol en la última revisión — confirmar si la sesión los resolvió | — | — |
| 23 | Mapear metricas en archivos fuera de plataformas | Mapear las metricas que no se extraen de plataformas definidas y documentar scrappers necesarios para la ingesta. | — | — |

### 3. Diccionario de métricas

| # | Tarea | Descripción | Entregable esperado | Status |
|---|---|---|---|---|
| 24 | Consolidar CB + Alejandra + Andrea + Mauricio en un diccionario único | Fórmula, fuente Ecopetrol, fuente pares, unidad, periodicidad — una sola tabla de verdad | — | — |
| 25 | Resolver decisiones técnicas ya identificadas | EBITDA reportado vs. ajustado, IFRS16 en deuda neta, capex en FCF, factor de conversión de gas, ventanas LTM desalineadas | — | — |

### Planeación

| # | Tarea | Descripción | Entregable esperado | Status |
|---|---|---|---|---|
| 26 | Contrato de datos — fuentes confirmadas | 8 compañías del pool con método de adquisición, más Ecopetrol/ISA y Capital IQ | — | — |
| 27 | Mapear cobertura real de Capital IQ | Definición de metricas disponibles en Capital IQ por medio de API | — | — |
| 28 | Recibir el Excel de fórmulas del cliente | ROACE y demás métricas, con metodología ya definida por el cliente | — | — |
| 29 | Solicitar reportes manuales. | Solicitar reportes manuales para validar data extraida y calculada. | — | — |
| 30 | Mapear fuente interna de Ecopetrol por métrica (Hyperion / Modelo Semántico / Control y Reportes / Tesorería / Artemisa) | La mayoría de las métricas de las hojas Alejandra/Andrea/Mauricio no tienen sistema de origen interno decidido | — | — |
| 31 | Arquitectura Databricks | Una vez validados accesos y servicios, generar arquitectura para el MVP con los servicios disponibles en databricks (Unity Catalog, Databricks Apps, Baselake, etc) | — | — |
| 32 | Diseñar el modelo físico Bronze/Silver/Gold | Catálogos, esquemas, convención de nombres y particionamiento reales en Unity Catalog | — | — |
| 33 | Diseñar la extensibilidad de Bronze | Que Bloomberg u otras compañías/fuentes nuevas entren sin rediseño estructural | — | — |
| 34 | Diseñar el esquema de StandardMetric / MetricDefinition | Estructura de columnas y relaciones, sin la fórmula final todavía | — | — |
| 35 | Diseñar el modelo de permisos (6 roles → Entra ID → Unity Catalog) | Mapear los 6 roles fijos del TO-BE a grupos de Entra ID y permisos de tabla/fila; cualquier usuario nuevo encaja en uno de los 6 | — | — |
| 36 | Definir la gobernanza de IA del producto | Resolver los 5 puntos identificados en el análisis del TO-BE: alcance de búsqueda, costo, aprobación humana antes de publicar | — | — |
| 37 | Decidir si Compliance/Auditor cubre la gobernanza de IA de producto o se crea un agente nuevo | Definición de alcance de agentes antes de construir | — | — |
| 38 | Consolidar el Definition of Ready de Planeación | Un documento que reúna todo lo cerrado y lo pendiente antes de pasar a Construcción | — | — |

### Construcción

| # | Tarea | Descripción | Entregable esperado | Status |
|---|---|---|---|---|
| 39 | *(vacía)* |  | — | — |
| 40 | Provisionar Unity Catalog | Catálogos y esquemas base, grupos de Entra ID sincronizados | — | — |
| 41 | Construir ingesta Bronze — Capital IQ | Delta Sharing / API como método primario de adquisición | — | — |
| 42 | Construir ingesta Bronze — scraper de respaldo | Solo para lo que Capital IQ no cubra, según la matriz de cobertura | — | — |
| 43 | Construir ingesta Bronze — carga manual Ecopetrol/ISA | Vía plantillas de SharePoint sincronizadas con Autoloader | — | — |
| 44 | Construir el motor de homologación (Silver) | MappingRule, normalización IFRS vs. US GAAP, moneda y periodo | — | — |
| 45 | Construir el motor de cálculo (Gold) | Requiere las fórmulas de métricas ya confirmadas por el cliente | — | — |
| 46 | Implementar la extensibilidad del pool de compañías | Probar que agregar una compañía nueva no rompe el modelo ni requiere rediseño | — | — |
| 47 | Implementar permisos reales en Unity Catalog | Aplicar el modelo de roles diseñado en Planeación | — | — |
| 48 | Especificar prompts, modelos y guardrails de la IA del producto | Documento operativo sección por sección (Definición, Resultados, Dashboard, Presentaciones) | — | — |
| 49 | Configurar Databricks Apps (frontend) | Hosting de la aplicación; conexión a Gold (vía SQL Warehouse) y a Lakebase | — | — |
| 50 | Configurar Lakebase para el estado transaccional | Usuarios, configuración de reportes, comentarios, escenarios en edición | — | — |
| 51 | QA de datos — completitud y consistencia | Chequeos automatizados sobre Silver y Gold | — | — |
| 52 | Revisión financiera de métricas calculadas | Detectar outliers y validar sentido de negocio antes de publicar | — | — |
| 53 | Auditoría de trazabilidad y cumplimiento regulatorio | Verificar linaje completo del dato hacia los requisitos de la SFC/BVC | — | — |
| 54 | Probar la gobernanza de IA del producto | Validar que los guardrails de costo, alcance y aprobación funcionan como se diseñaron | — | — |

## 3. Análisis para el timeline [Nota de conversión]

### 3.1 Tareas duplicadas o solapadas

El Excel tiene tareas que repiten el mismo objetivo con distinto nivel de detalle. Conviene tratarlas como una sola línea de seguimiento:

| Tema | Filas | Comentario |
|---|---|---|
| Credenciales técnicas Capital IQ | #2, #8 (→ #13, #27, #20) | #2 obtener; #8 seguimiento con detalle (cobertura, extracto de ejemplo, método de acceso, límites, derechos); #13 prueba real; #27 mapear cobertura vía API; #20 validar los 47 campos |
| Artemisa y Hyperion | #3, #10 (→ #14, #30) | #3 obtener; #10 solicitar y probar con métrica real (CapEx en Artemisa, ROACE/Payout en Hyperion) contra lo que entrega Alejandra; #14 validación |
| Lakebase / BD relacional | #12, #16 (→ #50) | #12 confirmar con Manuel si sigue (estado registrado: "No sigue (se evalúan alternativas)"); #16 dice "Baselake" — casi seguro errata de **Lakebase**; #50 lo usa en Construcción |
| Bloomberg | #4, #9 | #4 reevaluar adelantarlo en el roadmap; #9 validar API apenas llegue (fórmulas TRA→TRR, ANR→Precio Objetivo Analistas) |
| ROACE / EBITDA | #15, #21, #25, #28 | #15 acceso de Alejandra al tablero ROACE en Power BI (bloqueante); #21 firma de negocio de la definición; #25 decisiones técnicas; #28 Excel de fórmulas del cliente |

### 3.2 Cadena de dependencias (inferida del texto de las tareas)

- **Datos Azure/Ecopetrol:** #1 (acceso de Marco García a Azure; "sin esto no avanza nada técnico del lado de datos") → #13/#14/#17/#18/#19 → #31 arquitectura → #32–#35 → #40 Unity Catalog → #41–#45 ingesta y motores.
- **Capital IQ:** #2/#8 → #13 → #20 y #27 → #26 contrato de datos → #41 ingesta Bronze Capital IQ → #42 scraper de respaldo (solo lo no cubierto, según la matriz de cobertura).
- **Fuentes internas:** #3/#10, #6 (Átomo), #11 (BI Control y Reportes) → #14 → #22 y #30 (mapeo de fuente interna por métrica) → #24 diccionario.
- **Métricas:** #15 → #21 + #28 → #25 → #24 diccionario único → #34 esquema StandardMetric → #45 motor de cálculo Gold ("requiere las fórmulas de métricas ya confirmadas por el cliente").
- **Seguridad:** #35 modelo de permisos (6 roles → Entra ID → Unity Catalog) → #40 → #47.
- **IA:** #36 gobernanza → #37 alcance de agentes → #48 prompts/guardrails → #54 pruebas.
- **Puerta de entrada a Construcción:** #38 Definition of Ready consolida todo lo anterior.

### 3.3 Bloqueantes explícitos según el propio texto

1. **#1** acceso de Marco García al Portal de Azure (hoy solo Power BI).
2. **#15** acceso de Alejandra al tablero de ROACE en Power BI → bloquea cerrar la definición de ROACE.
3. **#21** firma de negocio de ROACE y EBITDA (también es condición del Definition of Ready en la propuesta).
4. **#19** egress a Internet desde Databricks → necesario para APIs de Capital IQ/Bloomberg y scraping de respaldo.
5. **#12** decisión sobre Lakebase → el working plan ya la usa desde Sprint 0 (T-003).
6. **#45** motor de cálculo Gold depende de fórmulas confirmadas (#28).

### 3.4 Fuentes de datos y sistemas mencionados

| Sistema | Uso / métricas | Estado según el Excel |
|---|---|---|
| Portal de Azure | Base técnica del lado de datos | Marco García sin acceso (solo Power BI) |
| Capital IQ | Fuente principal de pares; 47 campos ya mapeados por Alejandra y Mauricio | Licencia confirmada; credenciales técnicas de API pendientes |
| Bloomberg | TRR, Bond Spread, Precio Objetivo Analistas, comparativos ISA | Fuera del MVP en la propuesta; se plantea adelantarlo |
| Wood Mackenzie | Reservas / RRR | No conectable por ahora (confirmado en sesión de mapeo); revisión en Planeación |
| Artemisa | CapEx y otras métricas de Ecopetrol | Acceso pendiente |
| Hyperion | ROACE, Payout, EBITDA, etc. | Acceso pendiente |
| Átomo | Hoja de Andrea (TBG): seguridad, emisiones GEI, flujo de caja libre TBG | No está en el inventario de 34 accesos; acceso pendiente |
| SEC EDGAR | Definido en la arquitectura inicial | No aparece en el mapeo de métricas; acceso pendiente |
| BI de Control y Reportes (Power BI) | Tableros del archivo de métricas | Acceso por confirmar |
| Modelo Semántico, Tesorería | Posibles fuentes internas por métrica (#30) | Sin decidir |
| Databricks: Unity Catalog, Databricks Apps, SQL Warehouse, Lakebase, Autoloader, Delta Sharing | Plataforma del MVP | Habilitación por confirmar (#16–#19) |
| SharePoint | Plantillas de carga manual Ecopetrol/ISA (sincronizadas con Autoloader) | Diseño |
| Microsoft Entra ID | Grupos para los 6 roles del TO-BE | Diseño |

### 3.5 Cifras y artefactos referenciados

- **47 campos** ya mapeados en Capital IQ (Alejandra + Mauricio), pendientes de validar contra la plataforma real.
- **33 Campos Base** sin fuente Ecopetrol confirmada en la última revisión.
- **34 accesos** en el inventario de accesos (Átomo no está incluido).
- **8 compañías del pool** + Ecopetrol/ISA + Capital IQ en el contrato de datos.
- **6 roles fijos** del TO-BE para permisos.
- **5 puntos** de gobernanza de IA del producto (alcance de búsqueda, costo, aprobación humana antes de publicar, entre otros).
- Hojas del archivo de métricas por responsable: **CB** (Campos Base), **Alejandra**, **Andrea** (TBG), **Mauricio**.
- Decisiones técnicas abiertas del diccionario (#25): EBITDA reportado vs. ajustado, IFRS 16 en deuda neta, CapEx en FCF, factor de conversión de gas, ventanas LTM desalineadas.
- Regulación: linaje del dato hacia requisitos de la **SFC/BVC** (#53).

### 3.6 Personas mencionadas en el Excel

- **Marco García** — requiere acceso al Portal de Azure (lado de datos).
- **Alejandra** — entrega hoy métricas manualmente (CapEx, ROACE/Payout); mapeó campos de Capital IQ; necesita acceso al tablero ROACE.
- **Andrea** — dueña de la hoja TBG (alimentada por Átomo).
- **Mauricio** — co-mapeó los campos de Capital IQ; tiene hoja propia de métricas.
- **Manuel** — responsable principal de la decisión sobre Lakebase/BD relacional (#12: "tú eres el principal").
