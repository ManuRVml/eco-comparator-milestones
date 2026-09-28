# 05 · Especificación de la app de seguimiento (FASE 5, tal como se construyó)

App web de seguimiento del MVP BenchHub para Ecopetrol. Esta especificación describe la aplicación **tal como quedó
construida** en `seguimiento-app/` (Next.js 16 App Router, TypeScript, Tailwind v4, Drizzle ORM sobre SQLite/libSQL),
siguiendo la sección «FASE 5» de `PROMPT_milestones.md`. El detalle operativo de instalación está en
`seguimiento-app/README.md` y el de despliegue en `seguimiento-app/DEPLOY.md`.

## 1. Objetivo

Dar al equipo Ecopetrol una vista visual y siempre actualizada del avance del MVP:

- navegar las **líneas de tiempo** (L1, L2, L3) del 21/09 al 18/12/2026 con los milestones en su jueves de weekly;
- entrar a un milestone y ver **qué recibe**, sus historias de usuario (HU) y las tareas por área ejecutadas hasta esa fecha;
- saber **qué verá y cuándo** en cada weekly de demo;
- que el equipo del proyecto (editor/administrador) **apruebe y publique** el avance en tiempo casi real, con bitácora.

La app separa dos capas: el **avance oficial** (solo lo aprobado y publicado por una persona) y el **avance técnico
interno** (sugerido por la evidencia en código), que el equipo Ecopetrol nunca ve.

## 2. Roles

Autenticación por PIN de rol (variables de entorno) y cookie de sesión firmada.

| Rol | Tipo | Qué puede hacer |
| --- | --- | --- |
| **Equipo Ecopetrol** | Observador, **solo lectura** | Ve únicamente la capa oficial y lo marcado como visible. Sin notas internas, sin riesgos internos, sin evidencia técnica, sin panel del editor ni bitácora. El clic en un nodo de la línea de tiempo solo abre el panel de lectura. Todas las rutas mutantes le responden 403. |
| **Editor** | Equipo del proyecto | Actualiza el estado técnico (con evidencia obligatoria para «Hecha»), agrega notas (internas o visibles), alterna la visibilidad y ajustes, y **aprueba y publica** (o retira) tareas y milestones. |
| **Admin** | Equipo del proyecto | Todo lo del editor. Además ejecuta los re-imports del Excel desde la consola (`db:bootstrap`, `import*`). |

**Aprobar y publicar** es la única vía para que algo cuente como entregado para el equipo Ecopetrol, y la pueden usar
**editor y admin**. Exige fecha de completitud (no futura) y una nota de entrega orientada al equipo Ecopetrol
(p. ej. «Demostrado en weekly 15/10»); una tarea solo se publica si su estado técnico es Hecha. Retirar la publicación
también está permitido a ambos roles. Cualquier rol observador futuro hereda el mismo tratamiento de solo lectura.

## 3. Modelo de datos

SQLite (libSQL) con Drizzle (`src/db/schema.ts`), 20 tablas. Columnas «de plan» vienen del Excel y el import las
actualiza; columnas «de app» (estado, origen del estado, visibilidad, publicación, evidencia, fechas de estado/cierre)
son propiedad de la app y el import nunca las toca.

