# RefEstECP · Auditoría de accesos y estado del proyecto (DEV)

> **NOTA PARA EL AGENTE — LEER PRIMERO**
>
> Este documento es un **registro de estado real**, no un plan ni una lista de deseos. Todo lo marcado como hecho fue **verificado en vivo** el **02 oct 2026** llamando a las APIs de Fabric, Databricks y Azure DevOps con el token de la sesión activa (no se basa en documentación ni en permisos declarados).
>
> Convención de estados (úsala tal cual, no la reinterpretes):
>
> | Marca | Significado |
> |---|---|
> | ✅ **HECHO** | Avance real, hecho y verificado. Puedes asumir que existe y funciona. |
> | ⚠️ **PENDIENTE · EXTERNO** | Pendiente real que depende de otro equipo. **No lo des por hecho** ni intentes resolverlo por tu cuenta; solo se puede solicitar. |
> | ⭕ **PENDIENTE · PROPIO** | Pendiente real nuestro, normalmente bloqueado por un dato o credencial que aún no llega. |
> | ❔ **SIN VERIFICAR** | No se ha probado. No afirmes que funciona ni que falla. |
>
> Reglas de uso:
> 1. Si algo no aparece como ✅, **no está hecho**.
> 2. El estado está congelado al 02 oct 2026; si hay evidencia más reciente (commits, runs, respuestas de otros equipos), prevalece la evidencia nueva.
> 3. Hito crítico: **H-02 · 9 oct 2026** (login real con Entra ID). Su camino crítico es la App Registration (ver §9).
> 4. Hay **inconsistencias conocidas** en el HTML original, listadas en §12. No las repliques.

---

## 1. Identidades

| Campo | Valor |
|---|---|
| Cuenta | `manuel.rodriguez@vml.com` |
| Alias ECP | `manuel.rodriguez.ext@ecopetrol.com.co` |
| Tenant | `ecopetrolad` (ID `a4305987-cf78-4f93-9d64-bf18af65397b`) |

Son **dos identidades distintas**:

- **vml.com**: invitado federado (guest) con VML. Licencia Visual Studio Professional en Azure DevOps. Es la cuenta con la que se trabaja en Azure DevOps.
- **ecopetrol.ext**: miembro del tenant. Tiene acceso a Databricks y Fabric; en Azure DevOps es solo Stakeholder, sin acceso a repos.

---

## 2. Resumen de avance (al 02 oct 2026)

**71 % — 24 de 34 hitos del alcance en DEV están hechos.**

Lo que falta no es código propio: son accesos y recursos que otros equipos deben entregar, más tres tareas propias que esperan datos o credenciales:
1. Aplicar las migraciones al esquema real de Lakebase.
2. Conectar la App a Lakebase.
3. Llevar datos reales a las vistas del frontend.

Métricas:

| Métrica | Valor |
|---|---|
| PRs integrados | 17 (13 en esta sesión) |
| Tests automáticos | 3 555 (1 262 backend · 2 293 frontend) |
| Cobertura de líneas | 96 % backend · 91 % frontend |
| Endpoints de auth reales | 4 de 5 (A-05 solo existe en el BFF simulado) |
| Adaptadores detrás de puertos | 9 (memoria, Lakebase, IdP, cripto…) |
| Migraciones SQL | 3 |
| ADR nuevos | 2 (ADR-0010 y ADR-0011) |

Orden en que se fue logrando el avance: Node 22 alineado con Databricks → sesiones y migraciones en Lakebase → login, callback y logout reales → endpoint de sesión (A-04) → despliegue que arranca el compute → documentación y SonarQube → botón de Microsoft.

---

## 3. Hitos por área

### 3.1 Autenticación y sesión — BFF · token-handler — 4/6 (67 %)
- ✅ Login con PKCE (A-01) y callback (A-02)
- ✅ Cierre de sesión con CSRF (A-03)
- ✅ Endpoint de sesión con roles y permisos (A-04)
- ✅ Cookies `__Host-`, tokens cifrados, purga programada
- ⚠️ Proveedor real de Entra ID (App Registration)
- ⚠️ Mapeo de los grupos reales a roles

