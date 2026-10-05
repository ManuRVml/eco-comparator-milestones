# Plan de mejora y solución de UI — Milestones

## Objetivo y punto de partida

Corregir los 17 hallazgos de la [auditoría rigurosa](auditoria-ui-rigurosa-2026-10-05.md) y facilitar que cada rol entienda qué resultado se comprometió, para cuándo, qué trabajo se ha realizado y qué resultado fue aceptado.

Evidencia visual: `../data/reconciliation/ui-rigurosa/informe-interactivo.html`, `receipt.json`, `interactions.json` y capturas completas. Son artefactos locales; las pantallas administrativas no se publican junto al informe.

La referencia conserva 110 combinaciones auditadas, 12 con desbordamiento global, 69 con incidencias automatizadas y cinco recorridos de interacción. Estos números describen capturas y recorridos, no defectos independientes ni casos de prueba funcionales.

**Estado inicial:** auditoría terminada y documentada. Los 17 ajustes de este plan todavía no están implementados ni desplegados. Cada hallazgo solo se cerrará con evidencia posterior a su corrección.

## Reglas que se conservan

- Diez milestones de entrega y siete nodos de revisión S0–S6. Sprint 0 dura una semana.
- Estilo actual del timeline, líneas de valor y nombres completos; adaptar el espacio disponible sin ocultar resultados mediante truncamiento.
- Milestone aceptado y trabajo completado son conceptos diferentes. Un porcentaje de ejecución no produce un check de aceptación.
- Avance total ponderado, avance propio de cada área y contribución del área al total deben identificarse por separado. La comparación con lo previsto conserva el mismo alcance y fecha de corte.
- Los filtros de presentación no cambian el total de un nodo ni certifican la entrega completa.
- Permisos de cliente, editor y administrador conservados en interfaz y servidor. Configuración y aceptación de negocio siguen siendo exclusivas del administrador.
- Estado, evidencia, publicación, fechas base y trazabilidad de los datos conservados. El plan actual es de UI; no necesita migraciones de base de datos.

## Organización del trabajo

Tres entregas de mejora, cada una con un resultado verificable. Son entregas del trabajo de UI; **no se agregan como nuevos milestones al timeline del proyecto del cliente**.

| Entrega | Resultado esperado | Hallazgos | Dependencias |
| --- | --- | --- | --- |
| E1 — Navegación y accesibilidad | Una persona puede recorrer y operar las vistas afectadas en móvil/tablet y con teclado, sin perder la sección actual ni el foco. | UI-01–UI-06, UI-08, UI-09, UI-14, UI-15 | Ninguna dependencia de nuevas métricas o datos de negocio. |
| E2 — Lectura del timeline | La línea de tiempo aparece antes, conserva sus 17 nodos y permite distinguir resultado, fecha, ejecución y aceptación. | UI-07, UI-12, UI-13 | Reutiliza navegación/paneles de E1; la composición visual puede trabajarse mientras se corrigen otros componentes. |
| E3 — Operación administrativa | El equipo encuentra pendientes y configura métricas con controles legibles y campos pertinentes. | UI-10, UI-11, UI-16, UI-17 | Reutiliza responsive de E1; formularios y búsqueda pueden avanzar de forma independiente. |

Orden de publicación recomendado: E1, después E2 y E3. UI-12 se aplica también a la navegación de E1. UI-16 se incorpora al tocar los controles de E1/E3, para evitar una segunda modificación del mismo componente.

Ante un incidente, registrar la vista y hallazgo afectados, mantener abierto su criterio de aceptación y continuar los paquetes independientes. Un problema de formularios no detiene las correcciones de contraste; un problema del panel no detiene búsqueda/paginación. No declarar aceptada una entrega con sus criterios pendientes.

## E1 — Navegación y accesibilidad

### 1. Responsive y contención — UI-01

**Solución:** corregir mínimos de ancho de grids/flex, controles y formularios; envolver las tablas en regiones desplazables en todos los tamaños que lo necesiten. El scroll horizontal del roadmap permanece dentro de su contenedor. No usar `overflow-x: hidden` en toda la página para esconder contenido que sigue desbordándose.

**Reutilizar:** `src/app/app.css`, contenedores `.card-flush`, `.ms-table-wrap`, `.table-scroll`, formularios existentes y columnas del flujo. Separar reglas nuevas por responsabilidad si el archivo CSS ya alcanza su límite de tamaño; evitar otro bloque global de overrides duplicados.

**Aceptación:**

