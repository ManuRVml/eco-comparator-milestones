# Estándar de APIs del BFF

**Alcance.** Este documento define convenciones para los endpoints del BFF. Describe por separado el estado observado y la propuesta. La propuesta no afirma que existan hoy conexiones de producción, RBAC completo ni clientes de datos.

## 1. Convenciones actuales detectadas y dónde se rompen

### Convenciones observadas

- El contrato agrupa rutas bajo `/api/v1` y asigna identificadores funcionales por operación; por ejemplo, `GET /api/v1/views/analyses` es V-04 y `GET /api/v1/auth/login` es A-01 (OpenAPI: `/api/v1/views/analyses`, `/api/v1/auth/login`; inventario `Milestones/data/raw/repo/bff-endpoints.md:1-8`).
- V-04 es una vista paginada: sus filtros son `q`, `createdOn`, `createdBy`, `status`, `ref`, `page` y `pageSize`; página predeterminada 1, tamaño predeterminado 20 y máximo 100 (`eco-comparator-bff/src/contracts/analyses/v-04-analyses.ts:49-61`; OpenAPI: `/api/v1/views/analyses`).
- El esquema Zod de V-04 rechaza propiedades no declaradas en el query, fila de salida, opciones de filtros y objeto de respuesta mediante `.strict()`; su sobre de página contiene `items`, `page`, `pageSize` y `totalItems` (`eco-comparator-bff/src/contracts/analyses/v-04-analyses.ts:21-45,51-61`; `eco-comparator-bff/src/contracts/common/page.ts:3-13`).
- Los contratos A-01/A-02 describen el inicio de sesión Entra ID con OIDC, código de autorización y PKCE, y el callback que valida estado/nonce y el token (`eco-comparator-bff/docs/requirements/view-data-contracts/A-01-auth-login.md:3-6`; `eco-comparator-bff/docs/requirements/view-data-contracts/A-02-auth-callback.md:3-7`; `eco-comparator-bff/docs/architecture/adr/0004-session-store-token-handler.md:23-30`). El router mock, en cambio, redirige a un callback local con `mock-code` (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:543-558`).
- El router mock crea una cookie `httpOnly`, `SameSite=Lax` y `Secure` en producción; sus sesiones viven en un `Map` local del proceso (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:517-520,526-540`). La configuración predetermina `SESSION_STORE=memory` y rechaza `lakebase` hasta la Fase 4 (`eco-comparator-bff/src/config/env.ts:64-69`).
- El handler mock genérico exige sesión; además comprueba CSRF para métodos inseguros y valida el request (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:611-615). El rol mock se guarda en la sesión, pero este handler no evalúa un permiso por endpoint (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:527-534,611-615`).
- El sobre común es `{ code, message, traceId, details? }` y es estricto (`eco-comparator-bff/src/contracts/common/api-error.ts:3-14`). Los contratos de autenticación definen otro sobre, `{ error: { code, messageKey, traceId } }` (`eco-comparator-bff/src/contracts/session/auth-shared.ts:5-20`).
- El logger HTTP usa Pino, genera o reutiliza un trace ID, lo devuelve en `x-trace-id` y lo incluye en el log estructurado (`eco-comparator-bff/src/presentation/http/middlewares/request-logger.ts:10-29`; `eco-comparator-bff/src/presentation/http/middlewares/trace-id.ts:5-18`). El middleware central serializa errores con ese ID (`eco-comparator-bff/src/presentation/http/middlewares/error-handler.ts:24-53`).
- El inventario de runtime califica al BFF como mock-only, indica que no tiene persistencia directa y que Lakebase está pendiente (`Milestones/data/raw/repo/bff-runtime.md:82-96`); `src/config/env.ts` solo rechaza el modo Lakebase, no configura un cliente SQL Warehouse (`eco-comparator-bff/src/config/env.ts:64-70`).

### Rupturas frente al estándar propuesto

- **Seguridad del contrato incompleta:** OpenAPI declara `components.schemas`, pero no un esquema de seguridad para la cookie; el path V-04 tampoco declara requisito de seguridad (OpenAPI: `components` y `/api/v1/views/analyses`, en particular `eco-comparator-bff/contracts/openapi.yaml:7-8,11916-11923`). El runtime mock sí requiere cookie de sesión para las operaciones genéricas (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:611-614`).
- **Sin autorización RBAC por operación:** el handler genérico valida sesión y CSRF, no permiso ni alcance de datos (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:611-615`). Las capacidades que devuelve una vista no sustituyen una decisión de autorización del servidor.
- **Sin persistencia implementada:** la sesión está en memoria y la configuración impide seleccionar Lakebase; el inventario reporta que no hay persistencia directa ni clientes de datos de producción (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:517-520`; `eco-comparator-bff/src/config/env.ts:64-69`; `Milestones/data/raw/repo/bff-runtime.md:82-96`).
- **La validación estricta de salida no es universal en el handler mock:** algunas ramas llaman `.response.parse()` (por ejemplo O-01, `eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:703-705`), pero la respuesta fixture genérica se envía directamente (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:746-750`). Cada implementación real debe parsear la respuesta final con su esquema antes de serializarla.
- **Error inconsistente en autenticación:** A-01/A-03 usan `messageKey` anidado mientras el resto del BFF documenta `ApiError` plano (`eco-comparator-bff/src/contracts/session/auth-shared.ts:5-20`; `eco-comparator-bff/src/contracts/common/api-error.ts:3-14`).
- **Auditoría pendiente de demostrar en ejecución:** ADR-0006 exige auditoría de escrituras en su referencia al brief (`eco-comparator-bff/docs/architecture/adr/0006-logging-and-tracing.md:6-9`), pero el handler mock genérico solo autentica, comprueba CSRF, valida y responde; no emite allí evento de auditoría (`eco-comparator-bff/src/presentation/http/routes/mock.routes.ts:611-615,721-750`).
- **OpenAPI no refleja la política completa:** el response de V-04 está documentado, pero sin seguridad de cookie; sus errores se describen como familias 4XX/5XX, no como catálogo de códigos por operación (OpenAPI: `/api/v1/views/analyses`).

## 2. Estándar propuesto

### 2.1 Rutas, nombres y versionado

- Mantener el prefijo `/api/v1`; el cambio incompatible requiere `/api/v2` y periodo de compatibilidad documentado.
- Mantener IDs funcionales existentes: V-xx para lecturas de vista, C-xx para comandos, A-xx para autenticación y O-xx para operaciones técnicas. Cada path tiene un solo método semántico y un `operationId` estable en camelCase.
- Usar sustantivos plurales para colecciones, identificadores como segmentos (`/analyses/{analysisId}`) y subrecursos para acciones con ciclo de vida propio; evitar verbos ad hoc en paths.
- Query params solo expresan filtros, orden y paginación; body JSON para crear o cambiar estado. No colocar secretos ni tokens en URL.
- Publicar el contrato OpenAPI junto con los esquemas Zod: documentar parámetros, respuestas, errores, cookies/seguridad, scopes y ejemplos.

### 2.2 Autenticación y autorización

- En producción, el BFF completa Entra ID OIDC Authorization Code + PKCE. Valida firma, issuer, audience, nonce, state y expiración; intercambia el código en servidor y mantiene tokens fuera del navegador. El mock de identidad queda limitado a desarrollo/pruebas.
- La sesión es una cookie opaca `HttpOnly; Secure; SameSite=Lax; Path=/`; nunca un bearer token accesible al SPA. Las escrituras exigen token CSRF en header y validación de origen.
- OpenAPI declara el mecanismo cookie (security scheme tipo apiKey en cookie) y lo asocia a cada operación protegida. Solo login/callback y probes expresamente públicos quedan sin seguridad.
- Después de autenticar, cada handler aplica RBAC en servidor con permiso nombrado, por ejemplo `analysis:read` o `analysis:create`; mapea los roles de A-04 a permisos en una matriz central, falla cerrado ante rol desconocido y aplica además el alcance de tenant/propietario. No confiar en `permissions` enviado por cliente ni en botones ocultos.
- Responder 401 si falta o expiró sesión; 403 si la identidad existe pero carece del permiso. No revelar si un recurso ajeno existe: usar 404 cuando la política de acceso lo requiera.

### 2.3 Esquemas de entrada y tipos

- Un esquema Zod estricto por operación para path params, query y body; validar y normalizar antes del caso de uso. Rechazar campos extra, coerciones ambiguas, fechas inválidas y valores fuera de enumeraciones.
- Tipar explícitamente IDs, fechas ISO-8601, enums, booleanos y números enteros; poner mínimo/máximo y límites de longitud. No aceptar IDs arbitrarios cuando existe un esquema de dominio.
- Un esquema de respuesta por operación. Construir la respuesta, validarla con `.parse()` y solo entonces serializar. La validación de salida falla como error interno seguro y deja detalle técnico solo en logs.
- Generar OpenAPI desde el registro de contratos para evitar divergencia entre Zod, documentación y handler.

### 2.4 Respuesta, errores, HTTP, paginación y filtros

- JSON exitoso con forma estable de la operación. Las colecciones usan `{ items, page, pageSize, totalItems }`; una vista puede añadir campos de vista estrictamente tipados como `filterOptions` y `permissions`. No envolver dos veces ni variar forma por escenario.
- Mantener códigos HTTP: 200 lectura/actualización con cuerpo, 201 creación, 202 trabajo aceptado, 204 éxito sin cuerpo; 400 entrada inválida, 401 no autenticado, 403 no autorizado, 404 no visible/no encontrado, 409 conflicto, 429 límite, 500 fallo inesperado y 502/503 dependencia no disponible. Documentar por operación los estados que realmente puede emitir.
- Todas las respuestas de error usan un único sobre plano `{ code, message, traceId, details? }`; `details` es seguro, opcional y no contiene PII, tokens, SQL ni stack. Códigos estables en inglés; mensajes presentables/localizables por cliente. Retirar el sobre alterno de auth al alinear contratos.
- Listados usan `page` desde 1 y `pageSize` con default 20 y máximo 100 para compatibilidad con V-04. Orden estable por clave y desempate por ID. Si se adopta cursor para grandes volúmenes, versionar el contrato y no mezclar cursor con página en una misma operación.
- Validar filtros con allowlist por endpoint, combinar de forma determinista y aplicar autorización/alcance antes de filtrar, calcular opciones o paginar. Limitar búsqueda y tamaño de filtros; devolver metadatos calculados solo sobre filas visibles.

### 2.5 Acceso a datos: Lakebase transaccional vs SQL Warehouse Gold

- **Lakebase (transaccional):** única autoridad de lectura/escritura para estado mutable del producto: análisis, borradores, configuración, publicaciones, sesiones, idempotencia y auditoría. Cambios de estado usan transacciones; escrituras críticas son idempotentes y respetan claves/constraints.
- **SQL Warehouse (Gold, solo lectura):** consultas de indicadores y datasets curados Gold. El usuario de servicio no tiene permisos de escritura; no ejecutar DDL/DML, ni usar Warehouse como fuente para actualizar estado transaccional. Aplicar timeout, límite de filas y parámetros enlazados.
- Los handlers dependen de puertos de aplicación; adaptadores concretos encapsulan Lakebase o Warehouse. Mantener credenciales en servidor/secret manager y separar identidad/permisos por backend.
- **Estado actual:** esta sección es el diseño destino, no una afirmación de implementación. El inventario disponible describe BFF mock-only sin persistencia directa y la configuración rechaza Lakebase hasta Fase 4 (`Milestones/data/raw/repo/bff-runtime.md:82-96`; `eco-comparator-bff/src/config/env.ts:64-69`). Ningún endpoint debe prometer persistencia real hasta implementar y verificar sus adaptadores.

### 2.6 Trazabilidad: logs estructurados, correlation ID y auditoría

- Usar un correlation ID por request; validar/reutilizar W3C `traceparent` válido o generar ID criptográficamente aleatorio. Devolverlo en `x-trace-id`, incluirlo en `ApiError.traceId` y propagarlo explícitamente a puertos y llamadas salientes.
- Log JSON con Pino: `traceId`, operationId/route template, método, status, duración, resultado y userId seudónimo. No registrar URL con datos sensibles, body por defecto, cookies, tokens, credenciales, CSRF ni PII; aplicar redacción.
- Emitir evento de auditoría para cada escritura y lectura sensible: actor, permiso, acción, recurso, resultado, instante y correlation ID. Persistirlo de manera durable con el cambio transaccional cuando corresponda; restringir acceso y retención. Auditoría no reemplaza logs operativos.
- No retornar stack, query SQL, tokens ni detalles internos. 4xx a nivel warn; 5xx a error, siempre correlacionados.

## 3. Endpoint de referencia completo y checklist

### Referencia propuesta: V-04 — lista de análisis

Ejemplo de contrato conforme al estándar; se apoya en el endpoint y los campos ya definidos por V-04, sin crear ni cambiar endpoints (contrato: `eco-comparator-bff/src/contracts/analyses/v-04-analyses.ts:8-10,21-45,49-61`; OpenAPI: `/api/v1/views/analyses`).

**Ruta y acceso**

- `GET /api/v1/views/analyses?q=&createdOn=&createdBy=&status=&ref=&page=1&pageSize=20`
- `operationId: getAnalysesView`; etiqueta funcional `V-04`.
- Autenticación: cookie de sesión válida; RBAC requiere `analysis:read`. El mapeo de roles aprobados concede lectura a los cinco roles de A-04 (roles definidos en `eco-comparator-bff/src/contracts/session/auth-shared.ts:22-29`); desconocido = denegado. Restringir filas al tenant y alcance del usuario antes de computar filtros.
- Esta ruta es de solo lectura; no requiere CSRF. OpenAPI debe declarar el requisito de cookie (propuesta; el contrato actual no lo declara, OpenAPI: `/api/v1/views/analyses`).

**Entrada validada (query, esquema estricto)**

```ts
z.object({
  q: z.string().default(''),
  createdOn: z.iso.date().optional(),
  createdBy: userIdSchema.optional(),
  status: z.enum(['draft', 'in_progress', 'in_review', 'published']).optional(),
  ref: z.enum(['tbg-ilp']).optional(),
  page: queryIntSchema.default(1),
  pageSize: queryIntSchema.max(100).default(20),
}).strict()
```

Ejemplo: `GET /api/v1/views/analyses?q=energía&status=in_progress&page=1&pageSize=20`. Rechazar parámetros desconocidos, comprobar permiso y alcance antes de devolver datos y opciones de filtro.

**Respuesta 200**

```json
{
  "items": [{
    "id": "ana_01",
    "name": "Análisis de energía",
    "description": "Comparación anual",
    "createdOn": "2026-09-28",
    "createdBy": { "id": "usr_01", "fullName": "Persona autorizada" },
    "status": "in_progress",
    "canOpenResults": true
  }],
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "filterOptions": {
    "createdOn": ["2026-09-28"],
    "createdBy": [{ "id": "usr_01", "fullName": "Persona autorizada" }],
    "status": ["in_progress"]
  },
  "permissions": { "canCreate": true }
}
```

Validar el objeto completo con `v04ResponseSchema` antes de responder; respetar orden estable. Los campos de fila, filtros, sobre de página y permiso corresponden al contrato V-04 (`eco-comparator-bff/src/contracts/analyses/v-04-analyses.ts:14-45`; ejemplo de permiso `eco-comparator-bff/docs/requirements/view-data-contracts/V-04-analyses.md:27-42`).

**Errores**

Mismo sobre común en cada error; no revelar registros fuera de alcance:

```json
{
  "code": "FORBIDDEN",
  "message": "No tiene permiso para consultar esta vista.",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

Estados: 400 filtro/query inválido; 401 sesión ausente/expirada; 403 permiso insuficiente; 429 límite excedido; 500 inesperado. Esquema del sobre: `eco-comparator-bff/src/contracts/common/api-error.ts:3-14`.

**Log y auditoría**

- Log estructurado al completar: `{ traceId, operationId: "getAnalysesView", method: "GET", route: "/api/v1/views/analyses", status, durationMs, userId: "<seudónimo>" }`; nunca registrar query con texto libre, cookie ni body.
- Para esta lectura de datos sensibles, evento de auditoría `{ traceId, actorId, permission: "analysis:read", action: "analysis.list", result, timestamp }`; excluir nombres/cookies/tokens. Las escrituras usarán evento durable vinculado a la transacción Lakebase.

**Checklist (una comprobación por línea)**

- [ ] ¿Path, método, versión, ID funcional y `operationId` coinciden entre handler y OpenAPI?
- [ ] ¿OpenAPI declara cookie/scope de seguridad y marca pública solo la ruta permitida?
- [ ] ¿El handler exige sesión y permiso RBAC, y limita por tenant/propietario?
- [ ] ¿Path, query y body usan esquemas Zod estrictos con límites explícitos?
- [ ] ¿La respuesta final se valida con su esquema antes de serializar?
- [ ] ¿Éxito, errores y códigos HTTP están documentados con forma uniforme?
- [ ] ¿La paginación tiene orden estable y límites, y los filtros son allowlist?
- [ ] ¿El acceso transaccional va a Lakebase y Gold se consulta solo en lectura por su puerto?
- [ ] ¿Logs y errores incluyen correlation ID y excluyen secretos/PII?
- [ ] ¿Escrituras y lecturas sensibles generan auditoría segura e íntegra?
- [ ] ¿Las pruebas de contrato cubren autorización, validación, errores y filtros fuera de alcance?