### 3.2 Persistencia en Lakebase — Postgres 17 · `refestecp-dev` — 4/7 (57 %)
- ✅ Proyecto de Lakebase creado y probado
- ✅ Almacén de sesiones y de transacciones de login
- ✅ Migraciones SQL con ejecutor y chequeo de inmutabilidad
- ✅ Credencial que se renueva sola (OAuth M2M)
- ⭕ Aplicar las 3 migraciones al esquema real
- ⚠️ Esquema de negocio (tarea T-003 de Marco)
- ⚠️ Rol de Postgres del service principal

### 3.3 Frontend — React · modo http — 4/5 (80 %)
- ✅ Sesión real: lectura de `/session`, CSRF y salida
- ✅ Botón único «Ingresar con Microsoft»
- ✅ Modo de login explícito (`password` u `oidc`)
- ✅ Recorrido completo probado en navegador
- ⭕ Datos reales del BFF en las vistas

### 3.4 Pipeline CI/CD — Azure DevOps · DEV — 5/7 (71 %)
- ✅ CI en verde: frontend, backend y empaquetado
- ✅ Migraciones inmutables comprobadas en cada run
- ✅ Script de despliegue probado (6 escenarios + App real)
- ✅ SonarQube preparado, apagado por parámetro
- ✅ Guarda que impide empaquetar un login que no corresponde
- ⚠️ Despliegue automático (service principal y environment)
- ⚠️ Build validation en la rama `dev`

### 3.5 Despliegue en Databricks Apps — `refestecp-dev` — 3/5 (60 %)
- ✅ App creada, desplegada y verificada (health 200)
- ✅ Despliegue reproducible y documentado
- ✅ Compute apagado: costo cero en reposo
- ⭕ Lakebase conectado a la App
- ⚠️ Login real de Microsoft en la App

### 3.6 Documentación — repo + recursos — 4/4 (100 %)
- ✅ `documentation.html` de backend y frontend al día
- ✅ Runbook con el paso a login real
- ✅ Inventario de infraestructura y ADR-0010 y 0011
- ✅ `recursos.html` con solicitudes en amarillo

---

## 4. Plataformas y recursos

Resumen: Fabric 1 workspace del proyecto · Databricks 1 workspace con acceso · 2 identidades · **17 solicitudes** por pedir o bloqueadas hasta que otro equipo las entregue.

### 4.1 Microsoft Fabric — workspace `WS-FB-NGOLD-PIVA` ✅
- Región: South Central US. Acceso: Workspace.
- Se puede: crear tablas, vistas y modelos semánticos en la capa gold de PIVA; reportes y paneles Power BI conectados a esa capa.
- ✅ Lakehouse **`LKH001_REFESTECP`** creado el 02 oct 2026 para las capas bronze, silver y gold.
- La cuenta ve 5 workspaces, pero solo `WS-FB-NGOLD-PIVA` es de este proyecto (RefEstECP); los otros 4 son de otras iniciativas del HUB.
- Verificado con: `az account get-access-token --resource https://api.fabric.microsoft.com` + `GET /v1/workspaces`.

### 4.2 Azure Databricks — workspace `dk-aeu-ecp-dev-maindatabricks` ✅
- RG `RG-AEU-ECP-DEV-BigDataFactory` · ambiente DEV.
- Se puede: notebooks (Python, SQL, Scala) y clusters propios (verificado listando clusters); leer catálogos de Unity Catalog (`main`, `pid`, `samples`); desplegar Databricks Apps (API habilitada, hay apps de otro equipo corriendo); crear proyectos de Lakebase.
- Verificado con: `az account get-access-token --resource 2ff814a6-3304-4ab8-85cb-cd0e6f879c1d` contra `GET /api/2.0/preview/scim/v2/Me` → 200 (login válido, no solo visible en ARM).

#### Databricks App `refestecp-dev` — ✅ desplegada en modo **mock**, detenida y lista
- Desplegada y verificada varias veces el 02 oct 2026. Último paquete: run **394913**; `/api/v1/health` responde 200. Compute apagado, sin costo.
- URL: `refestecp-dev-6115311547056401.1.azure.databricksapps.com` (pide inicio de sesión con Entra ID; ojo con el `.1.` en el host).
- Recurso `session-secret` enlazado al secret scope propio `refestecp-dev`.
- Service principal propio de la app (inyectado por Databricks): `app-odsy4k refestecp-dev`.
- Despliegue manual reproducible: subir paquete, arrancar y esperar el despliegue automático. Runbook: `docs/runbooks/deploy-dev-databricks-apps.md` (pasos, logs y errores frecuentes).
- El script `deploy-databricks-app.sh` automatiza esto en el pipeline y se probó contra esta App; **sigue apagado** hasta tener el service principal.
- Paquete resuelto: incluye `.pnpmfile.cjs`, `pnpm-workspace.yaml`, el lockfile y un `package.json` con solo el script `start`. Repo y plataforma usan Node **22.16.0** (fijado en `.nvmrc`).

