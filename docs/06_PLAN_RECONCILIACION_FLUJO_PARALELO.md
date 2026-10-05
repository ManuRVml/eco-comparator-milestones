# Plan de reconciliación y trabajo en paralelo de BenchHub

Fecha de preparación: 5 de octubre de 2026. Este documento define la implementación propuesta para reconciliar las fuentes de planificación y adaptar el seguimiento a trabajo adelantado, incidentes y dependencias parciales. Preparar este plan no modifica estados, publicaciones ni datos de la aplicación.

El resultado será un plan operativo trazable sobre el timeline actual. Los equipos podrán tomar trabajo preparado y entregar partes utilizables mientras se resuelven accesos e integraciones. Cada compromiso conservará su fecha original, su previsión vigente y su criterio de aceptación.

## Acuerdos que gobiernan la implementación

- Conservar datos, evidencia, notas, publicaciones, bitácora y referencias originales. Una actividad que salga del alcance activo seguirá disponible en el historial.
- Mantener el estilo visual del timeline: L1/L2/L3, bandas de sprints, milestones, paleta y paneles de detalle. La vista por equipo será complementaria.
- Mantener Sprint 0 del 21 al 25 de septiembre de 2026: una semana y cinco días hábiles. Los seis sprints siguientes duran dos semanas cada uno; el calendario ocupa trece semanas. Los festivos conservan su tratamiento actual.
- Usar los sprints como ventanas de objetivos y revisión. Una tarea preparada de un sprint posterior puede adelantarse sin cambiar su compromiso original.
- Reconocer implementación, integración y aceptación como hechos distintos, cada uno respaldado por evidencia.
- Conservar la aprobación humana para publicar avance oficial. Un import, una fecha alcanzada o una nueva clasificación no publican entregas.
- Aplicar preparación por actividad y entregable. Cada pendiente del Definition of Ready debe indicar qué trabajo afecta.
- Conservar dependencias existentes como relaciones históricas sin imponer fin a inicio. Su significado operativo se revisará individualmente.

## Evidencia de partida y límites

El análisis de la base SQLite local encontró 99 tareas, 65 HU, 10 milestones, 3 líneas y 7 sprints. Hay 60 HU MVP con 263 SP y 5 HU R2 con 18 SP. Se observaron 25 tareas técnicas Hecha y cero tareas publicadas. Estos valores describen la copia local inspeccionada y deben levantarse nuevamente sobre la base objetivo antes de migrar.

El plan de `new base` contiene 80 tareas. De ellas, 79 coinciden por nombre con actividades actuales y solo 7 conservan el mismo ID y nombre. La coincidencia de nombre es una candidatura de correspondencia; se verificará también descripción, HU, responsabilidad y resultado esperado.

El registro de recursos tiene corte del 2 de octubre de 2026. Sus 24 de 34 hitos de habilitación DEV representan un alcance distinto del avance de tareas o HU. Sus verificaciones se conservarán con esa fecha; este plan no certifica el estado actual de ambientes externos.

Fuentes de trabajo:

| Fuente | Uso en la reconciliación |
| --- | --- |
| `new base/01_propuesta_benchmark_financiero.md` | Compromisos contractuales y exclusiones |
| `working_plan_BenchHub_v2 2 EQUIPO.xlsx` y datos actuales | Desglose técnico de 99 tareas e historial |
| `new base/02_working_plan_benchhub.md` | Plan de 80 tareas, fechas y H-01 a H-07 |
| `new base/03_tareas_mvp_ecopetrol.md` | Prerrequisitos, definiciones y construcción; sin responsables completos ni fechas |
| `new base/recursos_refestecp.md` | Evidencia fechada de recursos y pendientes DEV |
| `data/evidence/matriz_evidencia.csv` | Evaluaciones previas con sus fuentes y fechas |
| `docs/02_PROPUESTA_MILESTONES_MANUEL.md` | M-01 a M-10, líneas de valor y demos |
| `docs/05_SPEC_APP_SEGUIMIENTO.md` | Comportamiento actual y separación de capas |

## Modelo de trabajo propuesto

### Compromisos por resultado

Cada compromiso de sprint tendrá resultado esperado, criterio verificable, entrega mínima útil, responsable de coordinación y actividades contribuyentes. Sus fechas serán fecha base y previsión actual; demostración y aceptación tendrán fechas propias.

Los H-01 a H-07, M-01 a M-10 y weeklies mantendrán su identidad y se relacionarán explícitamente. La correspondencia puede ser de varios a varios. Una actividad puede contribuir a varios resultados sin duplicarse en los totales del proyecto.

### Ejecución y validación

