# Guía: Qué es un Milestone (Hito) y cómo escribirlo

## 1. Definición

Un **milestone** es un punto de control en el tiempo que marca que se logró algo significativo en el proyecto. No representa trabajo por hacer, sino el momento en que se puede afirmar con evidencia que un resultado ya existe.

> Las tareas, historias y épicas son el camino; el milestone es la señal en ese camino que confirma que llegaste a cierto punto.

### Características

| Característica | Descripción |
|---|---|
| **Duración cero** | Es un instante, no un periodo. En un Gantt se dibuja como un rombo, no como una barra. |
| **Binario** | Se cumplió o no se cumplió. No existe "al 70%". |
| **Verificable** | Hay evidencia objetiva que lo demuestra (ambiente arriba, acta firmada, dashboard publicado). |
| **Fechado** | Tiene una fecha objetivo comprometida. |
| **Orientado a resultado** | Describe un estado alcanzado, no una actividad. |

---

## 2. Qué NO es un milestone

| Concepto | Diferencia con el milestone |
|---|---|
| **Tarea / Historia de usuario** | Es trabajo con esfuerzo y duración. El milestone es el resultado de muchas de ellas. |
| **Épica** | Es un contenedor de trabajo. El milestone puede marcar que una o varias épicas están terminadas. |
| **Sprint** | Es un periodo de tiempo fijo. Un milestone puede caer dentro de un sprint o abarcar varios. |
| **Sprint Goal** | Es el objetivo de un solo sprint. El milestone suele ser de mayor nivel (roadmap / release). |
| **Entregable** | Es el artefacto (documento, módulo). El milestone es el momento en que ese entregable queda aceptado. |

---

## 3. Dónde encaja en ágil

Scrum no define milestones formalmente, pero en la práctica se usan mucho, sobre todo en proyectos con cliente y contrato:

- **Roadmap del producto:** hitos trimestrales o por fase (Ola 1, Ola 2…).
- **Releases:** "MVP en producción", "Release 1.0 liberado".
- **Gobierno con el cliente:** hitos de facturación, aceptación y comités.
- **Herramientas:**
  - Azure DevOps → Iterations o Tags
  - Jira → *Fix Version* / *Release*
  - GitHub / GitLab → objeto *Milestone*

> **Regla en ágil:** el milestone debe reflejar **valor entregado y validado**, no solo "se terminó de programar".

---

## 4. Tipos comunes

1. **De inicio / arranque:** kickoff realizado, accesos y ambientes habilitados.
2. **Técnicos:** arquitectura aprobada, pipeline CI/CD operativo, integración con sistema externo funcionando.
3. **De entrega de valor:** MVP en producción, módulo X disponible para usuarios.
4. **De validación / aceptación:** UAT aprobada, pruebas de seguridad superadas.
5. **De gobierno / contrato:** acta de entrega firmada, hito de facturación.
6. **De cierre:** transferencia de conocimiento completada, soporte de estabilización finalizado.

---

## 5. Cómo se escribe

### 5.1 El nombre: sustantivo + participio (estado logrado)

El nombre debe describir un **estado ya alcanzado**, no una acción.

| ❌ Mal (actividad) | ✅ Bien (resultado) |
|---|---|
| Desarrollar el módulo de reportes | Módulo de reportes disponible en QA |
| Hacer pruebas | UAT aprobada por el negocio |
| Configurar Databricks | Workspace de Databricks productivo habilitado |
| Avanzar con la integración | Integración con SAP validada end-to-end |
| Sprint 4 | MVP del comparador liberado a usuarios piloto |

> **Truco:** si el nombre empieza con un verbo en infinitivo (desarrollar, hacer, configurar), casi siempre está mal escrito.

### 5.2 Ficha completa del milestone

| Campo | Qué poner |
|---|---|
| **ID** | Código corto: M1, M2… |
| **Nombre** | Estado logrado (regla 5.1). |
| **Fecha objetivo** | Fecha concreta, no "a finales de mes". |
| **Job relacionado (JTBD)** | Job o etapa del job que este milestone deja resuelto (ver sección 8). |
| **Outcome que habilita** | Métrica del usuario que se cumple con este hito. |
| **Objetivo / valor** | Por qué importa y qué habilita para el negocio o el proyecto. |
| **Criterios de cumplimiento** | Lista verificable de qué debe ser verdad para darlo por cumplido. **Es lo más importante.** |
| **Evidencia** | Cómo se demuestra: URL, acta, reporte, demo, correo de aprobación. |
| **Alcance incluido** | Épicas / features / historias que lo componen. |
| **Fuera de alcance** | Lo que explícitamente no entra. Evita discusiones con el cliente. |
| **Responsable** | Quién responde por el hito (nombre concreto). |
| **Aprobador** | Quién lo declara cumplido (normalmente cliente o PO). |
| **Dependencias** | Qué se necesita de terceros (accesos, datos, definiciones). |
| **Riesgos** | Qué podría impedir cumplirlo. |
| **Estado** | Pendiente / En riesgo / Cumplido / No cumplido. |