#### Lakebase `refestecp-dev` — ✅ creado
- Proyecto Postgres · PostgreSQL 17 · creado el 02 oct 2026 · rama `production` · base `databricks_postgres`.
- Cómputo 0,5–1 CU, se suspende a los 5 min sin uso. Etiqueta de costos: `proyecto = RefEstECP`.
- Probado con identidad personal: conexión, escritura y lectura correctas; la tabla de prueba se revirtió.
- Migraciones en el repo: `0001_sessions`, `0002_login_transactions`, `0003_session_profile`. Probadas en esquemas temporales (ya borrados). ⭕ **Aún sin aplicar al esquema real.**
- Credencial que se renueva sola (OAuth M2M): el pool dinámico se probó con token de la CLI; ❔ el intercambio con un service principal real **aún no**.
- ⚠️ Falta el esquema de negocio (T-003 de Marco) y el rol de Postgres del service principal.

### 4.3 Bloqueos para conectar secretos del proyecto ⚠️
| Recurso | Estado | Detalle | Acción |
|---|---|---|---|
| Key Vault `KV-AEU-ECP-DEV-PLANINVA` | ⚠️ Sin acceso | Modelo **Access Policies** (no RBAC), RG `RG-AEU-ECP-DEV-AnaliticaSetupIAVFV`, sub ECP-DevTest. El usuario no aparece en ninguna access policy, no tiene rol RBAC y `az keyvault secret list` da 403 real. | Pedir access policy (Get/List de secrets) a infraestructura. |
| Secret Scope en Databricks hacia ese vault | ⚠️ No existe | Ninguno de los ~30 scopes del workspace apunta a PLANINVA. | Pedir a infraestructura que cree el scope. |
| Catálogo propio en Unity Catalog | ⚠️ Por definir | Solo existen `main`, `pid` y otros ajenos. | Confirmar si se crea uno dedicado o se reusa uno existente. |

Verificado con `az keyvault show --query properties.accessPolicies` (el objectId no aparece) y `GET /api/2.0/secrets/scopes/list`.

### 4.4 Azure DevOps — proyecto `HUBAnalitica` · repo `RefEstECP`
| Recurso | Estado | Detalle |
|---|---|---|
| Pipeline `HUBAnalitica-RefEstECP-CI` (id **4928**, carpeta `\RefEstECP`) | ✅ Creado | CI completo en verde en pool hosted (frontend, backend, empaquetado). Deploy a DEV desactivado hasta tener SP y environment. SonarQube preparado y apagado (`enableSonar`). Parámetro `loginMode` (`password`/`oidc`) con guarda que impide empaquetar un modo que no corresponde al BFF. |
| Última ejecución completa: run **394932** sobre `dev` | ✅ Verde | Artefactos `web-dist` y `bff-package`. Verify y e2e del frontend; verify e imagen mock del backend; package. El backend también comprueba que las migraciones integradas no se editen y prueba el script de despliegue con una CLI simulada. El pipeline agrupa merges seguidos en un solo run. |
| Variable group `VG-AEU-ECP-DEV-REFESTECP` (id **789**) | ✅ Creado | Autorizado solo para el pipeline 4928. Editable desde el portal con vml.com. `DATABRICKS_CLIENT_ID` y `DATABRICKS_CLIENT_SECRET` **vacíos** hasta que exista el SP. |
| PRs hacia `dev`: #62610 y #62617 a #62635 | ✅ Completados | Todos sin tarea vinculada (ver contenido abajo). |
| Environment `refestecp-dev` | ⚠️ Bloqueado | Crear devuelve 403 (falta permiso Create). Verificado el 02 oct 2026: no existe ningún environment con ese nombre; sin él Azure DevOps rechaza compilar el stage de despliegue. Un admin debe dar el permiso o crearlo y autorizar al pipeline 4928. |

