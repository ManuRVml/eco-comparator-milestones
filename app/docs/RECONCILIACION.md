# Reconciliación de fuentes y flujo de trabajo

La implementación conserva las tareas, HU, sprints, fechas base y publicaciones anteriores. Añade fuentes versionadas, correspondencias, compromisos técnicos, ejecución, validaciones, insumos, bloqueos, incidentes y previsiones. El timeline mantiene L1/L2/L3, nodos y bandas originales; Sprint 0 sigue siendo una semana.

## Estado verificado sobre la copia local

- Base original: 99 tareas, 65 HU, 10 milestones y 7 sprints. Alcance: 60 HU MVP con 263 SP y 5 HU R2 con 18 SP.
- Paquete: 5 documentos completos, 80 tareas de origen, 53 actividades MVP no vacías y 7 hitos técnicos. La fila 39 de la lista MVP está vacía y no se convierte en una actividad.
- Se relacionan 77 tareas por coincidencia de nombre, descripción, HU y rol. Las otras 3 quedan pendientes: T-029, T-043 y T-079 de la fuente de 80 tareas. Coincidir por nombre solamente no basta.
- Todas las tareas actuales se conservan. Las 53 actividades MVP permanecen como referencias sin asignación automática; el equipo puede relacionarlas con trabajo existente, incluyendo agrupaciones.
- Hecha inicializa ejecución Terminada; no crea integración, aceptación ni publicación. Los campos gestionados por el editor siguen perteneciendo a la aplicación.

El registro de recursos tiene corte del 02/10. Se conserva completo y se consulta desde Fuentes y compromisos. Sus avances no sobrescriben evaluaciones anteriores ni certifican ambientes actuales.

## Preparación y aplicación local

El archivo `seed/reconciliation.json` contiene las fuentes completas y su conversión validada. La app desplegada no necesita la carpeta `new base`. Para regenerar el paquete después de cambiar fuentes, usar `pnpm reconciliation:prepare -- "../new base"`; este comando no abre la base.

1. Crear un respaldo consistente con `pnpm reconciliation:backup -- --database data/seguimiento.db`. El comando comprueba integridad y compara el contenido de la copia restaurada. Respaldos y recibos quedan en `data/reconciliation`, fuera de Git.
2. Trabajar sobre una copia independiente restaurada desde ese respaldo. En esta sesión se preparó `data/reconciliation/preview.db` y se verificó el contenido antes de aplicar cambios.
3. Simular: `pnpm reconciliation -- --database data/reconciliation/preview.db --report data/reconciliation/simulation.json`.
4. Aplicar sobre la copia: `pnpm reconciliation -- --database data/reconciliation/preview.db --apply --report data/reconciliation/applied.json`.
5. Repetir la aplicación para confirmar que el lote existente no inserta registros nuevos. Un import normal por ID ahora rechaza nombres incompatibles y revierte la transacción.
6. Abrir la vista previa con una variable de entorno explícita. En PowerShell:

```powershell
$env:DATABASE_URL='file:./data/reconciliation/preview.db'
$env:APP_HOY='2026-10-05'
pnpm dev
```

La elección de base ocurre antes del arranque del proceso; no se modifica `.env.local`. Quitar las variables al terminar esa terminal si se desea volver a la base habitual. El script de reconciliación exige un archivo explícito y rechaza URLs remotas.

## Operación y piloto

En Trabajo por equipo, filtrar por área y milestone. Cada actividad conserva sprint y fecha base; se priorizan las que tienen insumos preparados. En su detalle, registrar responsable, criterio, entrega parcial y previsión para marcar Lista para empezar. Las validaciones exigen evidencia o justificación de No aplica.

Un bloqueo de Integración permite preparar o ejecutar trabajo y evita certificar esa integración. Uno de Inicio impide preparar o iniciar la actividad afectada; las demás pueden avanzar. Las relaciones se versionan: Coordinación no impone secuencia, y los insumos obligatorios pendientes no pueden formar ciclos. Un proveedor terminado no da automáticamente por disponible su insumo: se necesita evidencia de la entrega acordada.

El piloto de autenticación se opera desde M-01 y sus tareas. Fuentes y compromisos permite confirmar la relación parcial con H-02, manteniendo 09/10 y 15/10 como fechas base distintas. Las previsiones se registran en el panel del milestone y conservan versiones anteriores. Los incidentes registran severidad, responsable, revisión, criterio de liberación y esfuerzo; este último aparece en la vista por equipo.

Los registros de bloqueo deben indicar la parte afectada. Cuando una tarea agrupa trabajo independiente, se puede continuar la parte preparada y conservar el pendiente de integración. No se interpreta el conjunto de predecesoras del cronograma como fin a inicio estricto.

El equipo puede consultar fuentes y completar correspondencias del frente de Datos. Se conservan las 14 tareas actuales de Datos y las cinco referencias explícitas del nuevo plan. Marco solo figura asignado donde la fuente lo identifica; la lista MVP sin responsable no genera asignaciones a personas.

La vista de consulta mantiene aprobación y publicación humanas. Ya no da por iniciada una tarea por haber alcanzado su fecha planificada, ni expone evidencia de una HU actualizada manualmente. Los estados de flujo, validaciones y motivos internos se mantienen exclusivos para editor/admin.

## Desactivación sin pérdida de actualizaciones

El reporte aplicado contiene `loteId`. Desactivar con `pnpm reconciliation:activation -- --database data/reconciliation/preview.db --lote "<loteId>" --deactivate`. Reactivar con `--activate`.

Desactivar cambia únicamente la activación y escribe en bitácora. Se conservan notas nuevas, previsiones, bloqueos, validaciones y correspondencias. El estado anterior de las tablas queda en el inventario del lote para auditoría; restaurar un respaldo completo después de recibir nuevas escrituras no es la vía de reversión operativa.

## Verificación y límites de entrega

`pnpm check:reconciliation` ejecuta pruebas de preservación, import incompatible, avance oficial, bloqueos parciales, ciclos, previsiones y desactivación. Requiere la copia de preview preparada. `pnpm check:workflow` ejecuta el recorrido de editor y consulta sobre otra copia, con servidor propio en 3112. El helper de pruebas permite `TEST_SOURCE_DB` y mantiene su origen habitual cuando esa variable no está definida.

Las decisiones contractuales y de asignación descritas en el plan conservan su condición pendiente. La reconciliación no retira tareas del alcance ni recalcula el calendario de forma automática. La capacidad reservada y los límites de trabajo por equipo deben acordarse con datos del piloto.

Esta entrega prepara y verifica el código y una copia local. No aplica cambios a la base habitual, no modifica recursos externos ni realiza un despliegue remoto. La activación remota debe incluir un respaldo consistente del ambiente objetivo, migración, comparación del inventario y revisión de las correspondencias pendientes.