La ejecución propuesta distingue Pendiente, Lista para empezar, En curso, Bloqueada y Terminada. La validación registra evidencia de implementación, integración y aceptación. También permite Sin verificar y No aplica con justificación; una aceptación no genera automáticamente pruebas de integración inexistentes.

La migración conserva íntegros los estados anteriores. Hecha seguirá significando el estado técnico legado: no se convertirá automáticamente en Integrada o Aceptada. Los registros ambiguos quedarán pendientes de revisión y visibles para el editor.

Un bloqueo se registra por separado y puede afectar inicio, una parte de ejecución, integración o aceptación. Una tarea con ejecución terminada puede tener integración bloqueada. Cuando solo una parte de una tarea grande queda impedida, se identificará esa parte antes de marcar el trabajo completo como bloqueado.

En la vista oficial se distinguirá preparación o planificación de ejecución confirmada. La fecha de inicio alcanzada por sí sola no será evidencia de trabajo iniciado. El avance publicado conservará su requisito de aprobación y las restricciones de visibilidad existentes.

### Dependencias con insumos concretos

| Relación propuesta | Información requerida | Consecuencia |
| --- | --- | --- |
| Bloqueo real | Insumo, actividad afectada, momento requerido y criterio de liberación | Detiene únicamente el trabajo que necesita ese insumo |
| Entrega parcial | Artefacto o versión acordada, proveedor y consumidor | Habilita trabajo con el alcance disponible |
| Coordinación | Acuerdo o revisión esperada y participantes | Genera seguimiento sin impedir automáticamente comenzar |
| Integración o aceptación | Ambiente, datos y prueba requerida | Condiciona validar o entregar el resultado |

La clasificación nueva es una propuesta operativa; no se deduce automáticamente de Predecesoras o Paralelo_Con. Se conservarán el valor de origen y la decisión que lo interpreta. Las relaciones duras se comprobarán para detectar ciclos imposibles; las relaciones de coordinación pueden ser recíprocas.

### Trabajo preparado e incidentes

Cada equipo tendrá una cola priorizada. Lista para empezar exige resultado claro, insumos suficientes, responsable y criterio verificable. Con contratos provisionales o muestras debe registrarse la limitación y el riesgo de retrabajo.

Ante un incidente o bloqueo, el equipo identifica impacto y severidad, conserva el trabajo pendiente, registra responsable y próxima revisión, y toma la siguiente actividad preparada. Prioriza restaurar el servicio afectado, liberar a otros equipos y completar resultados próximos. El criterio concreto de severidad y los límites de trabajo simultáneo se acordarán durante el piloto.

El esfuerzo de incidentes y su efecto en compromisos se registrarán. La reserva de capacidad se decidirá con datos del equipo, sin fijar un porcentaje arbitrario. Se mantendrá seguimiento de las actividades bloqueadas aunque se adelante otra tarea.

## Reconciliación del frente de Datos

El nuevo working plan asigna explícitamente estas cinco actividades al Ingeniero de Datos:

| ID de origen | Actividad | Sprint |
| --- | --- | --- |
| T-003 | Modelo relacional en Lakebase | 0 |
| T-029 | Conectores de ingesta Capital IQ | 2 |
| T-034 | Cálculo de cobertura | 3 |
| T-053 | Motor determinístico de simulación | 4 |
| T-078 | Integridad de datos en PRD | 6 |

La lista MVP añade mapeo de fuentes, modelo Bronze/Silver/Gold, StandardMetric y MetricDefinition, ingestas, homologación, cálculo, extensibilidad y calidad. Estas actividades no tienen asignación completa en la fuente. Se propondrá un responsable y colaboradores por resultado, conservando la distinción entre construcción de Datos, permisos de Infraestructura, validación de QA y firma financiera de negocio.

Marco García está identificado en el registro de recursos como responsable de T-003. Sus pendientes de Lakebase, Fabric y fuentes se relacionarán con las actividades concretas afectadas, conservando el corte del registro. No se extenderá esa asignación automáticamente a todo el catálogo.

Se cruzarán estas actividades con las 14 tareas de Datos de la base actual. Se conservará el trabajo adicional de Medallion e integración hasta resolver su pertenencia al alcance. La ausencia de tareas explícitas en Sprint 1 y Sprint 5 del nuevo plan no se interpretará como disponibilidad de capacidad.

Las entregas parciales propuestas para este frente son esquema o contrato, muestra de datos, primera ingesta utilizable, métricas homologadas y dataset certificado. Se concretarán por fuente y métrica, para que Frontend y Backend sepan qué pueden consumir y qué sigue pendiente.

## Cambios propuestos en la aplicación

Las ampliaciones serán aditivas y reutilizarán entidades, importadores, cálculo, editor y paneles actuales. El diseño físico definitivo se decidirá después de la matriz de correspondencias.

