# Auditoría de correlación y cierres de sprint

## Representación acordada

Cada nodo S0–S6 corresponde a la fecha base de cierre de su sprint. S0 dura una semana (21–25 septiembre de 2026); los siguientes duran dos. El resultado esperado y su criterio proceden del compromiso H-01–H-07 del plan reconciliado, conservando los milestones M-01–M-10 como entregables independientes.

El objetivo al cierre es 100 % del alcance y su verificación. El porcentaje mostrado es el estado actual al corte, no una reconstrucción histórica de ese día.

| Medida | Cálculo |
| --- | --- |
| Avance del área | Esfuerzo base de tareas completadas del área / esfuerzo base del área |
| Peso del área | Esfuerzo base del área / esfuerzo base del nodo |
| Aporte al total | Peso del área × avance del área |
| Avance total | Suma de aportes; equivale a esfuerzo completado / esfuerzo total del nodo |
| Previsto al corte | Esfuerzo de tareas cuya fecha fin base llegó / esfuerzo del mismo alcance |
| Brecha | Avance real menos previsto, en puntos porcentuales |

La unidad es días hábiles planificados: mide ejecución ponderada, no horas efectivamente trabajadas ni beneficio económico. Una tarea en curso aporta cero hasta completarse. El filtro destaca el área y sus tareas sin alterar el total del cierre. Un cierre completo y verificado destaca únicamente lo realizado.

## Correlaciones verificadas

La base de prueba reconciliada conserva 99 tareas, siete sprints y diez milestones; no tiene tareas huérfanas de sprint ni referencias de milestones a tareas inexistentes. Las tareas compartidas se cuentan una vez por alcance.

| Compromiso | Sprint | Referencias críticas del plan | Vinculadas | Tareas del sprint |
| --- | --- | ---: | ---: | ---: |
| H-01 | S0 | 6 | 6 | 7 |
| H-02 | S1 | 4 | 4 | 22 |
| H-03 | S2 | 5 | 4 | 13 |
| H-04 | S3 | 5 | 4 | 14 |
| H-05 | S4 | 5 | 5 | 15 |
| H-06 | S5 | 5 | 5 | 22 |
| H-07 | S6 | 4 | 3 | 6 |

Las referencias críticas son un subconjunto del trabajo del sprint. No sustituyen sus tareas adicionales. Permanecen pendientes las referencias originales T029 (Capital IQ), T043 (QA de precisión) y T079 (despliegue a producción); no se inventó equivalencia ni se marcaron completadas.

## Correcciones

- El cliente ve resultado, fecha y criterio esperado por cierre, sin evidencias internas ni documentos originales.
- Un área completada no certifica el sprint completo; el cálculo del cierre precede a filtros de área y visibilidad.
- Un 100 % de ejecución no genera automáticamente un check: en la capa técnica se exige evidencia, integración y aceptación verificadas, sin insumos pendientes; en la oficial, estado vigente y publicación aprobada con fecha y nota.
- Un milestone requiere todas sus tareas verificadas y HU aceptadas para mostrar el check.
- Se dejó de presentar la fecha planificada como fecha de cierre cuando falta la fecha real.
- Se reutilizan el parser reconciliado y las funciones de ponderación existentes. No se cambia la metodología a una dependencia secuencial entre equipos.

## Validación y límites

Ocho casos numéricos y de correlación en dos archivos; 28 comprobaciones de interfaz en un archivo, con perfiles administrador y cliente y tamaños escritorio/móvil. ESLint sobre archivos modificados y compilación Next.js con TypeScript correctos. Las pruebas utilizan una copia de la base; esta corrección no escribe ni migra datos de producción.

Los datos registrados son la evidencia disponible: la fecha transcurrida no demuestra entrega y esta vista no inventa estados históricos. El redondeo visual puede causar diferencias de una décima al sumar aportes mostrados. Las correspondencias pendientes deben resolverse con evidencia antes de certificar esos cierres.

## Aplicación de la metodología en dashboards

El resumen distingue hitos de entrega confirmados de sus estados de seguimiento. El contador usa la verificación del alcance completo, un criterio definido y el registro de aprobación/publicación con fecha y evidencia. Los colores conservan los estados existentes; no sustituyen ese contador. No se cambian los estados guardados.

Los siete puntos de revisión aparecen también en el resumen, con resultado esperado y comparación de ejecución prevista/real. Los paneles y detalles de hitos explican el resultado para el cliente, el criterio y el cumplimiento confirmado. Terminar un periodo no certifica un hito, y un hito puede abarcar varios sprints. Se eliminó otra sustitución de fecha real de cierre por fecha planificada en entregas recientes.

Validación de esta ampliación: seis casos de correlación en un archivo y 38 comprobaciones de interfaz en otro; lint de archivos modificados y compilación con TypeScript correctos. Se reutiliza la evidencia de las tres pruebas de ponderación, cuyo código no cambió. No hay migraciones ni escrituras sobre datos de producción.

## Alineación con la guía de milestones aportada

Referencia preservada: `guia-milestones-contexto.md`, copia del documento proporcionado por el usuario. Sus ejemplos no se convierten en compromisos del proyecto.

La navegación, el resumen, el timeline, las fichas, la agenda y las vistas de áreas usan el término milestone (hito). Los porcentajes se identifican como trabajo hacia el milestone, separado del cumplimiento binario. La tabla muestra seguimiento y cumplimiento en columnas distintas. Las revisiones de sprint conservan sus siete nodos, incluido Sprint 0.

Las fichas exponen resultado, criterio y evidencia disponible, y señalan que faltan job/outcome explícitos, fuera de alcance y nombres de responsable/aprobador. No se deducen estos datos de permisos de publicación ni de ejemplos. La agenda dejó de declarar una fecha pasada como realizada y usa ponderación por esfuerzo para el trabajo hacia cada milestone.

Validación: 44 comprobaciones de interfaz en un archivo; lint de fuentes modificadas y compilación TypeScript correctos. Se conserva la evidencia de pruebas de cálculo y cumplimiento cuyos módulos no cambiaron. Revisión de diseño sobre los archivos modificados: se reutilizan componentes y reglas existentes; sin nuevas dependencias ni duplicación de reglas de cumplimiento. Los datos guardados permanecen intactos.
