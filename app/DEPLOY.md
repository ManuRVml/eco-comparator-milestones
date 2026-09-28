# Despliegue — Seguimiento BenchHub · MVP Ecopetrol

Guía para publicar la app en **Vercel** (equipo `manuel-d958`) con la base de datos en el **servidor libSQL (sqld)
de Fusion**. Solo placeholders: ningún secreto va en este archivo ni en git.

> En Vercel el disco es de solo lectura y efímero: la base SQLite local (`file:./data/seguimiento.db`) no sirve en
> producción. La app usa `@libsql/client` contra el sqld remoto (mismo dialecto y esquema SQLite).

## 1. Base de datos: sqld en Fusion

| Dato | Valor |
| --- | --- |
| App en Fusion | `benchhub-seguimiento-libsql` |
| Proyecto / entorno | «BenchHub Seguimiento» · **PROD** |
| URL pública | `libsql://<servidor-libsql>` (HTTPS detrás de Cloudflare; el cliente habla hrana sobre HTTP) |
| Volumen de datos | `/var/lib/sqld` |
| Autenticación | JWT **EdDSA (Ed25519)**; la clave pública va en la variable `SQLD_AUTH_JWT_KEY` de la app en Fusion |
| Token de acceso | `%USERPROFILE%\.secrets\benchhub-seguimiento\DATABASE_AUTH_TOKEN.txt` |
| Clave privada | `%USERPROFILE%\.secrets\benchhub-seguimiento\` (**nunca** en git ni en el repo) |

Comprobación rápida (debe dar 401 sin token y 200 con token):

```powershell
$u = "https://<servidor-libsql>/v2/pipeline"
$body = '{"requests":[{"type":"execute","stmt":{"sql":"select sqlite_version()"}},{"type":"close"}]}'
curl.exe -s -o NUL -w "%{http_code}`n" -X POST $u -H "Content-Type: application/json" -d $body
$t = (Get-Content "$env:USERPROFILE\.secrets\benchhub-seguimiento\DATABASE_AUTH_TOKEN.txt" -Raw).Trim()
curl.exe -s -o NUL -w "%{http_code}`n" -X POST $u -H "Content-Type: application/json" -H "Authorization: Bearer $t" -d $body
```

### Rotación de la clave JWT

1. Generar un nuevo par Ed25519 en `%USERPROFILE%\.secrets\benchhub-seguimiento\` (fuera del repo):
   ```powershell
   cd "$env:USERPROFILE\.secrets\benchhub-seguimiento"
   node -e "const {generateKeyPairSync}=require('crypto');const {publicKey,privateKey}=generateKeyPairSync('ed25519');require('fs').writeFileSync('jwt-private.pem',privateKey.export({type:'pkcs8',format:'pem'}));require('fs').writeFileSync('jwt-public.pem',publicKey.export({type:'spki',format:'pem'}));console.log(publicKey.export({format:'jwk'}).x)"
   ```
   La última línea es la clave pública en base64url (32 bytes crudos); `jwt-public.pem` es la misma en PEM.
2. Actualizar `SQLD_AUTH_JWT_KEY` en la app `benchhub-seguimiento-libsql` de Fusion con la clave pública
   (mismo formato que el valor actual) y **redesplegar** la app (en Fusion los cambios de variables no aplican hasta redesplegar).
3. Emitir un token nuevo firmado con la clave privada y guardarlo en `DATABASE_AUTH_TOKEN.txt`:
   ```powershell
   node --input-type=module -e "import {SignJWT,importPKCS8} from 'jose';import fs from 'fs';const k=await importPKCS8(fs.readFileSync('jwt-private.pem','utf8'),'EdDSA');const t=await new SignJWT({}).setProtectedHeader({alg:'EdDSA',typ:'JWT'}).setIssuedAt().sign(k);fs.writeFileSync('DATABASE_AUTH_TOKEN.txt',t)"
   ```
   (ejecutar desde la carpeta de la app para que resuelva `jose`, o instalarlo aparte). Agregar `.setExpirationTime('180d')` si se quiere caducidad.
4. Actualizar `DATABASE_AUTH_TOKEN` en Vercel (production y preview) y redesplegar. Verificar con la comprobación de arriba.
5. Borrar de forma segura el par anterior cuando todo funcione.

## 2. Cargar la base remota (`db:bootstrap`)

Desde la máquina del dueño (los Excel/CSV solo se usan aquí, nunca en runtime):

```powershell
cd D:\Personal\Eco-Comparador\Milestones\seguimiento-app
$env:DATABASE_URL = "libsql://<servidor-libsql>"
$env:DATABASE_AUTH_TOKEN_FILE = "$env:USERPROFILE\.secrets\benchhub-seguimiento\DATABASE_AUTH_TOKEN.txt"
pnpm run db:bootstrap
```

Aplica las migraciones, importa el plan, los milestones, el avance y la agenda, fija los estados técnicos desde la
matriz de evidencia y deja **0 publicaciones** (el avance oficial arranca en 0/99). Es idempotente y no destructivo
(UPSERT por id; nunca borra estados, notas ni bitácora). Al final imprime los conteos esperados:
7 sprints · 4 festivos · 65 HU · 99 tareas · 10 milestones · 3 líneas · 60 HU en milestones · 0 publicadas.

## 3. Variables de entorno en Vercel

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | `libsql://<servidor-libsql>` |
| `DATABASE_AUTH_TOKEN` | contenido de `DATABASE_AUTH_TOKEN.txt` |
| `SESSION_SECRET` | ≥ 32 caracteres aleatorios, distinto por entorno |
| `PIN_ECOPETROL` | PIN del rol de consulta «Equipo Ecopetrol» (≥ 6 caracteres; alias de `PIN_CLIENTE`) |
| `PIN_EDITOR` | PIN del editor (≥ 6 caracteres, distinto) |
| `PIN_ADMIN` | PIN del administrador (≥ 6 caracteres, distinto) |
| `APP_HOY` | opcional: fija «hoy» para demos (yyyy-mm-dd) |