| Capacidad | Cambio propuesto |
| --- | --- |
| Fuentes y líneas base | Versiones con fecha, procedencia, huella y referencia original |
| Correspondencias | Referencia por fuente y versión vinculada a identidad estable; admitir agrupaciones y divisiones |
| Plan operativo | Pertenencia al alcance activo y motivo de exclusión, independiente del historial |
| Compromisos | Resultado, criterios, vínculos H/M, fechas base y previsiones con historial |
| Trabajo | Preparación y ejecución; validaciones con evidencia y alcance de la prueba |
| Dependencias | Interpretación operativa, insumo, momento requerido y criterio de liberación |
| Bloqueos e incidentes | Impacto, responsable, actividad afectada, revisión y resolución |
| Importación | Simulación, conflictos semánticos y aplicación idempotente de correspondencias revisadas |
| Timeline | Mantener aspecto y agregar previsión, entregas parciales y bloqueos en los detalles |
| Vista por equipo | Filtro o vista complementaria sobre las mismas actividades |
| Métricas | Entrega oficial, avance técnico, validación y salud del flujo con denominadores explícitos |

Los conflictos de identidad deberán impedir aplicar los registros ambiguos. Importar un archivo de 80 tareas no sobrescribirá una actividad distinta que comparta T-xxx. Un cambio de relación creará una versión vigente; la relación previa seguirá consultable, sin seguir afectando los cálculos actuales.

Las fuentes se leerán desde registros versionados o artefactos de importación explícitos. La aplicación desplegada no dependerá de que exista una carpeta local `new base`.

## Fases de implementación y salidas verificables

### Fase 1 Respaldo e inventario

Identificar la base objetivo, crear una copia consistente y ensayar su restauración. Inventariar tablas, relaciones y contenido de los campos gestionados por la app. Registrar identidad del ambiente y fuentes. Los respaldos permanecerán fuera del control de versiones.

Salida: copia restaurable e inventario reproducible. Se verifica acceso a todo el contenido previo y consistencia de relaciones.

### Fase 2 Correspondencias y decisiones

Generar matriz con identidad actual, fuente, versión, ID de origen, nombre, descripción, HU, área, responsable, fechas, criterio, tipo de correspondencia, confianza y decisión. Identificar actividades adicionales, divididas, agrupadas y fuera del alcance activo. Producir correspondencia H/M y catálogo de bloqueos de Datos y autenticación.

Salida: matriz revisable y registro de decisiones. Los casos sin resolución conservan su estado previo y no se aplican automáticamente. Se confirma el total de actividades activas después de deduplicar por identidad y contenido.

### Fase 3 Modelo e importación seguros

Agregar capacidades al esquema y adaptar los importadores. Implementar simulación con cambios de plan, relaciones, alcance y métricas; prohibir transferencia implícita de evidencia o publicaciones entre actividades. Validar migraciones sobre una copia y ejecución repetida sin duplicados.

Salida: migración aditiva, simulación auditable y pruebas de preservación. Los cambios de importación normal siguen respetando los campos gestionados por el editor.

### Fase 4 Piloto de autenticación y navegación

Reconciliar actividades de H-02 y M-01 usando sus IDs de fuente. Mantener H-02 del 9 de octubre y M-01 del 15 de octubre como referencias distintas, sin asumir equivalencia exacta de criterios. Revisar evidencia de pantalla, contratos, sesiones, RBAC y pruebas; separar lo implementado de lo integrado y aceptado.

Identificar App Registration, grupos y accesos pendientes con alcance preciso. Preparar las siguientes actividades útiles por equipo y registrar la previsión con sus supuestos. Ensayar un bloqueo externo y un incidente sin perder el seguimiento del resultado.

Salida: primer entregable operado con la metodología y decisión concreta sobre límites de trabajo, revisiones de bloqueos y respuesta a incidentes.

### Fase 5 Timeline y frente de Datos

Incorporar la información nueva en los paneles y filtros del timeline actual. Mostrar fecha base y previsión sin mover silenciosamente el compromiso. Mantener publicación oficial y ocultación de evidencia interna para el rol de consulta. Aplicar el mismo flujo a ingesta, homologación y resultados, con contratos y muestras explícitos.

Salida: equipos trabajando sobre una cola común trazable; lectura clara de trabajo adelantado, integración pendiente y bloqueos. El Sprint 0 mantiene su ancho temporal de una semana.

### Fase 6 Activación y seguimiento

Activar el plan reconciliado después de validar sobre una copia. Registrar el lote aplicado y comparar el inventario anterior y posterior. Revisar compromisos y resultados en weekly, y bloqueos según su próxima revisión. Conservar una vía de reversión de la activación sin borrar nuevas notas ni actualizaciones.