Qué entró en `dev` vía esos PRs:
- Pipeline de CI, empaquetado, runbook de despliegue y alineación de Node 22.
- Sesiones y transacciones de login en Lakebase, credencial renovable, migraciones y su chequeo de inmutabilidad.
- Rutas de login, callback, logout y sesión, con purga programada y protecciones de producción.
- Despliegue a la App con cualquier estado del compute, inventario de infraestructura y documentación actualizada.
- Login del frontend contra el BFF real, probado de punta a punta en local (login, sesión, logout con CSRF).
- Botón único «Ingresar con Microsoft» (modo `oidc`) y etapa SonarQube preparada pero apagada; el pipeline impide combinar un modo de login con un BFF que no corresponde.

---

## 5. Permisos efectivos en Azure DevOps
Cuenta `manuel.rodriguez@vml.com`, permisos medidos por REST.

| Acceso | Estado | Evidencia |
|---|---|---|
| Leer el repo RefEstECP | ✅ Tenemos | `GenericRead = True` |
| Subir commits y crear ramas | ✅ Tenemos | `GenericContribute` y `CreateBranch = True`; se subieron 3 ramas |
| Abrir y contribuir a PRs | ✅ Tenemos | `PullRequestContribute = True`; PRs #62610 y #62617–#62635 |
| Crear, editar y ejecutar pipelines | ✅ Tenemos | `EditBuildDefinition` y `QueueBuilds = True`; pipeline 4928 y 3 ejecuciones |
| Administrar permisos del pipeline propio | ✅ Tenemos | Pipeline 4928 autorizado sobre variable group 789 |
| Completar (merge) PRs hacia `dev` | ✅ Tenemos | 02 oct 2026: PATCH `status = completed` → 200 sobre PR #62635 (squash). RefEstECP no tiene políticas de rama |
| Crear y editar variable groups propios | ✅ Tenemos | Grupo 789 creado y editado (PUT 200) |
| Usar el pool hosted Azure Pipelines | ✅ Tenemos | Ejecuciones completas en verde |
| Leer pipelines, repos, variable groups y service connections de otros proyectos | ✅ Tenemos (solo lectura) | HTTP 200 (50 pipelines, 27 conexiones, 9 grupos) |
| Crear environments | ⚠️ Falta | `Create = False`; crear `refestecp-dev` da 403 (aunque `Administer` aparece en True: señal contradictoria a revisar en Environments › Security) |
| Editar políticas de rama (Build validation) | ⚠️ Falta | `EditPolicies = False`; necesario para que los PR ejecuten el CI |
| Autorizar el pipeline sobre la conexión SonarQube | ⚠️ Falta | `SC-ECP-sonar-HUBAnalitica-DEV` no tiene ningún pipeline autorizado (tampoco el 4928). La de PRD (compartida) sí la usan pipelines hermanos. Autorizarla es un cambio sobre una conexión ajena → se solicita |
| Ver la raíz de la Library | No se pide | 403 «View library item»; el grupo propio sí abre y se edita |
| Saltar políticas de PR, force push, gestionar permisos del repo | No se pide | Los tres en False; no se necesitan y no conviene pedirlos |
| Service connection de Databricks | ❔ Sin verificar | No existe ninguna y no hace falta: el deploy usa el SP por variables |
| Usar el pool self-hosted `DbsAgentPoolDevTest` | ❔ Sin verificar | El YAML valida con ese pool, pero no se ejecutó nada en él |
| Crear work items en Azure Boards | ❔ Sin verificar | Los PR se abrieron sin tarea; no se probó crear una |

**Políticas de rama:** RefEstECP no tiene ninguna. Los repos hermanos sí: `MapeoRiesgosBackend` y `MapeoRiesgosFrontend` exigen 1 revisor mínimo en `dev` y `qa` (el autor no cuenta); `SoporteHUB` exige revisores en `main`. La rama de integración es **`dev`** (convención de esos repos y del cuaderno); `develop` ya no se usa. Para igualar controles hay que pedir al admin del repo la política de revisores en `dev`.

---

## 6. Nomenclatura (según patrones reales del HUB)

