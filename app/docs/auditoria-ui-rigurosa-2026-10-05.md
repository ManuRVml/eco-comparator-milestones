# Auditoría rigurosa de UI — Milestones

Fecha: 5 de octubre de 2026. Aplicación: https://benchhub-seguimiento.vercel.app. Referencia de negocio: `guia-milestones-contexto.md`.

## Conclusión

La aplicación representa milestones y revisiones de sprint, pero presenta problemas de navegación móvil, desbordamiento, contraste y teclado. La jerarquía del timeline dedica demasiado espacio inicial a explicaciones y ejecución antes de mostrar las entregas. No considero cerrada la revisión visual con estos problemas pendientes.

La corrección debe conservar el estilo del timeline, los nombres completos, los diez milestones y los siete cierres S0–S6. El avance del trabajo y la aceptación del resultado deben seguir distinguiéndose explícitamente.

## Alcance y evidencia

- 110 combinaciones de vista, rol y tamaño inspeccionadas en producción: cliente 27, administrador 48, editor 32 y acceso público 3. Son capturas auditadas, no 110 casos de prueba funcionales.
- Escritorio 1440 × 1000; tablet 768 × 1024; móvil 390 × 844. Editor cubierto en escritorio y móvil; cliente y administrador también en tablet.
- Resumen, timeline, cierre S0, milestone M-04, áreas, Frontend, agenda, tarea T-001, historia HU-001; además tareas del editor, configuración, visibilidad, flujo, fuentes, verificación, bitácora y login.
- Capturas, dimensiones del DOM, revisión manual de pantallas y código, axe-core 4.10.3 y cinco recorridos de interacción por teclado/navegación.
- 110 respuestas HTTP 200, cero errores JavaScript registrados y cero solicitudes de escritura. La base de datos y la aplicación no se modificaron.
- 12 capturas con desbordamiento global; 69 con al menos una incidencia automatizada. Ocho familias de reglas detectadas. Estos conteos incluyen la repetición del mismo componente en distintos roles y tamaños; no son 69 defectos independientes.
- Se corrigió la ruta de la muestra de Frontend a `/areas?area=frontend`: ocho capturas iniciales con un identificador inválido se reemplazaron y no integran la matriz final.
- La medición final de densidad excluye elementos no pintados mediante `Element.checkVisibility`; se conserva la evidencia de accesibilidad de las mismas rutas. Se revisaron además capturas completas y un desplazamiento horizontal del timeline móvil.

Artefactos locales: `data/reconciliation/ui-rigurosa/informe-interactivo.html`, capturas PNG, `receipt.json` y `interactions.json`. Los artefactos se mantienen fuera del repositorio para no publicar contenidos internos de los roles administrativos.

## Hallazgos priorizados

P1: corregir antes de considerar lista la experiencia en los tamaños afectados. P2: afecta comprensión o uso y debe entrar en el siguiente ajuste de UI. P3: refinamiento. No se identificó un P0 en esta inspección.