- `document.documentElement.scrollWidth <= innerWidth + 1` en las 12 combinaciones inicialmente afectadas.
- Todas las columnas/acciones siguen alcanzables dentro de su contenedor; las tarjetas y formularios se contraen sin superponerse.
- Timeline y tablas tienen indicación visible de desplazamiento donde corresponde; no hay contenido perdido por recorte.

### 2. Panel móvil y ciclo de navegación — UI-02

**Decisión:** mantener panel en línea en escritorio y usar un diálogo modal en móvil. Preferir el elemento nativo `dialog` si encaja con el componente existente; evitar construir otro sistema de ventanas independiente.

**Reutilizar:** `src/components/milestone-panel/panel-client.tsx` y `LaneSlot`. Conservar una sola fuente de selección y contenido.

**Aceptación:** abrir S0 o M-01 por Enter sitúa el foco dentro del diálogo; Tab y Shift+Tab no pasan al fondo; Escape y Cerrar funcionan; el foco vuelve al nodo que abrió el panel. Fondo inerte y sin desplazamiento involuntario mientras esté abierto. Apertura por enlace directo y cambio de orientación también verificados. Escritorio conserva el panel en línea y su nombre accesible.

### 3. Navegación móvil y nombres — UI-04, parte de UI-12

**Solución:** reemplazar la tira horizontal oculta por una navegación desplegable con botón identificable y nombre completo de la sección actual. Mantener el sidebar de escritorio. Usar enlaces de navegación nativos; no introducir `role="menu"` sin implementar su patrón de teclado.

**Reutilizar:** `src/components/sidebar.tsx`, registro existente de enlaces y permisos. Mostrar “Administración” para el administrador y “Panel del editor” para el editor. Unificar “Avance por área” en navegación y título.

**Aceptación:** desde móvil se accede a todas las opciones autorizadas; la sección actual se identifica sin deslizar; título completo o un nombre corto inequívoco y el encabezado principal completo están disponibles. Escape/cierre y foco operables. Cliente no recibe opciones internas; editor no recibe configuración administrativa.

### 4. Contraste y estados — UI-03

**Solución:** corregir parejas de fondo/texto de mini milestones, L2/L3, Hoy y verificación. Reutilizar tokens y variantes semánticas existentes. Mantener colores de identidad cuando sea posible, usando texto oscuro sobre fondos claros. Texto o símbolo acompaña al color del estado.

**Aceptación:** los elementos de texto normal señalados alcanzan 4,5:1; verificar también hover, foco y variantes de estado. axe deja de señalar los selectores originales. No cambiar colores de gráficas sin revisar su leyenda y legibilidad.

### 5. Área detallada y objetivos de interacción — UI-05, UI-06

**Solución:** separar el enlace al milestone del disparador `summary`. Mantener acordeón nativo para expandir tareas y un enlace independiente para consultar la entrega. Añadir espacio de activación y separación.

**Reutilizar:** `AreaDetalle` en `src/app/(protected)/areas/page.tsx` y componentes de enlaces/controles existentes.

**Aceptación:** cero `nested-interactive` y `target-size` en las ocho combinaciones del detalle Frontend; Enter en el enlace navega y Enter/Espacio en el acordeón expande sin navegar. Nombres completos visibles, sin doble acción accidental.

### 6. Semántica compartida — UI-08, UI-09, UI-14, UI-15

**Decisiones:**

- Editor: las vistas cambian mediante URL, por lo que se presentan como enlaces dentro de `nav`, con `aria-current`; retirar roles de pestaña incompletos.
- Gráfico por área: contenedor de encabezado de fila con enlace dentro, o tabla nativa; el enlace conserva su semántica.
- Notas explicativas: usar contenedores informativos simples. Reservar landmarks para regiones relevantes con nombres únicos.
- Tablas desplazables: región nombrada, foco visible y acceso por teclado donde sea necesario.
- Historias: corregir la secuencia de encabezados dentro de la jerarquía real de la página.

**Reutilizar:** `area-chart.tsx`, `metric-note.tsx`, `delivery-note.tsx`, rutas editor/historias y contenedores de tablas existentes.

**Aceptación:** desaparecen las incidencias originales `aria-allowed-role`, `landmark-unique`, `landmark-complementary-is-top-level`, `heading-order` y `scrollable-region-focusable` en sus vistas afectadas. Los enlaces del gráfico siguen navegando; notas y cifras siguen disponibles al lector de pantalla.

## E2 — Lectura del timeline

### 7. Jerarquía, posición y contexto — UI-07, resto de UI-12

**Composición propuesta:**

1. Título y explicación breve de qué se muestra.
2. Aviso compacto, siempre visible: ejecución ponderada no equivale a aceptación; capa y corte de los datos.
3. Filtros esenciales y leyenda compacta.
4. Timeline.
5. Métricas de ejecución en sección expandible y detalle tabular.

