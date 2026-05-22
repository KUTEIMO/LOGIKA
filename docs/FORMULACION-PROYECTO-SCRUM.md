# Formulación del proyecto y marco Scrum — LOGIKA

Documento de gestión para el proyecto académico **LOGIKA** (Universidad Simón Bolívar, Cúcuta). Alineado con el estado **implementado** en el repositorio y el roadmap en [PLAN-PRODUCTO-Y-BD.md](./PLAN-PRODUCTO-Y-BD.md).

---

## 1. Ficha del producto

| Campo | Valor |
|-------|--------|
| **Nombre** | LOGIKA |
| **Tipo** | Aplicación web educativa (SPA) |
| **Cliente / contexto** | Cursos de Matemáticas Discretas — Ingeniería de Sistemas |
| **Usuarios primarios** | Estudiantes universitarios, estudiantes de colegio (9°–11°) en modo invitado |
| **URL producción** | https://logika-cad29.web.app |
| **Repositorio** | `DISCRETAS_WEB_LOGIKA` (monorepo frontend + docs) |

---

## 2. Visión del producto

**Para** estudiantes que aprenden matemáticas discretas,  
**que** necesitan practicar con feedback visual y motivación sostenida,  
**LOGIKA** es una plataforma web interactiva  
**que** combina lecciones guiadas, simuladores por tema y gamificación con la mascota Logiko.  
**A diferencia de** material estático o PDFs,  
**nuestro producto** ofrece práctica inmediata, progreso guardado y una ruta hacia certificados por módulo.

---

## 3. Objetivos del proyecto

### Objetivos de negocio / académicos

1. Mejorar comprensión de lógica, conjuntos, grafos y relaciones mediante simulación.
2. Aumentar engagement con XP, rachas y narrativa (Logiko).
3. Captar interés de bachillerato hacia Ingeniería de Sistemas (modo Colegio).
4. Dejar base técnica desplegable (Firebase) para Auth, rankings y salas en fases posteriores.

### Objetivos técnicos (alcance actual)

1. SPA mantenible en vanilla JS + Vite (KISS).
2. Progreso local por perfil (invitado / usuario).
3. Integración Firestore para leads, logros y snapshots.
4. Documentación reproducible de instalación y deploy.

---

## 4. Alcance

### Dentro de alcance (Release actual — “1.0 académica”)

- Cuatro módulos con Aprender + Practicar.
- Modo invitado con complejidad y acceso libre a módulos.
- Modo sesión: Mi ruta secuencial, lecciones extendidas, PDF certificados.
- Modo Colegio: 3 etapas lección + reto con notación contextual.
- Gamificación: XP, nivel, racha, certificados por módulo e hitos XP.
- Hosting Firebase + reglas Firestore documentadas.
- Login **simulado** (localStorage + sync snapshot); no Firebase Auth completo.

### Fuera de alcance (explícito en 1.0)

- Rankings en tiempo real.
- Salas multijugador tipo Kahoot.
- Grupos / aulas con roles docente.
- DFS, Kruskal, Prim en módulo grafos.
- App móvil nativa.
- Backend propio (Node/Express) aparte de Firebase.

Ver fases 2–4 en [PLAN-PRODUCTO-Y-BD.md](./PLAN-PRODUCTO-Y-BD.md).

---

## 5. Marco Scrum adaptado (proyecto académico)

### Roles

| Rol Scrum | Responsable en LOGIKA | Responsabilidades |
|-----------|----------------------|-------------------|
| **Product Owner** | Equipo académico / docente asesor | Priorizar backlog, validar lecciones y criterios de certificación |
| **Scrum Master** | Rotación semanal entre integrantes (sugerido) | Facilitar daily, remover impedimentos, respetar timeboxes |
| **Development Team** | Jesus Omar Avendaño, Saraic Noemi León, Eduardo José Soto | Implementación, pruebas, documentación, deploy |

### Eventos (cadencia sugerida: sprints de 2 semanas)

| Evento | Duración | Entregable |
|--------|----------|------------|
| **Sprint Planning** | 2 h | Sprint backlog + objetivo del sprint |
| **Daily Scrum** | 15 min | Impedimentos y avance hacia el sprint goal |
| **Sprint Review** | 1 h | Demo en `dev` o staging + feedback PO |
| **Sprint Retrospective** | 45 min | 1–3 mejoras accionables |
| **Refinamiento backlog** | 1 h / semana | Historias listas (DoR) |

### Artefactos

- **Product Backlog** — ver sección 7.
- **Sprint Backlog** — ítems comprometidos por sprint.
- **Incremento** — código en `main` desplegable a Hosting + docs actualizadas.

### Definition of Done (DoD)

Un ítem se considera **terminado** cuando:

1. Código en rama integrada (`main` o según acuerdo del equipo).
2. `npm run build` sin errores.
3. Probado manualmente en Chrome/Edge (flujo feliz + un caso de error).
4. Sin secretos en el commit (`.env` fuera de Git).
5. Documentación actualizada si cambia deploy, Firestore o flujos visibles.
6. Si afecta producción: `deploy:hosting` ejecutado o planificado en la misma sprint review.

### Definition of Ready (DoR)

Una historia entra al sprint si tiene:

- Título y descripción en formato usuario.
- Criterios de aceptación verificables.
- Estimación (puntos o T-shirt).
- Dependencias identificadas (ej. reglas Firestore, contenido didáctico).

---

## 6. Historias de usuario (resumen por épica)

### Épica A — Aprendizaje y módulos

| ID | Historia | Estado |
|----|----------|--------|
| A1 | Como estudiante quiero lecciones antes de practicar para entender notación | Hecho |
| A2 | Como estudiante quiero volver a lecciones desde práctica sin perder el hilo | Hecho |
| A3 | Como invitado quiero elegir complejidad acorde a mi nivel | Hecho |
| A4 | Como usuario logueado quiero ruta secuencial alineada al panel | Hecho |

### Épica B — Gamificación y certificados

| ID | Historia | Estado |
|----|----------|--------|
| B1 | Como estudiante quiero XP y racha para mantener hábito | Hecho |
| B2 | Como estudiante quiero certificado al completar módulo, no en cada mini-reto | Hecho |
| B3 | Como usuario logueado quiero PDF del certificado | Hecho |

### Épica C — Colegio

| ID | Historia | Estado |
|----|----------|--------|
| C1 | Como colegial quiero aventura con lección y reto | Hecho |
| C2 | Como colegial quiero que me expliquen ~, ^, ∩ en el momento | Hecho |
| C3 | Como institución quiero capturar colegio, nombre y grado | Hecho (Firestore) |

### Épica D — Plataforma y datos

| ID | Historia | Estado |
|----|----------|--------|
| D1 | Como equipo quiero deploy reproducible en Firebase | Hecho |
| D2 | Como equipo quiero progreso por usuario al iniciar sesión | Hecho (local + snapshot) |
| D3 | Como usuario quiero Firebase Auth real | Backlog (Fase 1 plan) |

---

## 7. Product Backlog priorizado (extracto)

| Prioridad | Ítem | Tipo | Sprint sugerido |
|-----------|------|------|-----------------|
| P0 | Mantener build y hosting estables | Técnico | Continuo |
| P0 | Reglas Firestore alineadas a colecciones | Técnico | Hecho |
| P1 | Firebase Authentication + `users/{uid}` | Feature | Sprint futuro 1 |
| P1 | Sincronizar progreso en documento de usuario | Feature | Sprint futuro 1 |
| P2 | Vista rankings semanal | Feature | Sprint futuro 2 |
| P2 | Salas quiz en tiempo real | Feature | Sprint futuro 3 |
| P3 | Panel docente / grupos | Feature | Sprint futuro 4 |
| P3 | Algoritmo DFS opcional en grafos | Mejora | Backlog |

---

## 8. Plan de releases (alto nivel)

```text
Release 0.x — MVP módulos + Logiko (histórico)
Release 1.0 — Ruta aprendizaje, colegio, notación, perfiles (ACTUAL)
Release 1.1 — Firebase Auth + users/{uid}
Release 2.0 — Rankings + opt-in público
Release 3.0 — Salas / Kahoot
```

---

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Firestore abierto a escritura sin Auth | Medio | Reglas estrictas; Fase Auth prioritaria |
| Progreso solo en un navegador | Medio | Login + sync Firestore (Fase 1) |
| Bundle grande (>500 kB) | Bajo | Code-split futuro; aceptable en académico |
| Contenido didáctico desactualizado | Medio | PO revisa lecciones cada sprint |
| Dependencia de cuenta Firebase del equipo | Alto | Documentar `.env.example` y colaboradores en consola |

---

## 10. Métricas sugeridas (Sprint Review)

- Usuarios únicos en Analytics (si `MEASUREMENT_ID` activo).
- Documentos en `school_leads` / `achievements` por semana.
- Módulos completados (evento manual o futuro tracking).
- Tiempo medio en vista Aprender vs Practicar (futuro).
- Errores en consola reportados en pruebas de aceptación.

---

## 11. Referencias cruzadas

- Técnico: [STACK-TECNOLOGICO.md](./STACK-TECNOLOGICO.md)
- Operación: [EJECUCION-Y-DEPLOY.md](./EJECUCION-Y-DEPLOY.md)
- Flujos: [ARQUITECTURA-Y-FLUJOS.md](./ARQUITECTURA-Y-FLUJOS.md)
- Datos: [FIRESTORE.md](./FIRESTORE.md)