| Tabla | Columnas clave | Propósito |
| --- | --- | --- |
| `lineas` | `id` (L1–L3), `nombre`, `descripcion`, `orden` | Líneas de valor: «Lo que el cliente ve y usa», «Lo que el cliente o el equipo configura», «Cómo se reciben y aceptan los datos». |
| `areas` | `id`, `nombre`, `orden` | 7 áreas: Backend, Frontend, Datos, Calidad (QA), Infraestructura, Arquitectura, Gestión. |
| `sprints` | `id`, `numero`, `fecha_inicio`, `fecha_fin`, `dias_habiles`, `objetivo` | 7 sprints (0–6). |
| `festivos` | `fecha`, `festividad` | 4 festivos del periodo. |
| `milestones` | `id`, `nombre`, `linea_id`, `fecha_objetivo`, `sprints_texto`, `criterio`, valor para Ecopetrol, `epicas`, `estado`, `estado_origen`, `fecha_cierre`, `evidencia`, visibilidad | 10 milestones; `estado_origen = editor` + `Cumplido` + `fecha_cierre` = milestone publicado. |
| `historias` | `id`, `nombre`, `epica`, `feature`, `prioridad` (MVP/R2), `sp`, `sprint_id`, `estado`, `estado_origen`, visibilidad | 65 HU (60 de alcance MVP, 5 R2 fuera de los KPI). |
| `tareas` | `id`, `nombre`, `historia_id`, `area_id`, `fecha_inicio`, `fecha_fin`, `dias_habiles`, `ruta_critica`, `estado`, `estado_origen`, `evidencia`, bandera de publicación, `fecha_publicacion`, `nota_publicacion`, visibilidad | 99 tareas; la publicación es la capa oficial. |
| `tarea_predecesora` | `tarea_id`, `predecesora_id` | Secuencia del cronograma. |
| `milestone_historia` | `milestone_id`, `historia_id` | 60 vínculos. |
| `milestone_tarea` | `milestone_id`, `tarea_id` | 99 vínculos (cada tarea en un milestone). |
| `milestone_dependencia` | `milestone_id`, `depende_de_id` | Dependencias entre milestones. |
| `riesgos` | `id`, `descripcion`, `probabilidad`, `impacto`, `mitigacion`, `fuente`, `interno` | Catálogo de riesgos; los internos nunca se muestran al equipo Ecopetrol. |
| `milestone_riesgo` | `milestone_id`, `riesgo_id` | Riesgos por milestone. |
| `notas` | `entidad_tipo`, `entidad_id`, `texto`, `autor_rol`, visibilidad | Notas internas o visibles. |
| `bitacora` | `entidad_tipo`, `entidad_id`, `campo`, `valor_anterior`, `valor_nuevo`, `origen`, `actor_rol`, `detalle`, `creado_en` | Registro de todo cambio (quién, qué, cuándo, antes → después). |
| `calendario` | `fecha`, `es_habil`, `sprint_id`, `es_jueves` | Calendario hábil (sin fines de semana ni festivos). |
| `avance_area_base` | `area`, tareas y días hábiles totales/hechos, `%` planificado y real | Línea base al corte; la app recalcula en vivo y la compara. |
| `agenda_weekly` | `fecha`, `n_hu`, `sp_total`, `epicas` | Weeklies de demo. |
| `agenda_hu` | `historia_id`, `fecha_weekly` | Qué HU se demuestra en cada weekly. |
| `configuracion` | `clave`, `valor` | Ajustes de visibilidad y reglas (resumen por área visible, riesgos visibles, contar «Lista para demo»). |

## 4. Importación no destructiva y conflictos

Scripts de consola (nunca en runtime; la app no lee Excel ni CSV):

| Comando | Fuente | Carga |
| --- | --- | --- |
| `pnpm run import -- <working_plan.xlsx>` | Plan del equipo | Sprints, festivos, HU, tareas (con fechas seriales convertidas), predecesoras. |
| `pnpm run import:milestones` | `data/milestones_MANUEL.xlsx` + catálogo de riesgos | Líneas, milestones, vínculos HU/tarea, dependencias, riesgos. `Tabla_Areas` se valida contra las 7 áreas (no crea ids). |
| `pnpm run import:progress` | `data/progress/*.csv`, `data/agenda/*.csv` | Calendario hábil, días por tarea, línea base por área, agenda de demos. |
| `pnpm run seed:evidence` | `data/evidence/matriz_evidencia.csv` | Estados **técnicos** iniciales (origen «código»), solo donde el estado sigue en «plan». |
| `pnpm run db:sin-publicaciones` | — | Garantiza que nada queda publicado automáticamente; lo registra en bitácora. |
| `pnpm run db:bootstrap` | Todo lo anterior | Migraciones + imports + seed técnico + sin publicaciones, e imprime conteos. |

Reglas:

