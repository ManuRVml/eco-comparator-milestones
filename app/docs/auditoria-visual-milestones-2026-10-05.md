# Auditoría visual y metodológica de milestones

## Dictamen

**Alineación parcial. La aplicación representa el trabajo hacia milestones y explica su cumplimiento binario, pero todavía no presenta con suficiente prioridad el valor validado ni implementa una ficha completa de aceptación según la guía.**

La guía está reflejada en los textos. La jerarquía visual sigue dando mayor protagonismo a tareas, porcentajes y esfuerzo. Cambiar nombres y añadir avisos mejoró la interpretación; no basta para afirmar que la aplicación representa plenamente la aceptación de outcomes del usuario.

## Alcance y evidencia

- Referencia: guía proporcionada por el usuario, preservada en `guia-milestones-contexto.md`. Se revisaron especialmente las secciones 1, 5, 7, 8 y 10.
- Aplicación publicada: https://benchhub-seguimiento.vercel.app, estado de la revisión `5458685`.
- Captura iniciada el 5 de octubre de 2026 a las 16:19 UTC, 11:19 de Bogotá. Corte mostrado por la aplicación: 5 de octubre.
- Seis vistas: resumen, timeline, panel de Sprint 0, detalle M-01, agenda y áreas.
- Dos perfiles: cliente y administrador. Dos tamaños: escritorio 1440 × 1000 y móvil 390 × 844. Total: 24 vistas con captura y medición del DOM; inspección visual de capturas representativas de todas las vistas y ambos tamaños/perfiles.
- Lectura adicional de los resultados y criterios de las diez fichas M-01–M-10.
- 24 respuestas HTTP 200 y **cero solicitudes de modificación**. Las sesiones de comparación se crearon en navegadores aislados. El navegador del usuario se abrió en una pestaña de auditoría y permaneció en el login.
- 41 capturas locales, incluidas fichas ampliadas, contadores y la página de acceso. No se cambiaron código funcional, estados ni datos de producción.

Artefactos locales: `app/data/reconciliation/auditoria-visual/receipt.json` y capturas en esa misma carpeta. No se incluyen las capturas autenticadas en Git; este informe conserva sus referencias y mediciones.

## Contraste con la guía

| Requisito | Resultado observado | Evaluación |
| --- | --- | --- |
| Hito como punto en el tiempo | Los diez M aparecen en fechas concretas; no se dibujan como periodos. | Cumple conceptualmente. |
| Cumplimiento binario | Se distinguen trabajo (%) y cumplimiento; la tabla añade una columna específica. | Cumple en el texto, con jerarquía visual mejorable. |
| Resultado orientado al usuario | Los nombres describen situaciones de uso; la agenda expone el valor antes de las historias. | Bien encaminado. |
| Criterios objetivos | Las diez fichas tienen criterios de demostración; aparecen en párrafos largos. | Parcial: falta evaluación por criterio y algunos umbrales. |
| Evidencia y aceptación | La ficha informa si hay registro de aceptación publicado. | Parcial: no hay matriz criterio → evidencia → aprobador. |
| Job y outcome medible | Las diez fichas señalan que faltan registros explícitos. | No cumple la trazabilidad requerida. |
| Responsable y aprobador con nombre | Las fichas declaran nombres no registrados. | No cumple la ficha de gobierno requerida. |
| Alcance y fuera de alcance | Se muestran HU/tareas/épicas; fuera de alcance figura sin registrar. | Parcial. |
| Fecha comprometida, previsión y aceptación real | La fecha objetivo es visible; la previsión está en herramientas internas. | Parcial para el cliente. |
| Sprint distinto del milestone | S0–S6 se identifican como revisiones y M-01–M-10 como milestones. | Cumple la separación conceptual; falta mostrar mejor sus vínculos. |

El estado de seguimiento («En riesgo», «En curso», etc.) puede coexistir con cumplimiento binario. Debe conservar un rótulo claro para evitar que se interprete como una aceptación.

## Hallazgos priorizados

Las prioridades siguientes corresponden a claridad y fidelidad metodológica; no describen incidentes de disponibilidad.

### P1 — 1. El resumen pone la ejecución por encima del valor

El elemento dominante es «0 de 99 tareas entregadas» y un gran anillo de ejecución. El contador de milestones empieza a 840 px en escritorio cliente y 1057 px para administrador. En móvil empieza a 2216 px para cliente y 2711 px para administrador: entre dos y tres pantallas de desplazamiento antes de llegar al indicador central del producto.