| ID | Prioridad | Hallazgo y evidencia | Ajuste recomendado |
| --- | --- | --- | --- |
| UI-01 | P1 | Desbordamiento global. Timeline/S0 a 768 px: documento de 925 px para cliente y 931 px para administrador. Tabla `.ms-table` sale del contenedor. En móvil, tarea editable: 485 px; tareas del editor: 678 px; flujo: 660 px frente a 390 px. | Contener tablas en todos los tamaños, permitir que columnas y formularios se contraigan y adaptar listas operativas a tarjetas cuando corresponda. El desplazamiento interno del roadmap es válido; el de toda la página es el defecto. |
| UI-02 | P1 | Panel móvil funciona visualmente como una hoja modal, pero carece de `role="dialog"`/`aria-modal`, no mueve el foco y deja activo el fondo. Tras abrir S0 con Enter, seis Tab pasan por S1–S6 antes de entrar al panel. Escape sí cierra. | Definir el patrón: diálogo modal con foco inicial, contención, fondo inerte y retorno al disparador; o panel realmente no modal con navegación y presentación coherentes. |
| UI-03 | P1 | Contraste insuficiente en identificadores y fechas relevantes: blanco/ámbar de los mini milestones 1,66:1; blanco/gris 1,97:1; L2 2,21:1; L3 3,44:1; Hoy 3,76:1. | Cambiar color de texto o fondo conservando identidad y añadir texto/símbolo de estado. Validar cada combinación efectiva, incluidas variantes de estado. |
| UI-04 | P1 | Menú móvil oculta la sección activa. En configuración, la ventana del menú va de x=172,5 a 390; “Panel del editor” aparece de x=876,9 a 1016,5 y `scrollLeft=0`. La barra de desplazamiento está oculta. | Menú desplegable o drawer accesible, sección actual visible y acceso claro a administración. Como mínimo, revelar automáticamente el elemento activo y mostrar que hay más opciones. |
| UI-05 | P1 | Detalle de Frontend: diez enlaces a milestones anidados dentro de `summary`, un control interactivo. axe detecta `nested-interactive` en los diez encabezados. | Separar el enlace del disparador del acordeón, manteniendo ambos accesibles y con áreas de activación distintas. |
| UI-06 | P1 | Detalle de Frontend: tres objetivos de enlace incumplen la comprobación de tamaño/espaciado de axe. Ejemplos: M-03 23,9 × 42 px y espacio seguro 23,8 px; M-06 33,6 × 21 px y espacio seguro 21 px. | Añadir espacio de activación y separación de vecinos; verificar los ocho contextos del detalle de área. |
| UI-07 | P2 | Timeline fuera de la primera pantalla: contenedor móvil a y=1112,5 y primer nodo a y=1230,5 frente a 844 px de alto. El primer milestone de entrega empieza a y=1152 en escritorio y a y=1579 en móvil, después de las revisiones; explicaciones/KPI dominan antes. En móvil la columna inicial ocupa 230 de los 360 px del contenedor, dejando 130 px frente a tarjetas de 164 px. | Compactar cabecera y explicación sin quitar avisos; agrupar métricas de ejecución en una sección expandible. En móvil, poner nombre de línea arriba de su carril o habilitar un modo agenda del mismo timeline. Mantener S0–S6 y nombres completos. |
| UI-08 | P2 | Pestañas del editor usan `role="tab"`, pero ArrowRight mantiene el foco en “Tareas”. | Implementar el patrón completo de pestañas, o presentar enlaces de navegación con semántica nativa si cambian de vista por URL. |
| UI-09 | P2 | Gráfica por área: los siete enlaces de nombres usan `role="rowheader"` en el propio enlace. axe detecta `aria-allowed-role`; el rol puede sustituir la semántica de enlace. | Encabezado de fila que contenga un enlace o estructura nativa de tabla; preservar nombre, porcentaje y comparación como contenido legible. |
| UI-10 | P2 | Formularios de configuración móvil con fuentes de 13,6 px y 12,5 px; 41 campos en la muestra M-04. El tamaño puede provocar zoom al enfocar en Safari/iOS, que no fue ejecutado en esta auditoría. | Campos de al menos 16 px en móvil; cuerpo y etiquetas legibles, ancho útil consistente y ayudas próximas al campo. Verificar en un iPhone real. |
| UI-11 | P2 | Vistas operativas muy largas en móvil: flujo 17415 px, fuentes 16146 px, tareas del editor 12614 px. Fuentes ya tiene referencias plegables y filtros, pero monta 136 formularios y 133 referencias. No son 136 formularios simultáneamente visibles. | Conservar filtros; añadir búsqueda, agrupación por milestone/área y paginación o presentación progresiva. Mantener una ruta directa a pendientes y a la siguiente acción. |
| UI-12 | P2 | Orientación y vocabulario: administración conserva el rótulo “Panel del editor”; navegación “Aporte por área” y título “Avance por área”. Cabecera móvil trunca el nombre a “Timeline d…” / “Panel del e…”. | Nombres coherentes por rol y tarea; título completo en el área principal y sección activa identificable en navegación. Diferenciar “avance del área” de “contribución del área al total”. |
| UI-13 | P2 | Seleccionar S0 y luego S1 usa `replaceState`; Atrás regresa a `/editor`, no al nodo anterior. | Decidir y documentar el comportamiento. Si seleccionar un nodo es navegación, usar historial y sincronizar selección con Atrás/Adelante; si es selección temporal, indicarlo y conservar cierre predecible. |
| UI-14 | P2 | Regiones complementarias repetidas sin nombre único y notas informativas con `aside` anidado: `landmark-unique` en 32 capturas y `landmark-complementary-is-top-level` en 8. | Usar contenedores informativos simples para notas; reservar regiones para secciones relevantes y darles nombres únicos. |
| UI-15 | P2 | Dos capturas de M-04 en tablet tienen región horizontal no alcanzable con teclado (`scrollable-region-focusable`). Historias presentan saltos de nivel de encabezado en ocho capturas. | Hacer accesible la región desplazable con nombre, foco visible y teclado; revisar secuencia de encabezados del componente de historias. |
| UI-16 | P3 | Filtros de milestones de 32 px y botones Guardar de 30 px en móvil cumplen dimensiones mayores que 24 px, pero tienen margen ergonómico reducido. | Usar aproximadamente 44 px en acciones primarias/táctiles, sin confundir esta recomendación con el mínimo AA de 24 px y sus excepciones. |
| UI-17 | P2 | El formulario “Añadir métrica” presenta a la vez meta numérica, resultado cualitativo, tolerancia y muestra, incluso con tipo cuantitativo seleccionado. Las etiquetas explican el tipo, pero la persona debe decidir qué omitir. | Mostrar los campos aplicables al tipo de métrica y conservar los valores al alternar. Señalar requeridos/opcionales y explicar el efecto de guardar en la aceptación. |