- **UPSERT por id** que solo actualiza columnas de plan; una guarda impide escribir columnas de app (el import falla si lo intenta).
- Las relaciones N:M **nunca se borran**: se insertan las nuevas y se reportan las que ya no están.
- **Conflictos**: ids presentes en la base y ausentes del archivo (HU o tareas eliminadas, relaciones movidas de milestone) se listan como «CONFLICTOS — no se borró nada» y se conservan.
- Estados, publicaciones, notas y bitácora sobreviven a cualquier re-import (probado con la tarea T-010).
- Idempotente: una segunda ejecución inserta 0 filas.
## 5. Avance oficial vs. avance técnico interno

**Regla base: nada empieza publicado.** Tras la carga, el avance oficial es **0/99** hasta que un editor o
administrador apruebe y publique. La evidencia en código es solo una **sugerencia interna** y nunca fija el estado oficial.

| | Avance oficial (Equipo Ecopetrol) | Avance técnico interno (editor/admin) |
| --- | --- | --- |
| Tarea «Hecha» | Solo si fue **aprobada y publicada** (fecha + nota de entrega) | Estado técnico (matriz de evidencia o editor, con evidencia obligatoria) |
| Tarea no publicada | Estado según el plan: Pendiente antes de su inicio, En curso después | Pendiente / En curso / Hecha / Bloqueada |
| Milestone cumplido | Solo si fue aprobado y publicado | Estado sugerido o fijado por el editor |
| Evidencia visible | Nota de entrega («Demostrado en weekly 15/10») | Evidencia técnica sugerida (rutas, commits) |
| Etiqueta en pantalla | «Avance oficial» | «Avance técnico interno (local, no visible para el equipo Ecopetrol)» |

Reglas de cálculo (iguales en ambas capas, cada una con su estado):

- **Avance por tareas** de un milestone o área = tareas Hecha / tareas; **ponderado** = días hábiles de tareas Hecha / días hábiles totales.
- **Planificado a la fecha** = tareas cuya fecha fin ya pasó / tareas (al corte 28/09/2026: **7,1 %**). Brecha = avance − planificado.
- **Avance por SP** = SP de HU aceptadas (o «Lista para demo», según el ajuste) / SP totales del alcance MVP (60 HU · 263 SP; las 5 HU R2 se muestran aparte).
- **Estado sugerido del milestone**: Cumplido si todas sus HU cuentan como completas; Atrasado si su fecha pasó sin cumplirse; En riesgo si una tarea en ruta crítica venció sin cerrarse; En curso si hay avance; si no, Pendiente. El editor puede fijarlo a mano o volver a «Automático».
- **Días hábiles** sin fines de semana ni festivos (tabla `calendario`).
- La capa técnica al corte reproduce la línea base de `avance_area.csv`: 25/99 tareas Hecha, 7,07 % planificado vs. 24,79 % real ponderado.
## 6. Vistas

Shell del arquetipo BenchHub (paleta y login copiados de `eco-comparator-web`): sidebar oscuro, cabecera blanca con
franja degradada, logo de Ecopetrol en la cabecera. Interfaz en español, responsive (390 px) y con polling de 8 s a
`/api/version` para reflejar cambios sin recargar.

