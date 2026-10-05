# Configuración administrativa de milestones

## Acceso

Ruta: `/editor?vista=configuracion`. Solo el administrador ve la pestaña y sus formularios. Editor y cliente reciben 403 al intentar escribir en `/api/editor/milestone` o `/api/editor/config`. El administrador configura, registra aceptación y publica/retira el cumplimiento; el cliente consulta definición, meta, previsión y evidencia. El editor conserva el seguimiento operativo del trabajo.

## Correspondencia de datos

| Configuración | Persistencia | Modelo / regla |
| --- | --- | --- |
| Necesidad del usuario, resultado y objetivo de negocio | `fichas_milestone.job`, `outcome`, `meta` | Texto; borrador vacío permitido; requerido para aceptar. |
| Incluido/excluido | `alcance_incluido`, `fuera_alcance` | Definición del resultado; no modifica automáticamente las tareas del plan. |
| Responsable y aprobador | `responsable`, `aprobador` | Nombres; el aprobador del criterio debe coincidir con la ficha. |
| Previsión y motivo público | `fecha_prevision`, `motivo_prevision` | Fecha ISO válida y motivo juntos; no reemplaza la fecha comprometida. |
| Indicadores de cada milestone | `metricas_milestone` | Una o varias métricas; cada activa debe vincularse a un criterio obligatorio. |
| Tipo, unidad, comparación y meta | `tipo`, `unidad`, `comparador`, `objetivo`, `objetivo_cualitativo` | Cuantitativa con meta numérica, o cualitativa con resultado acordado; se rechazan combinaciones incompatibles. |
| Método, tolerancia y muestra | `metodo`, `tolerancia`, `muestra_minima` | Tolerancia en la unidad del indicador; muestra entera positiva. Vacío es NULL, no cero. |
| Vigencia | `activa` | Desactivación conserva la métrica y el historial. Revisar criterios vinculados al retirarla. |
| Condición y evidencia requerida | `criterios_milestone.descripcion`, `obligatorio`, `evidencia_requerida` | Obligatoria o complementaria; evidencia requerida explícita antes de aceptar. |
| Métrica y resultado real | `metrica_id`, `resultado_medido`, `resultado_cualitativo`, `muestra_evaluada` | FK; pertenencia al mismo milestone validada; resultado compatible con el tipo. |
| Aceptación individual | `estado`, `evidencia`, `aprobador`, `fecha` | Admin, evidencia, aprobador coincidente y fecha válida no futura. La medición debe cumplir meta, tolerancia y muestra. |
| Reglas de visualización y cálculo | `configuracion.clave`, `valor` | Tres claves existentes; booleanos almacenados como 0/1; solo admin. |
| Historial | `bitacora` | Valor anterior/nuevo y rol por transacción; no se elimina evidencia al reabrir. |

Los tipos de ficha, métricas y criterios se derivan del esquema Drizzle; UI y validaciones comparten enums. Las fechas y asignaciones originales del plan conservan sus tablas. La previsión interna de coordinación se identifica como tal y mantiene su historial operativo separado de la previsión pública configurada.

## Aceptación

Se permiten borradores. La vista indica qué falta y evita certificar cumplimiento. Una meta puede ser cero. No se deduce aceptación de un porcentaje de ejecución. El check requiere configuración completa, métricas activas vinculadas, criterios obligatorios aceptados con mediciones válidas y publicación. Cambiar resultado, alcance, objetivo, aprobador o métricas reabre la aceptación. El historial de publicación anterior permanece identificable.

## Migración y conservación

`0005_loose_scourge.sql` transforma fichas JSON existentes a columnas tipadas. El campo `contenido` original queda intacto como respaldo histórico y deja de ser la fuente vigente. No se inventa el nuevo alcance incluido ni ninguna meta. Los criterios se copian con sus ocho campos originales íntegros; se añaden campos de medición, claves foráneas, índices y restricciones de estado/booleanos/muestra. Se crea `metricas_milestone`. El proceso es transaccional e idempotente y compatible con SQLite y libSQL.

## Verificación

- Tres archivos unitarios/integración: 15 casos aprobados, incluyendo ficha heredada poblada, conservación de todos los campos previos, permisos, meta cero, tolerancia decimal, muestra insuficiente, resultado cualitativo, reaceptación y coincidencia de columnas/tipos/índices/FK de todos los modelos.
- Un archivo E2E: 51 comprobaciones aprobadas sobre una copia aislada, con formularios administrativos reales, persistencia, permisos de tres roles, publicación, reapertura y móvil.
- Build aprobado; lint de 22 archivos y nueva comprobación del archivo E2E tras su último ajuste. No se ejecutó la suite completa.
- Puerta de diseño: esquema, dominio, carga, validación, mutaciones y UI separados; se reutilizan el registro de acciones, `editorRoute` con `soloAdmin`, formularios y bitácora. No hay una segunda fuente vigente de configuración ni fórmulas ponderadas duplicadas.
