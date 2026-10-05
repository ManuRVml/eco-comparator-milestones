# Correcciones de la auditoría visual de milestones

Base: `auditoria-visual-milestones-2026-10-05.md` y `guia-milestones-contexto.md`.

| Hallazgo | Corrección |
| --- | --- |
| 1. Ejecución domina el resumen | Contador de milestones cumplidos y pendientes primero; ejecución desplegable. |
| 2. Ficha de valor incompleta | Persistencia y edición de job, outcome, métrica/meta, exclusiones, responsable y aprobador. Los vacíos se muestran como «Por definir». |
| 3. Aceptación sin prueba individual | Criterios obligatorios/complementarios con evidencia, aprobador y fecha; aceptación exclusiva del administrador y publicación condicionada a aceptación vigente. |
| 4. Resultado oculto en móvil | Resultado y aceptación preceden a métricas; resultado esperado de sprint precede a su tabla. |
| 5. Avisos demasiado extensos | Nota corta visible y explicación de cálculo desplegable. |
| 6. Previsión invisible para cliente | Fecha comprometida, previsión publicada con motivo y fecha de aceptación separadas. |
| 7. Aporte de áreas ambiguo | Tabla por milestone con peso, avance propio real/planificado, contribución al total y brecha; denominador completo del alcance. |
| 8. Sprint y milestone desconectados | Enlaces explícitos desde cada cierre de sprint a milestones relacionados por tareas. |
| 9. Agenda desborda móvil | Agenda de una columna y tablas de contribución en tarjetas móviles. |
| 10. Marcadores y siglas confusos | Milestones con rombo, cierres con círculo; nombres completos accesibles y glosario desplegable. |

## Datos de negocio que requieren definición

No hay en las fuentes una asignación nominal completa de responsables/aprobadores ni metas verificables para los diez milestones. M-04 requiere acordar tolerancia y muestra de precisión. Se habilita su registro sin inventar compromisos. Hasta completar ficha y criterios, el milestone permanece pendiente. Los criterios originales se importan íntegros; pueden desglosarse desde el editor conservando historial.

## Evidencia y conservación

- 13 casos unitarios/integración en tres archivos, 44 comprobaciones del cierre de sprint y 27 del flujo de aceptación en dos archivos E2E: 84 comprobaciones en cinco archivos.
- Compilación de Next.js y lint de 25 archivos aprobados. Resultados exitosos reutilizados; no se ejecutó la suite completa.
- Respaldo remoto reconstruido y verificado por integridad, relaciones y comparación de todas las filas antes de migrar. 32 tablas anteriores y 99 tareas conservadas. Dos tablas nuevas, diez criterios pendientes y cero fichas inventadas. Repetir la migración no cambia los datos.
- Puerta de diseño: contratos, carga, mutaciones y presentación separados; registro de acciones, validadores, formulario, cálculo ponderado y tabla reutilizados. Sin nueva duplicación de fórmulas ni inversión de dependencias.
- No se marcaron como aceptadas tareas o entregas reales durante las pruebas: las mutaciones E2E se ejecutaron sobre una copia aislada.