| Recurso | Nombre | Estado | Patrón / nota |
|---|---|---|---|
| Pipeline | `HUBAnalitica-RefEstECP-CI` | ✅ Creado | `HUBAnalitica-<Repo>-CI` (p. ej. `HUBAnalitica-MapeoRiesgosBackend-CI`) |
| Carpeta del pipeline | `\RefEstECP` | ✅ Creado | Una carpeta por proyecto (`\MapeoRiesgos`, `\EnergySystemModel`) |
| Variable group | `VG-AEU-ECP-DEV-REFESTECP` | ✅ Creado | `VG-AEU-ECP-<AMBIENTE>-<APP>` |
| Environment de Azure DevOps | `refestecp-dev` | ⚠️ Se solicita | Nombre propio, el mismo que usa `azure-pipelines.yml`. Único ejemplo del tenant: `FuncionValor-qas-AzureFunctions`. Alternativa alineada: `RefEstECP-dev-DatabricksApp` (exigiría cambiar `environment:` en el YAML) |
| Service principal para deploy | `SP-REFESTECP-DevTest` | ⚠️ Se solicita | `SP-<PROYECTO>-DevTest` (`SP-PID-DevTest`, `SP-ACHIV-DevTest`) |
| App registration Entra ID (SSO y Graph) | `AD-AEU-ECP-DEV-REFESTECP` | ⚠️ Se solicita | `AD-AEU-ECP-DEV-<PROYECTO>` (`AD-AEU-ECP-DEV-PID`, `AD-AEU-ECP-DEV-FA`) |
| Key Vault | `KV-AEU-ECP-DEV-PLANINVA` | Ya existe (sin acceso) | `KV-AEU-ECP-DEV-<NOMBRE>`; el cuaderno pide usar el del grupo de recursos, no el corporativo |
| Secret Scope hacia el Key Vault | `KV-AEU-ECP-DEV-PLANINVA` | ⚠️ Se solicita | El scope se llama como su vault |
| Databricks App | `refestecp-dev` | ✅ Creado | Las apps existentes (`wafauto-…`) no siguen patrón; minúsculas y guiones |
| Secret Scope propio de Databricks | `refestecp-dev` | ✅ Creado | Guarda el `SESSION_SECRET` de la primera prueba; **no sustituye** al scope hacia el Key Vault |
| Catálogo de Unity Catalog | `refestecp` | ⚠️ Por definir | Nombre corto en minúsculas (como `pid`). Alternativa: esquema `refestecp` dentro de `main` |
| Lakehouse en Fabric | `LKH001_REFESTECP` | ✅ Creado | Fabric solo admite letras, números y guion bajo en Lakehouses (`LKH001 - REFESTECP` no era válido). Notebooks/dataflows sí admiten `NTB001 - PIVA` |
| Proyecto de Lakebase | `refestecp-dev` | ✅ Creado | Lakebase Autoscaling usa proyectos, no instancias. Sin patrón previo (extrapolación); mismo nombre que la app |
| Rama de integración | `dev` | ✅ Creada | Convención de repos hermanos y del cuaderno. Nace del mismo commit que `develop` |
| Service connection (solo si hiciera falta) | `SC-ECP-<tipo>-HUBAnalitica-REFESTECP-DEV` | Por definir | Hoy no hace falta ninguna |

Los patrones salen de recursos reales del tenant. Donde no había ejemplo previo (Lakebase, prefijo del Lakehouse) la sugerencia es una extrapolación.

---

## 7. Solicitudes pendientes para desplegar en DEV ⚠️

Contexto: el proyecto se despliega como **una sola Databricks App** en el workspace DEV compartido. Todo se pide para recursos propios con prefijo `REFESTECP`; **no se modifica ningún recurso de otros equipos**.