| Ruta | Contenido |
| --- | --- |
| `/login` | Réplica de SCR-01: foto de refinería, panel de marca, tarjeta de vidrio con el PIN de rol. |
| `/` Resumen | Hero de **avance oficial** (anillo con marca de plan, ponderado, planificado, brecha), KPI de HU y SP (alcance MVP + nota R2), cuenta regresiva al próximo weekly y demo, milestones cumplidos/en riesgo, planificado vs. entregado por área, próximos hitos, milestones por línea y entregas publicadas. Editor/admin ven además la banda de avance técnico interno. |
| `/lineas` | Roadmap de L1/L2/L3 del 21/09 al 18/12 con sprints como bandas, festivos marcados, marcador «hoy» y milestones como nodos por estado con su %. Filtro por área que recalcula cada nodo. **Panel en línea M-xx**: clic en un nodo despliega bajo su línea (bottom sheet en móvil) qué recibe el equipo Ecopetrol, HU con SP y estado, tareas por área, dependencias y riesgos visibles; se cierra con X, Esc o un nuevo clic; `?m=M-01` lo abre al cargar. Editor/admin ven ahí «Aprobar y publicar» del milestone. |
| `/milestones/[id]` | Valor para Ecopetrol, criterio de aceptación, pestañas **Por área** (ramas con barra y tareas ejecutadas/pendientes, HU, cierre, ruta crítica, entrega) y **Por HU**, dependencias, riesgos visibles, notas. |
| `/areas` | Resumen por área (anillos, planificado vs. entregado, áreas atrasadas) y detalle filtrado por área. |
| `/historias/[id]`, `/tareas/[id]` | Detalle de HU (tareas por área, milestones, demo) y de tarea (fechas, días hábiles, predecesoras/sucesoras, entrega; editor/admin: evidencia técnica sugerida, controles e historial). |
| `/agenda` «Qué verás y cuándo» | Lista cronológica de weeklies con demo: milestones de esa fecha con su valor, HU a demostrar y SP. |
| `/verificacion` | «Pendiente de verificación» (editor/admin): tareas técnicamente Hecha sin publicar con su evidencia técnica sugerida, «Aprobar y publicar» con nota y fecha, y lista de publicadas con «Retirar publicación». |
| `/editor` | Panel del editor: tareas, HU, milestones y visibilidad/ajustes con filtros; cambio de estado, publicación, visibilidad. |
| `/bitacora` | Registro paginado y filtrable: cuándo, quién (rol), elemento, campo, anterior → nuevo, detalle. |
## 7. Seguridad

- **PIN por rol** en variables de entorno; comparación en tiempo constante; los intentos fallidos esperan ~0,8 s y se bloquean 10 min tras 5 fallos por IP.
- **Sesión**: cookie `HttpOnly`, `Secure` en producción, `SameSite=Lax`, token HMAC-SHA256 con `SESSION_SECRET` (≥ 32 caracteres), 12 h. El PIN nunca viaja en la URL ni se registra.
- `src/proxy.ts` protege todas las rutas salvo el login y los estáticos; `/api/*` sin sesión responde 401.
- **Guardia de arranque** (`next start` y build en Vercel): no arranca si faltan los PIN o `SESSION_SECRET`, si los PIN son los de demostración, si el secreto es el de ejemplo o si la base es un archivo local. `LOCAL_DEMO=1` solo habilita pruebas locales y se ignora en Vercel.
- **Indexación**: `X-Robots-Tag: noindex, nofollow, noarchive` en todas las rutas, `robots.txt` con `Disallow: /` y metadatos `noindex`.
- Ningún secreto en el bundle de navegador (`.next/static` revisado). Rutas con base de datos en runtime Node.js.

**Matriz de permisos de las rutas mutantes** (todas `POST`, JSON):

| Ruta | Sin sesión | Equipo Ecopetrol | Editor | Admin |
| --- | --- | --- | --- | --- |
| `/api/editor/estado` | 401 | **403** | ✓ (Hecha exige evidencia: 422) | ✓ |
| `/api/editor/nota` | 401 | **403** | ✓ | ✓ |
| `/api/editor/visibilidad` | 401 | **403** | ✓ | ✓ |
| `/api/editor/config` | 401 | **403** | ✓ | ✓ |
| `/api/editor/publicacion` | 401 | **403** | ✓ (tarea no Hecha o fecha futura: 422) | ✓ |
| Server actions `loginWithPin` / `logout` | — | solo sesión | solo sesión | solo sesión |

## 8. Despliegue

Vercel (equipo `manuel-d958`) + **libSQL autoalojado (sqld) en Fusion** (app `benchhub-seguimiento-libsql`, proyecto
«BenchHub Seguimiento», entorno PROD, volumen `/var/lib/sqld`, autenticación JWT EdDSA). El disco de Vercel es efímero,
por eso la base vive en el sqld remoto con el mismo dialecto SQLite. La carga inicial se hace desde la máquina del dueño
con `pnpm run db:bootstrap` (7 sprints · 4 festivos · 65 HU · 99 tareas · 10 milestones · 0 publicadas).