**Aclaración UI-07:** los textos de los nodos no tienen recorte por número de líneas. Tras desplazar horizontalmente el timeline móvil, M-01 se ve completo. El problema es espacio inicial, descubrimiento y pérdida del contexto de línea/fecha durante el desplazamiento; no una nueva pérdida de datos o nombres.

## Revisión por vista

| Vista | Resultado |
| --- | --- |
| Resumen | Conteo de milestones disponible en la primera pantalla móvil; corregir contraste de mini identificadores y semántica del gráfico por área. La página larga requiere acceso más directo a riesgos y próximas entregas. |
| Timeline | Existen 17 nodos en los contextos medidos: diez milestones y S0–S6. Estilo y nombres completos preservados. Corregir tabla en tablet y priorizar la visualización del timeline. |
| Panel S0 | Nodo existente y resultado previsto identificable. Panel móvil presenta el fallo de foco UI-02; no eliminar ni confundir S0 con un milestone aceptado. |
| Milestone M-04 | Resultado y estado de aceptación visibles antes de la primera pantalla móvil. Corregir contraste, regiones y desplazamiento de tabla. |
| Áreas / Frontend | Comparación de trabajo clara con nota de ponderación. Corregir roles en resumen y enlaces/objetivos en detalle; mantener distinguible avance propio y contribución al milestone. |
| Agenda | Sin desbordamiento global en la matriz. Página móvil de 6233 px: reforzar salto a fecha actual, filtros y próximo compromiso. |
| Tarea / historia | Cliente sin desbordamiento en las muestras. Tarea editable desborda en móvil; historias requieren jerarquía de encabezados. |
| Configuración | Visible y editable para administrador; editor ve la respuesta restringida. Diseño móvil sin desbordamiento, pero 5499 px, 41 campos y acciones pequeñas requieren organización progresiva. |
| Editor / flujo | Desbordamiento y longitud operativa; adaptar tablas/listas y acceso a pendientes. |
| Fuentes | Filtros y referencias plegables ya presentes. Escala de 133 referencias exige búsqueda/agrupación, sin exponer todo el formulario a la vez. |
| Visibilidad / bitácora | Sin desbordamiento ni infracciones automáticas en las muestras. Esto no certifica todos sus estados ni tareas. |
| Verificación | Corregir contraste de los indicadores detectados. |
| Login | Sin desbordamiento ni infracciones automáticas en los tres tamaños. |