| # | Qué pedir | A quién | Para qué |
|---|---|---|---|
| 1 | Access policy en `KV-AEU-ECP-DEV-PLANINVA` (Get/List de secrets) | Infraestructura (Sergio Quintana, Diego Rodríguez) | Leer y cargar secretos. El cuaderno dice que ya se otorgó admin, pero la verificación en vivo muestra que **no está aplicado**. |
| 2 | Secret Scope en Databricks hacia ese Key Vault | María Alejandra (admin Databricks) | Que la app lea `SESSION_SECRET` y demás credenciales vía el recurso `session-secret` de `app.yaml`. Mientras tanto se usa el scope propio `refestecp-dev`. |
| 3 | Service Principal `SP-REFESTECP-DevTest` con permiso para gestionar la app | Infraestructura / admin Databricks | Deploy desde el pipeline sin credenciales personales (OAuth M2M). Client ID y Secret van al VG 789 (hoy vacíos). |
| 4 | App Registration `AD-AEU-ECP-DEV-REFESTECP` (ficha en §8) | Infraestructura | SSO y consultas a Graph. Ticket pendiente. **Camino crítico del hito del 9 oct.** |
| 5 | Seis grupos de seguridad de Entra (uno por rol) asignados a la app | Infraestructura y Andrés Martínez | El BFF traduce grupos a roles en el callback; sin grupo no hay acceso. |
| 6 | `CAN USE` sobre un SQL Warehouse + permisos en Unity Catalog para el SP de la app | María Alejandra y Andrés Martínez | Que el BFF lea las series analíticas con el SP que Databricks ya entrega a la app. |
| 7 | Permiso de creador de environments en HUBAnalitica, o que un admin cree `refestecp-dev` y autorice al pipeline 4928 | Admin del proyecto (infra DevOps) | Stage de despliegue a DEV (hoy 403). |
| 8 | Build validation en la política de `dev` del repo RefEstECP con el pipeline 4928 + 1 revisor mínimo | Admin del repo | Azure Repos ignora `pr:` del YAML; sin esta política los PR no ejecutan el CI. |
| 9 | Rol de Postgres del SP en Lakebase `refestecp-dev` | ⭕ Propio (Manuel, propietario del proyecto), en cuanto exista el Client ID del SP | Que la App lea/escriba en Lakebase con su identidad. Hoy solo la identidad personal tiene acceso. |
| 10 | Acceso de Marco García a Lakebase `refestecp-dev` | ⭕ Propio; **falta el correo de Databricks de Marco** | T-003: que Marco cree el esquema de negocio con migraciones SQL del repo. |
| 11 | Confirmar nombres de carpetas `/front`, `/back`, `/data` | Andrés Martínez y Walter Valdivia | El cuaderno los fija así, pero en el repo están como `frontend/` y `backend/`. |
| 12 | Autorizar al pipeline 4928 sobre `SC-ECP-sonar-HUBAnalitica-DEV` | Dueño de la conexión / admin del proyecto | Opcional: activar SonarQube (ya está en el pipeline, apagado con `enableSonar`). No se tocó la conexión. |
| 13 | Catálogo propio, o `CREATE SCHEMA` en `main` | Andrés Martínez / admin Databricks | Crear solo el esquema del proyecto. |
| 14 | Licencias Azure DevOps Basic para el equipo | Andrés Martínez | Pendiente según el cuaderno. |
| 15 | Rol Contributor de Marco García en `WS-FB-NGOLD-PIVA` | Andrés Martínez / admin del workspace Fabric | Sprint 0 (T-003): crear y usar el Lakehouse y el modelo de datos. |
| 16 | `Read` y `ReadAll` sobre Lakehouses origen (Deuda, Reservas, Átomo, Hyperion…) | Dueños de esos Lakehouses, vía Andrés Martínez | Consultar las fuentes desde el Lakehouse del proyecto. |
| 17 | Acceso de Walter Valdivia a Databricks; acceso de Marco y Walter al Key Vault | María Alejandra (Databricks) e infraestructura (Key Vault) | El cuaderno pide rol `Secrets User`, pero el vault usa Access Policies: corresponde una access policy por persona. |

---

## 8. Ficha de la App Registration de Entra ID (camino crítico H-02 · 9 oct)

Pensada para que Sergio y Diego la creen sin volver a preguntar. «Documentado» sale de los ADR y contratos A-01, A-02 y A-04 del backend; «Propuesta» es recomendación y la decide infraestructura.

| Campo | Valor | Origen | Detalle |
|---|---|---|---|
| Nombre | `AD-AEU-ECP-DEV-REFESTECP` | Propuesta | Patrón `AD-AEU-ECP-DEV-<PROYECTO>` |
| Tipos de cuenta | Solo este directorio (tenant `a4305987-cf78-4f93-9d64-bf18af65397b`) | Propuesta | Los usuarios de VML son guests de ese tenant y deben poder iniciar sesión |
| Plataforma | Web (cliente confidencial) | Documentado | El BFF completa el login; el navegador nunca recibe tokens (ADR-0004) |
| URI de redirección | `https://refestecp-dev-6115311547056401.1.azure.databricksapps.com/api/v1/auth/callback` | Documentado | A-02: el callback lo invoca Entra ID, nunca el SPA. Ojo con el `.1.` |
| Flujo | Authorization code con PKCE (S256) | Documentado | A-01 y ADR-0004: el BFF valida state, nonce, emisor, audiencia y expiración del ID token |
| Credencial | Client secret guardado en `KV-AEU-ECP-DEV-PLANINVA`, entregado por el secret scope | Propuesta | Un certificado serviría igual. No se usa identidad administrada ni credencial federada (la app corre en Databricks Apps) |
| Permisos delegados | `openid`, `profile`, `email`, `offline_access`, `User.Read` | Propuesta | `offline_access` para el refresh token que ADR-0004 guarda cifrado en servidor; `User.Read` para perfil y foto (A-04, avatar) |
| Grupos | Claim opcional `groups` (SecurityGroup) en el ID token, limitado a grupos asignados a la app | Propuesta | Evita consentimiento de admin y el límite de 200 grupos. Alternativa: `GroupMember.Read.All` por Graph (sí exige consentimiento). Decide infraestructura |
| Grupos de seguridad | Seis: cinco roles + administrador funcional | Propuesta | `ECP_PRJ_RefEstECP_AnalystCreator`, `_ExplorerViewer`, `_ExplorerIntegral`, `_ExecutiveViewer`, `_ExecutiveIntegral`, `_Admin` |
| Usuario sin grupo | El callback responde `access_denied` y vuelve al login | Documentado | A-02: sin grupo no hay sesión |