**Ajuste recomendado:** el primer bloque debe mostrar milestones cumplidos/pendientes, próximo resultado esperado, fecha objetivo y principal decisión o impedimento. El trabajo ponderado debe mantenerse como soporte. En móvil, el cumplimiento y el próximo resultado deben verse sin desplazamiento.

Evidencia: `cliente-desktop-resumen.png`, `cliente-mobile-resumen.png`, `admin-desktop-resumen.png` y `admin-mobile-resumen.png`.

### P1 — 2. La ficha de valor está incompleta en los diez milestones

Las diez fichas declaran pendientes job del usuario, outcome medible, fuera de alcance y nombres del responsable/aprobador. Estos son textos informativos; no equivalen a datos de gobierno registrados ni a una cadena de trazabilidad. Los nombres de milestones sí representan resultados de uso, por lo que no procede sustituirlos por tareas o inventar indicadores tomados de los ejemplos de la guía.

**Ajuste recomendado:** añadir campos persistentes y editables para esos datos, con estado de definición pendiente y trazabilidad a las fuentes. Separar responsable de ejecución de aprobador del negocio. Completar la definición con el contexto real del proyecto antes de afirmar impacto validado.

Evidencia: `milestoneDefinitions` en el recibo; `cliente-desktop-ficha01-abierta.png`.

### P1 — 3. La aceptación está descrita, pero no se evalúa por criterio

La ficha muestra un párrafo de criterio y otro de evidencia general. No permite revisar cada condición como pendiente/verificada, asociar su prueba ni identificar quién la aceptó. La revisión complementaria de `src/lib/completion.ts` confirma que el check exige criterio no vacío, publicación/fecha/evidencia, tareas verificadas y HU aceptadas; **no evalúa individualmente las condiciones de negocio del criterio**.

M-04 exige un reporte de precisión de una muestra Gold, pero no expresa tamaño de muestra ni tolerancia acordada. No debe asumirse el 0,5 % del ejemplo de la guía como compromiso del proyecto.

**Ajuste recomendado:** criterios enumerados con resultado, evidencia, fecha y aprobador. El check del milestone debe corresponder a sus criterios obligatorios aceptados. La ejecución de todas las tareas seguirá siendo evidencia de avance y preparación; revisar su alcance para que actividades opcionales o posteriores no bloqueen artificialmente la aceptación.

Evidencia: `cliente-desktop-ficha01.png`, criterios de M-04 en el recibo y función de cumplimiento citada.

### P1 — 4. Cumplimiento y resultado quedan bajo el porcentaje en móvil

En M-01 móvil, el bloque de cumplimiento empieza a 1192 px para el cliente y 1266 px para administrador. Antes se muestran nombre, fechas, sprints, épicas, un anillo y métricas. Al abrir Sprint 0, la primera pantalla muestra el anillo, explicaciones y el inicio de la tabla; el resultado esperado aparece después.

**Ajuste recomendado:** orden de lectura: resultado esperado → cumplimiento → fecha/aprobación → criterios/evidencia → trabajo total y por área → tareas. Mantener la ficha extensa y los detalles disponibles, evitando que el lector deba atravesar avisos para descubrir qué debe existir.

Evidencia: `cliente-mobile-milestone01.png`, `admin-mobile-milestone01.png`, `cliente-mobile-sprint0.png`.

### P2 — 5. Los avisos ocupan demasiado espacio antes de la información

Dos bloques explicativos consumen unos 274 px en escritorio y 485 px en el timeline móvil del cliente, sin contar márgenes. En el resumen del administrador móvil ocupan unos 504 px. Repetir la definición no vuelve más visible el valor.

**Ajuste recomendado:** mantener un aviso breve y visible junto a la métrica: «Trabajo hacia el milestone; no confirma aceptación». Agrupar fórmula, reglas y glosario en una ayuda expandible. No retirar el disclaimer solicitado por el usuario.

### P2 — 6. La previsión no tiene una presentación equivalente para el cliente

El detalle público muestra fecha objetivo. La previsión y su causa se gestionan en herramientas internas. No se observa una ficha pública que reúna compromiso, previsión actual y fecha real de aceptación.

**Ajuste recomendado:** presentar esas tres fechas y la explicación publicada del cambio. Conservar la fecha base. Exponer únicamente el contexto necesario para el cliente, manteniendo las evidencias y bloqueos internos según sus permisos.