## Mapa de calor: significado y límites

El visor permite elegir vista, rol y tamaño y superponer densidad, texto pequeño o controles con altura/ancho menor a 44 px sobre la captura real.

**Es un mapa de densidad visual del DOM; no mide clics, mirada, atención, scroll de usuarios ni conversión.** No se encontraron solicitudes de las herramientas de analítica buscadas en las vistas inspeccionadas. Esto no demuestra ausencia de toda analítica del servidor.

La densidad suma el área de intersección de cajas de texto pintadas con una cuadrícula de 18 × 24 sobre la primera pantalla. Cajas de texto pueden solaparse o incluir espacio interno, por lo que el valor no es porcentaje exacto de tinta y puede superar 1. La escala representa ocupación geométrica relativa; no prioridad de negocio ni gravedad de un defecto. No se deben inferir patrones de mirada F/Z sin investigación con usuarios.

Las capas de texto menor a 12 px y controles menores a 44 px son señales de revisión, no veredictos automáticos de WCAG. Los defectos de contraste y tamaño de UI-03/UI-06 tienen evidencia independiente de axe.

## Orden de corrección y aceptación

Puntos de implementación ya existentes que deben reutilizarse: `src/app/app.css` (responsive y tablas), `src/components/sidebar.tsx` (navegación), `src/components/milestone-panel/panel-client.tsx` (panel e historial), `src/components/area-chart.tsx` (semántica de gráfico), `src/app/(protected)/areas/page.tsx` (acordeones) y `src/components/editor/workflow-form.tsx` (campos de métricas). La localización se contrastó con el grafo de código y las fuentes.

1. Responsive y navegación: UI-01, UI-02, UI-04. Resultado: documento sin desplazamiento lateral involuntario; sección activa visible; teclado entra/sale del panel y vuelve al nodo.
2. Accesibilidad de componentes: UI-03, UI-05, UI-06, UI-08, UI-09, UI-14, UI-15. Resultado: corregir las incidencias específicas y verificar los componentes afectados en los tamaños originales.
3. Jerarquía y operación: UI-07, UI-10–UI-12, UI-16, UI-17. Resultado: entregar valor, aceptación y siguiente compromiso comprensibles al inicio; formularios operables en móvil.
4. Historial: UI-13, con una decisión explícita de navegación y prueba de Atrás/Adelante.

La verificación de una corrección debe seleccionar vistas y componentes afectados, reutilizar evidencia vigente y comprobar que siguen los 17 nodos, S0 de una semana, nombres completos, comparaciones ponderadas y checks exclusivos de aceptación. No cambiar cálculos ni datos para mejorar la apariencia.

## Referencias y límites

- [WCAG 2.2: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 4,5:1 para texto normal y 3:1 para texto grande. Los identificadores señalados son texto normal.
- [WCAG 2.2: tamaño mínimo de objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24 × 24 CSS px, con excepciones de espaciado y contexto. 44 px se propone aquí como mejora ergonómica.
- [WAI-ARIA: diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): manejo del foco, fondo inerte y cierre.

Muestra de rutas y contenido de producción; no se ejecutaron escrituras ni se validaron todos los estados de negocio, lectores de pantalla reales, navegadores alternativos, iOS, tamaños intermedios o zoom al 200 %. Las reglas automáticas complementan la revisión manual; no constituyen una certificación de accesibilidad. Los hallazgos son de UI y no sustituyen una auditoría aritmética de toda la base de datos.