Nota: el acceso del BFF al SQL Warehouse **no** necesita esta registración ni otro SP. Databricks Apps entrega a cada app su propio SP (`DATABRICKS_CLIENT_ID` y `DATABRICKS_CLIENT_SECRET` ya inyectados; el de `refestecp-dev` es `app-odsy4k refestecp-dev`). Solo hay que darle `CAN USE` sobre el warehouse y permisos en Unity Catalog. `SP-REFESTECP-DevTest` es únicamente para que el pipeline despliegue.

---

## 9. Mensajes listos para enviar

> ⚠️ Estos borradores se redactaron antes de algunos avances del 02 oct; ver §12 antes de reenviarlos tal cual.

### Para Andrés Martínez
Hola Andrés. Avance de RefEstECP en DEV: el pipeline de CI en Azure DevOps (HUBAnalitica-RefEstECP-CI) ya corre en verde sobre la rama dev, y creamos la Databricks App refestecp-dev (detenida, aún sin código) en dk-aeu-ecp-dev-maindatabricks con un secret scope propio. Para seguir necesitamos de ti:

1. Confirmar que nos quedamos en el workspace compartido dk-aeu-ecp-dev-maindatabricks, o si hay que tramitar uno exclusivo.
2. Un catálogo propio en Unity Catalog (refestecp) o el permiso CREATE SCHEMA en main para crear solo nuestro esquema.
3. Confirmar las carpetas del repo: el cuaderno dice /front y /back y hoy están como frontend/ y backend/.
4. Un revisor para los PR a dev y las licencias Azure DevOps Basic del equipo.
5. Opcional: autorizar al pipeline a usar la conexión SonarQube SC-ECP-sonar-HUBAnalitica-DEV.
6. Rol Contributor de Marco García en el workspace de Fabric WS-FB-NGOLD-PIVA, y permisos Read y ReadAll sobre los Lakehouses origen (Deuda, Reservas, Átomo, Hyperion). Ya creamos el Lakehouse LKH001_REFESTECP en ese workspace.

Todo lo que creamos lleva el prefijo REFESTECP y no tocamos recursos de otros equipos. Gracias.

### Para Sergio Quintana y Diego Rodríguez
Hola Sergio y Diego. Estamos montando el despliegue a DEV de RefEstECP (una Databricks App). Ya existen el pipeline HUBAnalitica-RefEstECP-CI y el variable group VG-AEU-ECP-DEV-REFESTECP, este último con las credenciales vacías. Necesitamos:

1. Access policy en el Key Vault KV-AEU-ECP-DEV-PLANINVA (Get y List de secrets) para manuel.rodriguez@vml.com. En la reunión quedó con acceso de administrador, pero hoy da 403.
2. Un service principal SP-REFESTECP-DevTest con permiso CAN_MANAGE sobre la app refestecp-dev. Con su Client ID y Secret cargamos el variable group para el deploy automático.
3. Un app registration en Entra ID, AD-AEU-ECP-DEV-REFESTECP, para el SSO del BFF. Plataforma Web, un solo directorio (los usuarios de VML son invitados), flujo authorization code con PKCE, URI de redirección https://refestecp-dev-6115311547056401.1.azure.databricksapps.com/api/v1/auth/callback (el host lleva .1.), permisos delegados openid, profile, email, offline_access y User.Read, y client secret que guardaríamos en KV-AEU-ECP-DEV-PLANINVA. Para los grupos proponemos el claim opcional groups limitado a los grupos asignados a la aplicación; si prefieren Graph con GroupMember.Read.All, díganlo. Detalle completo en la ficha adjunta.
4. Seis grupos de seguridad, uno por rol (analista creador, explorador visualizador, explorador integral, ejecutivo visualizador, ejecutivo integral y administrador funcional), asignados a la aplicación. Proponemos el patrón ECP_PRJ_RefEstECP_<Rol>.
5. Permiso de creación de environments en HUBAnalitica, o que creen refestecp-dev y autoricen al pipeline 4928. Hoy crearlo da 403.
6. En el repo RefEstECP, rama dev: política de 1 revisor mínimo (como en MapeoRiesgos) y Build validation con el pipeline 4928.