Salida: plan operativo activo, historial consultable y reporte de conciliación. Despliegue y cambios sobre la base viva requieren una solicitud que incluya ese alcance.

## Validación y criterios de aceptación

La selección de pruebas será acotada a las capacidades modificadas y respetará los hooks y comandos del repositorio. La documentación sola no exige ejecutar la aplicación. En cada PR de implementación se registrará su base real y el alcance; los checks existentes tendrán un único dueño.

- Todo registro previo conserva identidad o una correspondencia explícita; evidencia, publicaciones, notas y bitácora siguen accesibles y asociadas al trabajo correcto.
- Las diferencias de conteos se explican mediante altas, agrupaciones o cambios de pertenencia; no se consideran pérdida por una simple comparación de totales.
- Importar dos veces no agrega actividades o relaciones duplicadas. Un conflicto semántico no modifica el registro ambiguo.
- La restauración recupera el estado respaldado; la reversión posterior a la activación conserva escrituras nuevas mediante historial de versiones y lotes.
- Una tarea heredada Hecha no obtiene integración, aceptación o publicación por la migración.
- Una actividad que contribuya a dos milestones cuenta una sola vez en los totales del proyecto. Las métricas históricas conservan el alcance y denominador de su línea base.
- Un bloqueo de aceptación permite ejecutar trabajo preparado; un bloqueo de inicio detiene solo las actividades que necesitan el insumo.
- Una fecha planificada alcanzada no certifica inicio real. Un incidente conserva su impacto en capacidad y previsión.
- Las relaciones de coordinación no generan restricciones fin a inicio. Las dependencias duras no contienen ciclos imposibles.
- El rol de consulta conserva protección frente a mutaciones y evidencia interna. La publicación oficial sigue requiriendo aprobación.
- Timeline, paneles, móvil, selección de milestone y enlaces existentes conservan su uso. Sprint 0 ocupa una semana y los demás dos semanas cada uno.

La revisión de diseño se hará sobre los módulos modificados: responsabilidad única, reutilización, puertos pequeños y dirección de imports. Se extenderán los puntos existentes antes de crear lógica paralela.

## Decisiones pendientes con tratamiento provisional

| Decisión | Tratamiento hasta resolverla |
| --- | --- |
| Correspondencia de las 13 semanas con las 18 contractuales | Conservar fechas originales y registrar la diferencia |
| Simulación y alcance adicional frente a la propuesta | Conservar actividades y señalar alcance pendiente de decisión |
| Fuente aprobada para cada métrica y arquitectura de datos | Registrar fuente y decisión por métrica o capacidad; permitir diseños y muestras identificadas |
| Responsables de actividades MVP sin asignación | Mostrar Sin asignar y propuesta de colaboradores |
| Total de tareas activas | Determinarlo después de correspondencias y decisiones |
| Severidad de incidentes, capacidad reservada y límites por equipo | Definirlos en el piloto con capacidad e impacto observados |
| Demostración del 17 de diciembre y validación final del 18 | Conservar ambas fechas y definir qué criterio satisface cada una |
| Estado real de permisos y recursos después del 2 de octubre | Mantener evidencia fechada y solicitar o verificar nueva evidencia dentro del alcance autorizado |

Estas decisiones afectan sus actividades y criterios concretos. Las fases de inventario, correspondencias y preparación pueden avanzar mientras se resuelven.


## Implementación local verificada

El 5 de octubre se implementó la reconciliación en la rama `task/reconciliacion-flujo` del repositorio independiente `seguimiento-app`, commit `ce62274`. El procedimiento operativo está en `seguimiento-app/docs/RECONCILIACION.md`. Se preparó y activó una copia local de vista previa; la base habitual conserva exactamente el contenido de sus 21 tablas iniciales.

La copia conserva 99 tareas y relaciona 77 de las 80 referencias nuevas por nombre, descripción, HU y rol. Tres correspondencias quedan pendientes de revisión. Las 53 actividades no vacías de la lista MVP se conservan sin asignación automática. Se mantienen Sprint 0 de una semana, todas las fechas base y el estilo del timeline.

Se verificaron 8 casos de reconciliación y 22 comprobaciones E2E en dos archivos de prueba, compilación, TypeScript y lint de los archivos modificados. El código añade trabajo por equipo, validaciones independientes, bloqueos por momento, relaciones versionadas, previsiones con historial y consulta de las fuentes completas.

La relación de H-02 con M-01 y las decisiones de alcance y asignación requieren criterio explícito del equipo y pueden registrarse en la app. No se ha aplicado la migración a la base habitual ni se ha desplegado. El repositorio de la app no tiene remoto configurado; la entrega mediante PR y CI queda pendiente de identificar repositorio y rama destino.