La fórmula, alcance y explicación extensa permanecen consultables. No quitar los avisos para ganar espacio. En móvil, reducir la columna de línea o colocar su nombre encima del carril para que la primera tarjeta tenga ancho útil suficiente. Conservar fecha y contexto de línea durante el desplazamiento mediante encabezados o referencias visibles; no ocultar cierres S0–S6 para simular una mejora.

**Aceptación medible:**

- En la muestra móvil de 390 × 844, inicio del timeline y al menos un nodo legible antes de y=844 con las explicaciones extensas cerradas. El objetivo incluye legibilidad del nodo, no solo un borde del contenedor.
- Los 17 nodos siguen en DOM y son alcanzables; nombres sin clamp, superposición o recorte permanente.
- Tras desplazar horizontalmente, se puede identificar línea y fecha del nodo. La fecha actual tiene una acción clara para localizarla.
- Se distingue el milestone de entrega del cierre de sprint y se mantienen métricas y avisos de cada capa.
- Resumen conserva el conteo de milestones aceptados al inicio. Agenda ofrece acceso a fecha actual/próximo compromiso sin exigir recorrer toda la página.

**Reutilizar:** `lineas/page.tsx`, `roadmap.tsx`, componentes de avisos, filtros y calendario existentes. Cualquier vista móvil complementaria usa el mismo modelo, sin duplicar cálculos.

### 8. Historial de selección — UI-13

**Decisión:** tratar la selección de un nodo como navegación del timeline. Al cambiar S0 → S1, añadir una entrada de historial; Atrás recupera S0 y Adelante recupera S1. Cerrar tiene un comportamiento explícito y no crea un bucle de aperturas.

**Solución:** sincronizar selección con URL y `popstate`, conservar parámetros de área y el estado necesario del router. Validar IDs antes de seleccionar. No mantener dos estados independientes que diverjan entre URL y panel.

**Aceptación:** recorrido S0 → S1 → Atrás → Adelante; cierre; recarga; enlace directo `?m=S0`; URL con filtro de área. Selección visual, `aria-expanded` y panel siempre coinciden. El regreso de foco no salta a un nodo distinto.

## E3 — Operación administrativa

### 9. Lectura y ergonomía de formularios — UI-10, UI-16

**Solución:** entradas móviles de 16 px, controles principales de aproximadamente 44 px, etiquetas cercanas y secciones de configuración claramente identificadas. Campo obligatorio/opcional explícito. Mantener ayuda sobre el efecto de guardar y la reapertura de aceptación.

**Reutilizar:** `WorkflowForm`, editor de contrato y estilos semánticos. Agrupar ficha, métricas, criterios y publicación conservando acceso a todas las secciones.

**Aceptación:** sin desbordamiento; datos y controles legibles en 390 px; Guardar y Cerrar operables sin precisión excesiva. Guardado comunica progreso, error o éxito y no pierde valores del formulario. Confirmar foco/zoom en Safari de iPhone si se dispone del dispositivo; si no, registrar esa comprobación como pendiente, sin declararla aprobada.

### 10. Búsqueda, filtros y listas largas — UI-11

**Solución por vista:**

- Tareas del editor: búsqueda por ID/nombre, conservar filtros de área/estado/milestone y paginación de 20 registros iniciales con cantidad total visible.
- Fuentes: conservar filtros y acordeones, añadir búsqueda por ID/nombre y paginación de 20 referencias; montar formularios solo para el conjunto mostrado. Conservar la relación con la fuente y la posibilidad de revisar todas las referencias.
- Flujo: conservar orden de prioridad y equipos; búsqueda, filtros de pendientes/bloqueos y presentación progresiva por columna con “Ver más”. Mostrar cantidad visible/total para que no se interprete que el alcance disminuyó.

Reutilizar un componente de paginación y la convención de parámetros de URL si el repositorio ya dispone de ellos. Extender registros/puertos existentes; evitar una implementación diferente por pantalla. Cambiar filtros reinicia la página y los enlaces preservan los filtros aplicados.

**Aceptación:** búsqueda localiza T-001 por ID y nombre; todos los registros son accesibles por paginación/expansión, sin omitir ni duplicar IDs. Cantidades representan el conjunto filtrado completo; métricas globales y de nodo no se recalculan sobre la página visible. Atrás/recarga conservan filtros y página. Ningún borrador escrito se descarta silenciosamente al navegar.

### 11. Campos por tipo de métrica — UI-17