### Para María Alejandra (admin Databricks)
Hola María Alejandra. En dk-aeu-ecp-dev-maindatabricks creamos para RefEstECP la app refestecp-dev (detenida) y un secret scope propio, refestecp-dev, con el SESSION_SECRET de la primera prueba. Necesitamos de ti:

1. Un secret scope hacia el Key Vault KV-AEU-ECP-DEV-PLANINVA (RG-AEU-ECP-DEV-AnaliticaSetupIAVFV), para los secretos reales de los proveedores.
2. Dar CAN_MANAGE sobre la app refestecp-dev al service principal SP-REFESTECP-DevTest, cuando lo creen.
3. Un catálogo propio (refestecp) o CREATE SCHEMA en main.
4. Ya creamos el proyecto de Lakebase refestecp-dev. Cuando exista el service principal, necesitaremos un rol de Postgres para él en ese proyecto.
5. Confirmar el alta de Walter Valdivia en el workspace. En el Key Vault, que sigue en Access Policies, hay que agregar a Marco y a Walter con una access policy (el rol Secrets User del cuaderno no aplica a ese modelo).

---

## 10. Personas y roles

| Persona | Qué se le pide / papel según el documento |
|---|---|
| Manuel Rodríguez | Dueño de la cuenta auditada y propietario del proyecto Lakebase |
| Andrés Martínez | Catálogos, licencias, revisores, Fabric, accesos a Lakehouses origen |
| Sergio Quintana, Diego Rodríguez | Infraestructura: Key Vault, SP, App Registration, grupos, environments, políticas |
| María Alejandra | Admin de Databricks |
| Marco García | Datos: tarea T-003 (esquema de negocio, Lakehouse) |
| Walter Valdivia | Equipo; pendiente alta en Databricks y Key Vault |

---

## 11. Próximos pasos propios (⭕) en orden de dependencia
1. Cuando llegue el Client ID del SP → crear su rol de Postgres en Lakebase y cargar credenciales en el VG 789.
2. Aplicar las 3 migraciones (`0001`–`0003`) al esquema real de Lakebase.
3. Conectar la App a Lakebase y probar el intercambio OAuth M2M con el SP real.
4. Dar acceso a Marco en Lakebase (requiere su correo de Databricks).
5. Cuando exista la App Registration y los grupos → activar `loginMode=oidc` real en la App (hito H-02, 9 oct).
6. Llevar datos reales del BFF a las vistas del frontend.

---

## 12. Inconsistencias conocidas del documento original

El HTML original contiene textos desactualizados respecto del estado verificado. **Prevalece el estado de §3 y §4**:

- El borrador para Andrés (§9) dice que la App está «detenida, aún sin código». **Real:** la App fue desplegada en modo mock y verificada (health 200, run 394913); está detenida para no generar costo.
- Un párrafo del original afirma «Falta por crear: … la Databricks App `refestecp-dev` y el Lakehouse en `WS-FB-NGOLD-PIVA`». **Real:** ambos ya están creados (§4.1 y §4.2). Lo único que sigue faltando de esa lista es el environment `refestecp-dev`.
- Permiso `Administer = True` vs `Create = False` en Environments: señal contradictoria de Azure DevOps, pendiente de revisar en Environments › Security.
- El cuaderno de refinamiento indica acceso de administrador al Key Vault; la verificación en vivo da 403. Prevalece la verificación.

---
*Fuente: `recursos.html` (Eco-Comparador · auditoría de accesos), generado a partir de llamadas en vivo a las APIs de Fabric, Databricks y Azure DevOps el 02 oct 2026.*