La app **se niega a construir en Vercel y a arrancar** si falta alguna, si los PIN son 1111/2222/3333, si el
`SESSION_SECRET` es el de ejemplo o si `DATABASE_URL` es `file:` (ver `src/lib/env-check.ts`).

## 4. Comandos de Vercel

```powershell
npm i -g vercel
vercel login
vercel link --scope manuel-d958          # crea/vincula el proyecto (p. ej. «benchhub-seguimiento»)

# Para cada variable, en production y en preview (pide el valor de forma interactiva):
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_AUTH_TOKEN production
vercel env add DATABASE_AUTH_TOKEN preview
vercel env add SESSION_SECRET production
vercel env add SESSION_SECRET preview
vercel env add PIN_ECOPETROL production
vercel env add PIN_ECOPETROL preview
vercel env add PIN_EDITOR production
vercel env add PIN_EDITOR preview
vercel env add PIN_ADMIN production
vercel env add PIN_ADMIN preview

vercel deploy                             # despliegue de preview → imprime una URL *.vercel.app
```

### Prueba de humo (sobre la URL de preview)

1. `GET /robots.txt` → `Disallow: /`; `curl -I <url>/login` muestra `X-Robots-Tag: noindex, nofollow, noarchive`.
2. PIN incorrecto → «PIN incorrecto» (con espera); 5 fallos seguidos → «Demasiados intentos».
3. Entrar con el PIN de Equipo Ecopetrol → Resumen «0 de 99 tareas entregadas al equipo Ecopetrol»; clic en M01 abre
   el panel de solo lectura; `/editor` muestra «Solo lectura».
4. Entrar como editor → «Aprobar y publicar» una tarea Hecha con nota y fecha → en otra ventana, el Equipo Ecopetrol la
   ve en segundos; retirarla como administrador → deja de verla. Revisar la bitácora.
5. Verificar en DevTools que la cookie `seg_session` es `HttpOnly`, `Secure` y `SameSite=Lax`.

Si todo está bien:

```powershell
vercel deploy --prod
```

### Rollback

```powershell
vercel ls                                 # lista despliegues
vercel rollback                           # vuelve al despliegue de producción anterior
vercel promote <url-de-un-despliegue-bueno>
```

La base no se revierte con el rollback: sus cambios quedan en la bitácora y se corrigen desde la app.

### Alternativa: repositorio de GitHub conectado

En vercel.com → *Add New… → Project* → importar el repositorio (equipo `manuel-d958`), framework **Next.js**,
comando de build `pnpm build`, y cargar las mismas variables en *Settings → Environment Variables* (Production y
Preview). Cada push crea un preview y cada merge a la rama de producción despliega. `.vercelignore` excluye `data/`,
bases `.db`, capturas y scripts.

## 5. Re-importar más adelante (administrador)

Cuando cambie el Excel del plan o los milestones, desde la máquina del dueño y con las mismas variables de la sección 2:

```powershell
pnpm run import -- "..\working_plan_BenchHub_v2 2 EQUIPO.xlsx"
pnpm run import:milestones
pnpm run import:progress
```

o simplemente `pnpm run db:bootstrap` (repite todo de forma idempotente). Nunca se pisan los estados, notas,
publicaciones ni la bitácora registrados en la app; los ids que falten en el archivo se reportan como conflictos.

## 6. Notas de seguridad

- Cookie de sesión `HttpOnly`, `Secure` en producción y `SameSite=Lax`, firmada con `SESSION_SECRET` (12 h).
- Intentos de PIN fallidos: espera de ~0,8 s y bloqueo de 10 min tras 5 fallos por IP (memoria por instancia).
- `X-Robots-Tag: noindex` en todas las rutas y `robots.txt` que prohíbe todo: app privada del proyecto.
- Los PIN y secretos solo existen en variables de entorno del servidor; no aparecen en `.next/static`.