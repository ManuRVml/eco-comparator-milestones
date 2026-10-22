# data-testid convention and inventory

## Convention

- Format: `<area>-<element>[-<stable-id>]`, kebab-case. `<area>` is the view or component (`milestone`, `pendiente`, `capability`, `delivery`, `roadmap`, ...).
- `<stable-id>` comes from a domain id (milestone, HU, task, risk, area, capability, pendiente), never from an array index.
- Do not rename an existing testid; add a new one instead.
- `data-state` carries a status or visibility value that the element displays (for example `estadoFinal`, `estado`, `interno`). Only set it where the UI already shows that status.
- Interactive elements (links, buttons, form controls, expandable summaries) and landmarks (sections, lists, tables, alerts) carry a testid.

## Inventory

Generated from `git grep -n 'data-testid' -- app/src`. The data-testid column is the attribute value as written in the source (template expressions are kept). `data-state` values are the ones set on the same line.

| View / file | file:line | data-testid | data-state (same line) |
|---|---|---|---|
| app/src/app/(protected)/agenda/page.tsx | app/src/app/(protected)/agenda/page.tsx:18 | `"agenda"` | `—` |
| app/src/app/(protected)/agenda/page.tsx | app/src/app/(protected)/agenda/page.tsx:54 | `{`agenda-${f}` | `—` |
| app/src/app/(protected)/areas/page.tsx | app/src/app/(protected)/areas/page.tsx:24 | `"areas"` | `—` |
| app/src/app/(protected)/bitacora/page.tsx | app/src/app/(protected)/bitacora/page.tsx:45 | `"bitacora"` | `—` |
| app/src/app/(protected)/bitacora/page.tsx | app/src/app/(protected)/bitacora/page.tsx:62 | `"log-table"` | `—` |
| app/src/app/(protected)/bitacora/page.tsx | app/src/app/(protected)/bitacora/page.tsx:77 | `{`log-${r.id}` | `—` |
| app/src/app/(protected)/editor/page.tsx | app/src/app/(protected)/editor/page.tsx:66 | `"editor"` | `—` |
| app/src/app/(protected)/editor/page.tsx | app/src/app/(protected)/editor/page.tsx:132 | `{`editor-filter-${m.id}` | `—` |
| app/src/app/(protected)/editor/page.tsx | app/src/app/(protected)/editor/page.tsx:148 | `"editor-tareas"` | `—` |
| app/src/app/(protected)/editor/page.tsx | app/src/app/(protected)/editor/page.tsx:162 | `{`row-${t.id}` | `—` |
| app/src/app/(protected)/flujo/page.tsx | app/src/app/(protected)/flujo/page.tsx:22 | `"flujo"` | `—` |
| app/src/app/(protected)/flujo/page.tsx | app/src/app/(protected)/flujo/page.tsx:44 | `{`flow-task-${t.id}` | `—` |
| app/src/app/(protected)/historias/[id]/page.tsx | app/src/app/(protected)/historias/[id]/page.tsx:65 | `"historia"` | `—` |
| app/src/app/(protected)/layout.tsx | app/src/app/(protected)/layout.tsx:34 | `"header-role-badge"` | `—` |
| app/src/app/(protected)/lineas/page.tsx | app/src/app/(protected)/lineas/page.tsx:41 | `"timeline"` | `—` |
| app/src/app/(protected)/lineas/page.tsx | app/src/app/(protected)/lineas/page.tsx:165 | `{`lineas-row-${m.id}` | `{m.estadoFinal}` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:50 | `"milestone"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:55 | `"milestone-back-link"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:59 | `"milestone-hero"` | `{m.estadoFinal}` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:69 | `"milestone-title"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:70 | `"milestone-compliance"` | `{m.cierreVerificado ? "confirmado" : "pendiente"}` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:71 | `"milestone-meta"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:88 | `"milestone-hu-link"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:102 | `{`milestone-epica-link-${code}` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:112 | `"milestone-gauge"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:158 | `"milestone-config-link"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:162 | `"milestone-critical-alert"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:167 | `{`milestone-critical-task-${t}` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:176 | `"next-milestone"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:186 | `"milestone-delivered"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:201 | `"milestone-detail"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:203 | `"milestone-tabs"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:204 | `"milestone-tab-area"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:208 | `"milestone-tab-hu"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:214 | `"milestone-branches"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:219 | `{`milestone-area-${a.areaId}` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:220 | `{`milestone-area-toggle-${a.areaId}` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:292 | `"risk-list"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:297 | `{`milestone-risk-${r.id}` | `{r.interno ? "interno" : "visible"}` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:345 | `{`milestone-dep-${d}` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:371 | `{`milestone-hu-${h.id}` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:372 | `{`milestone-hu-toggle-${h.id}` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:423 | `"milestone-hu-list"` | `—` |
| app/src/app/(protected)/milestones/[id]/page.tsx | app/src/app/(protected)/milestones/[id]/page.tsx:428 | `{`milestone-epica-${code}` | `—` |
| app/src/app/(protected)/page.tsx | app/src/app/(protected)/page.tsx:40 | `"dashboard"` | `—` |
| app/src/app/(protected)/page.tsx | app/src/app/(protected)/page.tsx:48 | `"hero-titulo"` | `—` |
| app/src/app/(protected)/page.tsx | app/src/app/(protected)/page.tsx:52 | `"hero-stats"` | `—` |
| app/src/app/(protected)/page.tsx | app/src/app/(protected)/page.tsx:84 | `"avance-tecnico"` | `—` |
| app/src/app/(protected)/page.tsx | app/src/app/(protected)/page.tsx:145 | `"kpi-r2"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:28 | `"pendientes"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:35 | `"pendientes-form"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:40 | `"pendientes-field-titulo"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:44 | `"pendientes-field-lado"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:51 | `"pendientes-field-tipo"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:57 | `"pendientes-field-responsable"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:61 | `"pendientes-field-fecha"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:65 | `"pendientes-field-milestone"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:72 | `"pendientes-field-detalle"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:74 | `"pendientes-create-submit"` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:97 | `{`pendientes-table-${seccion}` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:99 | `{`pendientes-table-head-${seccion}` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:111 | `{`pendiente-row-${item.id}` | `{item.estado}` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:122 | `{`pendiente-milestone-link-${item.id}` | `—` |
| app/src/app/(protected)/pendientes/page.tsx | app/src/app/(protected)/pendientes/page.tsx:127 | `{`pendiente-resolve-${item.id}` | `—` |
| app/src/app/(protected)/reconciliacion/page.tsx | app/src/app/(protected)/reconciliacion/page.tsx:27 | `"reconciliacion"` | `—` |
| app/src/app/(protected)/tareas/[id]/page.tsx | app/src/app/(protected)/tareas/[id]/page.tsx:34 | `"tarea"` | `—` |
| app/src/app/(protected)/verificacion/page.tsx | app/src/app/(protected)/verificacion/page.tsx:31 | `{`verif-${t.id}` | `—` |
| app/src/app/(protected)/verificacion/page.tsx | app/src/app/(protected)/verificacion/page.tsx:57 | `"verificacion"` | `—` |
| app/src/app/(protected)/verificacion/page.tsx | app/src/app/(protected)/verificacion/page.tsx:82 | `"verif-pendientes"` | `—` |
| app/src/app/(protected)/verificacion/page.tsx | app/src/app/(protected)/verificacion/page.tsx:100 | `"verif-publicadas"` | `—` |
| app/src/app/login/login-form.tsx | app/src/app/login/login-form.tsx:49 | `"login-form"` | `—` |
| app/src/app/login/login-form.tsx | app/src/app/login/login-form.tsx:63 | `"login-error"` | `—` |
| app/src/app/login/login-form.tsx | app/src/app/login/login-form.tsx:70 | `"login-attempts"` | `—` |
| app/src/app/login/login-form.tsx | app/src/app/login/login-form.tsx:87 | `"login-pin"` | `—` |
| app/src/app/login/login-form.tsx | app/src/app/login/login-form.tsx:101 | `"login-pin-toggle"` | `—` |
| app/src/app/login/login-form.tsx | app/src/app/login/login-form.tsx:117 | `"login-submit"` | `—` |
| app/src/app/login/page.tsx | app/src/app/login/page.tsx:30 | `"login-page"` | `—` |
| app/src/components/capability-cards.tsx | app/src/components/capability-cards.tsx:18 | `"capability-cards"` | `—` |
| app/src/components/capability-cards.tsx | app/src/components/capability-cards.tsx:20 | `{`capability-card-${c.id}` | `{c.estado}` |
| app/src/components/capability-cards.tsx | app/src/components/capability-cards.tsx:22 | `{`capability-title-${c.id}` | `—` |
| app/src/components/capability-cards.tsx | app/src/components/capability-cards.tsx:25 | `{`capability-desc-${c.id}` | `—` |
| app/src/components/capability-cards.tsx | app/src/components/capability-cards.tsx:31 | `"capability-detail-link"` | `—` |
| app/src/components/checkpoint-progress.tsx | app/src/components/checkpoint-progress.tsx:7 | `"checkpoint-progress"` | `—` |
| app/src/components/checkpoint-progress.tsx | app/src/components/checkpoint-progress.tsx:17 | `{`contribution-${a.areaId}` | `—` |
| app/src/components/checkpoint-progress.tsx | app/src/components/checkpoint-progress.tsx:24 | `"contribution-total"` | `—` |
| app/src/components/completion-check.tsx | app/src/components/completion-check.tsx:3 | `{`check-${id}` | `—` |
| app/src/components/delivery-note.tsx | app/src/components/delivery-note.tsx:4 | `"delivery-note"` | `—` |
| app/src/components/delivery-note.tsx | app/src/components/delivery-note.tsx:5 | `"delivery-note-details"` | `—` |
| app/src/components/delivery-note.tsx | app/src/components/delivery-note.tsx:9 | `"delivery-note-glossary"` | `—` |
| app/src/components/delivery-note.tsx | app/src/components/delivery-note.tsx:11 | `{`delivery-glossary-${slug}` | `—` |
| app/src/components/editor/config-toggle.tsx | app/src/components/editor/config-toggle.tsx:22 | `{`config-${clave}` | `—` |
| app/src/components/editor/estado-control.tsx | app/src/components/editor/estado-control.tsx:37 | `{`estado-${id}` | `—` |
| app/src/components/editor/milestone-configuration.tsx | app/src/components/editor/milestone-configuration.tsx:10 | `"admin-milestone-configuration"` | `—` |
| app/src/components/editor/milestone-contract-editor.tsx | app/src/components/editor/milestone-contract-editor.tsx:43 | `"contract-editor"` | `—` |
| app/src/components/editor/nota-form.tsx | app/src/components/editor/nota-form.tsx:20 | `"nota-form"` | `—` |
| app/src/components/editor/publicar-control.tsx | app/src/components/editor/publicar-control.tsx:36 | `{`pub-${id}` | `—` |
| app/src/components/editor/publicar-control.tsx | app/src/components/editor/publicar-control.tsx:49 | `{`pub-${id}` | `—` |
| app/src/components/editor/publicar-control.tsx | app/src/components/editor/publicar-control.tsx:56 | `{`pub-${id}` | `—` |
| app/src/components/editor/visibilidad-toggle.tsx | app/src/components/editor/visibilidad-toggle.tsx:27 | `{`vis-${tipo}` | `—` |
| app/src/components/glossary-button.tsx | app/src/components/glossary-button.tsx:15 | `"header-glossary-button"` | `—` |
| app/src/components/glossary-button.tsx | app/src/components/glossary-button.tsx:24 | `"glossary-dialog"` | `—` |
| app/src/components/glossary-button.tsx | app/src/components/glossary-button.tsx:40 | `{`glossary-term-${slug}` | `—` |
| app/src/components/info-toolbar.tsx | app/src/components/info-toolbar.tsx:39 | `"info-toolbar"` | `—` |
| app/src/components/metric-note.tsx | app/src/components/metric-note.tsx:6 | `"metric-note"` | `—` |
| app/src/components/milestone-delivery.tsx | app/src/components/milestone-delivery.tsx:13 | `{`needs-${m.id}` | `—` |
| app/src/components/milestone-delivery.tsx | app/src/components/milestone-delivery.tsx:28 | `{`riesgos-${m.id}` | `—` |
| app/src/components/milestone-delivery.tsx | app/src/components/milestone-delivery.tsx:29 | `{`riesgos-${m.id}` | `—` |
| app/src/components/milestone-delivery.tsx | app/src/components/milestone-delivery.tsx:45 | `{`valor-${m.id}` | `—` |
| app/src/components/milestone-delivery.tsx | app/src/components/milestone-delivery.tsx:65 | `{`delivery-${m.id}` | `—` |
| app/src/components/milestone-delivery.tsx | app/src/components/milestone-delivery.tsx:77 | `{`criterion-${c.id}` | `—` |
| app/src/components/milestone-overview.tsx | app/src/components/milestone-overview.tsx:10 | `"milestone-overview"` | `—` |
| app/src/components/milestone-overview.tsx | app/src/components/milestone-overview.tsx:11 | `"hitos-resumen"` | `—` |
| app/src/components/milestone-overview.tsx | app/src/components/milestone-overview.tsx:17 | `"milestone-overview"` | `—` |
| app/src/components/milestone-overview.tsx | app/src/components/milestone-overview.tsx:21 | `"next-milestone"` | `—` |
| app/src/components/milestone-panel/panel-client.tsx | app/src/components/milestone-panel/panel-client.tsx:53 | `"slot-${lineaDe[sel]}` | `—` |
| app/src/components/milestone-panel/panel-client.tsx | app/src/components/milestone-panel/panel-client.tsx:115 | `{`node-${id}` | `—` |
| app/src/components/milestone-panel/panel-client.tsx | app/src/components/milestone-panel/panel-client.tsx:163 | `{`slot-${lineaId}` | `—` |
| app/src/components/milestone-panel/panel.tsx | app/src/components/milestone-panel/panel.tsx:35 | `{`ms-panel-${m.id}` | `—` |
| app/src/components/milestone-panel/panel.tsx | app/src/components/milestone-panel/panel.tsx:89 | `{`entregado-${m.id}` | `—` |
| app/src/components/milestone-status.tsx | app/src/components/milestone-status.tsx:69 | `` | `—` |
| app/src/components/notas.tsx | app/src/components/notas.tsx:26 | `"nota-list"` | `—` |
| app/src/components/roadmap.tsx | app/src/components/roadmap.tsx:101 | `"roadmap"` | `—` |
| app/src/components/roadmap.tsx | app/src/components/roadmap.tsx:184 | `{`roadmap-lane-${l.id}` | `{proximo?.estadoFinal ?? "Cumplido"}` |
| app/src/components/roadmap.tsx | app/src/components/roadmap.tsx:217 | `{`roadmap-node-${n.m.id}` | `{n.m.estadoFinal}` |
| app/src/components/sidebar.tsx | app/src/components/sidebar.tsx:126 | `"app-title"` | `—` |
| app/src/components/sprint-checkpoint-panel.tsx | app/src/components/sprint-checkpoint-panel.tsx:20 | `{`ms-panel-${id}` | `—` |
| app/src/components/sprint-checkpoint-panel.tsx | app/src/components/sprint-checkpoint-panel.tsx:34 | `{`expected-${id}` | `—` |
| app/src/components/sprint-checkpoint-panel.tsx | app/src/components/sprint-checkpoint-panel.tsx:40 | `{`enables-${id}` | `—` |
| app/src/components/sprint-reviews.tsx | app/src/components/sprint-reviews.tsx:12 | `"sprint-reviews"` | `—` |
| app/src/components/tarea-row.tsx | app/src/components/tarea-row.tsx:15 | `{`tarea-${t.id}` | `—` |
| app/src/components/workflow/milestone-panel.tsx | app/src/components/workflow/milestone-panel.tsx:15 | `{`workflow-${id}` | `—` |

## Data-state values

| data-testid (pattern) | Values |
|---|---|
| `milestone-hero`, `milestone-status-<id>`, `lineas-row-<id>`, `roadmap-node-<id>` | estadoFinal: Cumplido, En curso, En riesgo, Atrasado, Pendiente |
| `roadmap-lane-<linea>` | estadoFinal of the next milestone, or Cumplido |
| `milestone-compliance` | confirmado, pendiente |
| `milestone-delivered` | entregado |
| `milestone-risk-<id>` | interno, visible |
| `pendiente-row-<id>` | abierto, resuelto |
| `capability-card-<id>` | pendiente, en curso, entregada |
| `data-state` on the element at `editor/page.tsx:133` (no testid) | active, inactive |