### 5.3 Criterios de cumplimiento

Deben ser tan objetivos que dos personas distintas lleguen a la misma conclusión. Aplicar **SMART**: Específico, Medible, Alcanzable, Relevante y con Tiempo.

- ❌ "El sistema funciona bien."
- ✅ "Los 5 indicadores financieros definidos (EBITDA, margen neto, ROACE, deuda/EBITDA y flujo de caja libre) se calculan en el ambiente QA y coinciden con el cálculo de referencia del área financiera con una diferencia menor al 0,5%."

---

## 6. Ejemplo completo

### M3 – MVP del Comparador Financiero disponible para usuarios piloto

- **Job relacionado (JTBD):** JTBD-01 Preparar comparación para comité financiero (etapa: comparar y concluir)
- **Outcome que habilita:** Reducir el tiempo de preparación de 3 días a ≤ 1 hora
- **Fecha objetivo:** 14 de noviembre de 2026
- **Objetivo / valor:** Permitir que el equipo financiero compare indicadores de la compañía contra pares del sector y valide la utilidad de la herramienta antes de escalarla.
- **Criterios de cumplimiento:**
  1. La aplicación Streamlit está desplegada en el ambiente QA con acceso por Entra ID.
  2. Se cargan datos de al menos 5 compañías pares de los últimos 3 años.
  3. Los 5 indicadores definidos se calculan y cuadran con el archivo de referencia del cliente (diferencia < 0,5%).
  4. Se realizó demo al negocio y 3 usuarios piloto ingresaron sin errores.
  5. No hay bugs críticos ni altos abiertos.
- **Evidencia:** URL de QA, acta de la demo, reporte de cuadre de indicadores.
- **Alcance:** EP-01 (Ingesta), EP-02 (Cálculo de indicadores), EP-03 (Visualización).
- **Fuera de alcance:** Exportación a PDF, alertas automáticas, ambiente productivo.
- **Responsable:** Líder técnico VML.
- **Aprobador:** Product Owner del cliente.
- **Dependencias:** Definición final de la fórmula de ROACE; accesos a las fuentes de datos.
- **Riesgos:** Retraso en la definición de ROACE, que bloquea el criterio 3.
- **Estado:** Pendiente.

---

## 7. Errores comunes

1. **Poner milestones en cada sprint.** Pierden valor. Lo normal son entre 4 y 8 hitos para un proyecto de varios meses.
2. **Confundir "desarrollado" con "cumplido".** Si el cliente no lo ha validado, normalmente no es un hito.
3. **Criterios subjetivos** como "estable", "rápido" o "completo".
4. **No definir quién lo aprueba.** Así nadie puede declararlo cumplido.
5. **Moverlo de fecha en silencio.** Si se corre, se replanifica y se comunica con la causa.
6. **No incluir lo que queda fuera de alcance.** Es la causa número uno de discusiones al cierre.

---

## 8. Enlace con Jobs to Be Done (JTBD)

### 8.1 Idea central

- El **JTBD** dice **para qué** contrata el usuario el producto: el progreso que quiere lograr en una situación concreta.
- El **milestone** dice **cuándo y con qué evidencia** ese progreso ya es posible.

> Un buen milestone marca el momento en que **un job (o una etapa de él) queda resuelto para el usuario real**, no solo cuando el software está construido.

### 8.2 Repaso: cómo se escribe un job

Formato *job story*:

> **Cuando** [situación], **quiero** [motivación], **para** [resultado esperado].

Ejemplo:

> **Cuando** preparo el comité financiero trimestral, **quiero** comparar los indicadores de la compañía contra los pares del sector, **para** justificar decisiones de inversión sin armar el análisis a mano en Excel.

Cada job tiene **desired outcomes**: las métricas con las que el usuario juzga si el job quedó bien hecho (por ejemplo, "reducir de 3 días a 1 hora el tiempo de armar la comparación").

### 8.3 Cadena de trazabilidad

```
Job principal (JTBD)
 └── Desired outcomes (métricas del usuario)
      └── Épicas / features (cómo lo resolvemos)
           └── Historias de usuario (trabajo)
                └── MILESTONE = punto en que un outcome se cumple y se valida
```