### P2 — 7. «Aporte por área» no explica siempre la contribución al milestone

La vista de áreas muestra avance de cada disciplina frente a su propio alcance. Eso no equivale a su peso o aporte al total de un milestone. La tabla de cierre de sprint sí distingue peso, avance propio y aporte; esa explicación no está uniformemente presente en las fichas M.

**Ajuste recomendado:** al seleccionar un milestone, mostrar trabajo propio del área, peso dentro del milestone y aporte al avance total. Conservar el cálculo ponderado y su denominador; no promediar porcentajes ni sumar porcentajes de nodos compartidos.

### P2 — 8. El vínculo revisión de sprint → milestone no se descubre de inmediato

Se observan 17 nodos: siete S y diez M. S0 es visible y está correctamente fechado como una semana. Sin embargo, el usuario abre una revisión de sprint y ve principalmente sus tareas/resultado H, sin una lista clara de qué milestones habilita y qué criterio ayuda a verificar.

**Ajuste recomendado:** incluir «Milestones que habilita esta revisión» con enlaces y la contribución específica. No inventar correspondencias para las referencias pendientes ni convertir cada cierre de sprint en un nuevo milestone de negocio.

### P2 — 9. La agenda móvil tiene desbordamiento horizontal

La anchura del documento es 401 px en un viewport de 390 px, tanto para cliente como para administrador. Se observa contenido pegado/cortado en el borde derecho de la tarjeta. Las otras vistas auditadas mantuvieron la anchura del documento dentro del viewport. El scroll horizontal deliberado del timeline no se considera este mismo defecto.

**Ajuste recomendado:** permitir que tarjetas y columnas de agenda se contraigan y que textos largos hagan salto de línea. Criterio verificable: anchura del documento ≤ anchura del viewport a 390 px.

### P3 — 10. La gramática visual puede comunicar mejor el hito

Los nodos M y S usan círculos/anillos similares, aunque los rótulos los distinguen. Los títulos largos de M se abrevían en los nodos. Hay términos secundarios como CP, HU, SP y weekly cuyo significado exige contexto adicional.

**Ajuste recomendado:** diferenciar visualmente milestone y revisión conservando el estilo actual; por ejemplo, un marcador de hito y un indicador de ejecución secundario. Mostrar nombre completo y criterio al abrir el nodo y ofrecer glosario breve para las siglas. El rombo sugerido por la guía es una opción visual, no una condición que justifique rehacer todo el timeline.

## Lo que funciona y conviene conservar

- Diez milestones vinculados a situaciones concretas del usuario, en tres líneas de valor.
- Siete revisiones con Sprint 0 incluido y fechas conservadas.
- Textos que separan trabajo y cumplimiento, y tabla de seguimiento/cumplimiento.
- La agenda expone el resultado para el usuario antes de las historias.
- Capa oficial y técnica identificadas; no se presenta la ejecución interna como entrega al cliente.
- Avisos sobre ponderación y fechas; ausencia de checks de cierre en los nodos auditados que siguen pendientes. Los checks de tareas técnicas observados no se interpretan como aceptación del milestone.
- Declaración explícita de los campos que faltan y de la ausencia de evidencia de aceptación publicada.

## Orden de mejora recomendado

1. **Jerarquía visual:** cumplimiento y resultado esperado en la primera pantalla; criterios antes de porcentajes; avisos compactos.
2. **Ficha y aceptación:** registrar job/outcome, alcance, responsables y validación por criterio con evidencia. Esta parte requiere definición de negocio real, no solo cambios de estilo.
3. **Correlación:** relaciones S→M, contribución por área al milestone y fechas/previsiones públicas.
4. **Detalles de uso:** corregir la agenda móvil, siglas y diferencias visuales de nodos.

## Límites de la conclusión

Es una auditoría visual y de representación, con lectura puntual de la regla de cumplimiento; no certifica que el producto BenchHub haya logrado sus outcomes ni valida evidencias de terceros. Los datos publicados durante la revisión no ofrecieron un milestone aceptado para observar su estado final real. Tampoco se simularon aprobaciones ni incidentes en producción. Una respuesta HTTP correcta demuestra disponibilidad de la vista, no cumplimiento de la guía.

**Resultado de la auditoría: no aprobar todavía la representación completa del valor según la guía; aprobar la separación inicial entre trabajo, revisiones de sprint y cumplimiento como base para los ajustes señalados.**