**Solución:** declarar visibilidad/aplicabilidad de campos en el modelo de `WorkflowForm` o un componente específico existente de métricas. Evitar lógica dispersa por nombres de campos.

- Cuantitativa: unidad, comparador, meta numérica y tolerancia; muestra solo cuando aplica.
- Cualitativa: resultado acordado; método y evidencia esperada.
- Campos comunes: indicador, método de evaluación y vigencia.
- Conservar los valores al alternar tipo, pero enviar únicamente la combinación válida del tipo elegido. Mantener validación del servidor.

**Aceptación:** alternar cuantitativa → cualitativa → cuantitativa conserva el borrador pertinente; no exige campos ocultos ni envía valores incompatibles. Rechazo del servidor se comunica claramente. Guardar conserva el historial y la regla existente de volver a revisión cuando cambia la definición.

## Validación y evidencia de cierre

La validación se selecciona por componentes y rutas modificados. No repetir la matriz de 110 capturas automáticamente ni interpretar un lint exitoso como prueba funcional.

| Paquete | Evidencia mínima |
| --- | --- |
| Responsive | Las 12 combinaciones afectadas de la auditoría, más una muestra de escritorio para asegurar que el ajuste compartido no rompe su composición. |
| Accesibilidad compartida | Resumen, timeline, M-04, áreas, Frontend e historia HU-001 en los tamaños donde se detectó cada regla; axe sobre los componentes corregidos y revisión manual de foco. |
| Panel e historial | Cinco recorridos originales actualizados; verificar apertura directa, Escape, Tab/Shift+Tab, retorno de foco y Atrás/Adelante. |
| Timeline | Cliente y administrador en 1440, 768 y 390 px; 17 nodos, S0, nombres completos, posición inicial y desplazamiento. |
| Formularios/listas | Administrador y editor en las rutas operativas modificadas; restricción de cliente y editor; búsqueda, cantidades y recorrido de registros. Escrituras de prueba exclusivamente en copia local de la base. |
| Legibilidad | Contraste calculado sobre colores efectivos; controles y fuente móvil; zoom al 200 % en vistas seleccionadas e iOS si está disponible. |

Guardar las nuevas capturas en otra carpeta, sin sobrescribir la referencia. Comparar antes/después con el mismo rol, contenido y viewport. Añadir al registro de cierre: ID de hallazgo, commit, vista, prueba ejecutada, resultado y evidencia. Distinguir archivos de prueba, casos ejecutados y comprobaciones reutilizadas.

El mapa de densidad ayuda a revisar ocupación y posición. **No mide clics ni atención.** Como el visor usa escala relativa por captura, no comparar colores entre pantallas como una reducción absoluta; comparar coordenadas, dimensiones, acceso a la tarea y captura original. Las capas <12 px / <44 px son señales de revisión; las infracciones requieren evidencia específica.

## Commits, publicación y recuperación

1. Branch aislada y PR apilado sobre `audit/ui-rigurosa`, que contiene la referencia de auditoría. Registrar esa base para seleccionar validación.
2. Commits enfocados por entrega con autor ManuRVml. Respetar hooks, ejecutar lint/type checks sobre los proyectos afectados y pruebas seleccionadas; revisar responsabilidades, duplicaciones e importaciones de los archivos modificados.
3. Validar la aplicación con una copia local de la base. No publicar datos de prueba ni artefactos de roles internos.
4. Desplegar y verificar la revisión del **único proyecto Vercel Milestones / `benchhub-seguimiento`**. Confirmar proyecto/organización antes de ejecutar el comando; usar su configuración y secretos existentes.
5. Esperar estado Ready y verificar `https://benchhub-seguimiento.vercel.app` con los tres roles. Comprobar commit desplegado y rutas corregidas; la existencia del deploy no demuestra por sí sola la corrección.
6. Si falla una entrega, revertir sus commits o restaurar el deployment anterior del mismo proyecto. No restaurar ni borrar la base de datos para revertir cambios de UI.

La autorización previa para commits y despliegue se conserva. No requiere una nueva confirmación rutinaria, pero se ejecuta después de implementar y verificar ajustes concretos. Este documento no declara realizado ese despliegue.

## Criterio final de aceptación

Los 17 hallazgos tienen resultado verificado o una limitación explícita sin marcar como resuelta; los seis P1 están corregidos; no hay desbordamiento global en la muestra afectada; navegación y foco son operables; los 17 nodos y sus nombres se conservan; métricas y aceptación se distinguen; registros, permisos y datos están preservados; el deployment de Milestones está Ready y verificado.

Registrar por separado cualquier incidencia nueva. No cambiar el alcance de aceptación ni eliminar datos para obtener una pantalla aparentemente correcta.