Las historias y épicas bajan hacia el trabajo; el milestone sube de vuelta y confirma que el job está resuelto.

### 8.4 Cómo enlazarlos en la práctica

1. **Descomponer el job en etapas** (*job map*): definir, reunir insumos, preparar, ejecutar, verificar, concluir/comunicar. Cada etapa crítica es candidata a milestone.
2. **Un milestone por outcome relevante, no por feature.**

   | ❌ Orientado a feature | ✅ Orientado al job |
   |---|---|
   | Pipeline de ingesta en Databricks terminado | Analista obtiene datos de pares actualizados sin solicitarlos manualmente |
   | Dashboard de Streamlit desplegado | Analista arma la comparación del comité en menos de 1 hora |

3. **Los criterios de cumplimiento salen de los desired outcomes**, por ejemplo:
   - Tiempo para preparar la comparación ≤ 1 hora (antes 3 días).
   - 0 cálculos manuales en Excel.
   - Diferencia < 0,5% frente al cálculo de referencia.
4. **La evidencia la da el usuario:** demo con usuarios piloto haciendo el job o un comité real preparado con la herramienta, no solo un despliegue.
5. **Agregar el enlace explícito en la ficha:**

   ```markdown
   - **Job relacionado:** JTBD-01 Preparar comparación para comité financiero
   - **Outcome que habilita:** Reducir tiempo de preparación de 3 días a ≤ 1 hora
   ```

### 8.5 Ejemplo de mapa Job → Milestones

**JTBD-01:** Cuando preparo el comité financiero, quiero comparar indicadores contra pares, para justificar decisiones de inversión con datos confiables.

| Etapa del job | Desired outcome | Milestone |
|---|---|---|
| Reunir insumos | Minimizar el tiempo de conseguir datos de pares | **M1** – Datos de 5 pares disponibles automáticamente en la plataforma |
| Ejecutar análisis | Minimizar errores de cálculo | **M2** – Indicadores calculados y cuadrados con la referencia financiera |
| Comparar y concluir | Minimizar el tiempo de armar la comparación | **M3** – Analistas piloto preparan la comparación en ≤ 1 hora |
| Comunicar | Aumentar la confianza del comité en las cifras | **M4** – Primer comité realizado con información del comparador |

Así el roadmap se lee en términos del usuario: *"ya resolvimos la etapa de reunir insumos, falta la de comunicar"*.

### 8.6 Reglas prácticas

1. **Todo milestone debe responder qué job (o etapa) deja resuelto.** Si no puede, es un hito técnico interno: útil, pero no el que se reporta al cliente.
2. **Los hitos técnicos se cuelgan de un hito de job.** Ej.: "Pipeline CI/CD operativo" es habilitador de M1, no un hito ante el negocio.
3. **Un job puede tener varios milestones** (uno por etapa), pero **un milestone no debe cubrir varios jobs distintos**: se vuelve ambiguo de validar.
4. **Nombrar desde la perspectiva del usuario** cuando aplique: "Analista prepara…", "Comité recibe…".
5. **Revisar los milestones cuando cambie el entendimiento del job.** Si el job real era otro, los hitos también cambian.

---

## 9. Plantilla para copiar

```markdown
### M# – [Objeto] [participio: disponible/aprobado/liberado/validado] [contexto]

- **Job relacionado (JTBD):** JTBD-## [nombre del job / etapa]
- **Outcome que habilita:** [métrica del usuario: de X a Y]
- **Fecha objetivo:**
- **Objetivo / valor:**
- **Criterios de cumplimiento:**
  1.
  2.
  3.
- **Evidencia:**
- **Alcance (épicas / HU):**
- **Fuera de alcance:**
- **Responsable:**
- **Aprobador:**
- **Dependencias:**
- **Riesgos:**
- **Estado:** Pendiente | En riesgo | Cumplido | No cumplido
```

---

## 10. Checklist de validación rápida

Antes de publicar un milestone, verifica:

- [ ] ¿Está enlazado a un job (o etapa del job) y a un outcome medible del usuario?
- [ ] ¿El nombre describe un estado logrado y no una actividad?
- [ ] ¿Tiene una fecha concreta?
- [ ] ¿Los criterios son binarios y medibles?
- [ ] ¿Está definida la evidencia que lo demuestra?
- [ ] ¿Hay un responsable y un aprobador con nombre?
- [ ] ¿Está explícito lo que queda fuera de alcance?
- [ ] ¿Se identificaron dependencias y riesgos?
- [ ] ¿Representa valor para el negocio y no solo avance técnico interno?