Los pasos exactos (variables de entorno, `vercel link`, preview, prueba de humo, producción, rollback, rotación de la
clave JWT, re-import) están en **`seguimiento-app/DEPLOY.md`**. Esta especificación no incluye secretos, tokens ni PIN:
solo se referencian por nombre de variable (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `SESSION_SECRET`, `PIN_ECOPETROL`,
`PIN_EDITOR`, `PIN_ADMIN`).
## 9. Criterios de aceptación

Todos se ejecutan sobre una **copia** de la base (`data/seguimiento.test.db`, servidor propio en :3101); ninguna
verificación escribe en la base viva.

| # | Criterio | Lo prueba |
| --- | --- | --- |
| 1 | Plan importado: 7 sprints, 4 festivos, 65 HU, 99 tareas, 7 áreas, toda tarea con área válida. | `pnpm run verify:import` |
| 2 | Re-import no destructivo: T-010 conserva estado, origen y evidencia; notas, bitácora y publicaciones intactas; el nombre de plan se restaura. | `pnpm run verify:import` |
| 3 | Milestones: 10 milestones, 3 líneas, 60 vínculos HU, 99 vínculos de tarea; re-import con 0 inserciones y sin conflictos. | `pnpm run verify:milestones` |
| 4 | Avance recalculado en vivo = línea base por área (7,07 % planificado vs. 24,79 % real ponderado; M-01 5/20). | `pnpm run verify:milestones` |
| 5 | Nada empieza publicado: el Equipo Ecopetrol ve 0/99 y el admin ve ambas capas, la técnica rotulada como interna. | `pnpm run check:capas` |
| 6 | El Equipo Ecopetrol no ve rastros técnicos (rutas de repositorio, commits, «técnico interno») en el HTML ni en el payload RSC. | `pnpm run check:capas` |
| 7 | Un Hecha técnico no llega al Equipo Ecopetrol; el editor aprueba y publica (fecha + nota) → lo ve sin recargar; el admin retira → deja de verlo; igual para un milestone. | `pnpm run check:edit` |
| 8 | Hecha exige evidencia; publicar una tarea no Hecha o con fecha futura → 422. | `pnpm run check:edit` |
| 9 | Toda acción queda en la bitácora con rol y fecha (publicar por editor, retirar por admin). | `pnpm run check:edit` |
| 10 | Notas internas y riesgos internos nunca llegan al Equipo Ecopetrol (HTML + RSC). | `pnpm run check:edit`, `pnpm run check:timeline` |
| 11 | Todas las rutas mutantes responden 403 al rol observador; solo existen server actions de sesión; ninguna página muestra controles de edición al observador. | `pnpm run check:readonly` |
| 12 | Panel en línea M-xx: el clic abre en la misma vista (la URL solo gana `?m=`), Esc/X/clic cierran, otro nodo cambia el contenido, `?m=` abre al cargar, bottom sheet en 390 px. | `pnpm run check:timeline` |
| 13 | Ninguna página, para ningún rol, usa la palabra que el rol «Equipo Ecopetrol» reemplazó, salvo nombres del plan que la contienen (la prueba los lista). | `pnpm run check:copy` |
| 14 | Solo colores del set de tokens del arquetipo BenchHub. | `pnpm run check:palette` |
| 15 | Build y lint limpios. | `pnpm build`, `npx eslint src` |
| 16 | Base remota preparable desde cero, de forma idempotente y con 0 publicaciones. | `pnpm run db:bootstrap` |
| 17 | La guardia de arranque rechaza PIN de demo, secretos de ejemplo o faltantes y base de archivo en producción. | `next start` con esas variables (procedimiento en `seguimiento-app/DEPLOY.md`) |
| 18 | Capturas de referencia por rol. | `pnpm run screens` (y las que generan los `check:*`) |