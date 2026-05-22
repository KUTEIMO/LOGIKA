# Plan de producto LOGIKA — Rutas, certificados, salas y base de datos

## Estado actual (implementado)

| Funcionalidad | Invitado | Usuario con sesión |
|---------------|----------|-------------------|
| XP y racha local | Sí | Sí + snapshot en Firestore |
| Módulos académicos | Sí | Sí |
| Ruta de aprendizaje visible | No | Sí (panel cuenta) |
| Certificado al completar módulo | PNG; PDF si hay sesión | PNG + PDF |
| Certificado por mini-reto | **No** (solo XP) | **No** |
| Hitos XP (400, 800) | PNG | PNG + PDF |
| Rankings / Kahoot / Grupos | Teaser “Fase 2/3” | Mismo teaser |

### Requisitos por módulo (certificado)

Definidos en `src/config/learning-path.js`:

- **Lógica:** 3 tablas generadas + 2 quizzes de clasificación correctos  
- **Conjuntos:** 2 cálculos en “Aprender” + 2 victorias en coloreado  
- **Grafos:** 1 Dijkstra + 1 BFS  
- **Relaciones:** 4 verificaciones de propiedades  

### Colecciones Firestore hoy

- `school_leads`, `achievements`, `progress_snapshots`  
- Ver [FIRESTORE.md](./FIRESTORE.md)

---

## Fase 1 — Autenticación real y perfil (prioridad alta)

**Objetivo:** Que “iniciar sesión” no sea solo `localStorage`.

1. Firebase Authentication (email/contraseña o Google institucional).  
2. Documento `users/{uid}` creado al registrarse.  
3. Sincronizar XP, módulos y certificados al `users/{uid}` en lugar de solo `progress_snapshots`.  
4. Reglas: cada usuario lee/escribe solo su documento.

```text
users/{uid}
  email, displayName, role: student|teacher|admin
  xp, level, streak, lastActive
  modules: { logic: { completed, percent, ... }, ... }
  certificates: [ { id, title, earnedAt } ]
  schoolProfile: { ... }
```

---

## Fase 2 — Rankings y podio

**Objetivo:** Motivar registro con competencia sana.

1. Colección `leaderboards/weekly` con subcolección `entries`.  
2. Cloud Function (o agregación diaria) que ordena por XP de la semana.  
3. Vista `rankings-view`: top 20, posición del usuario, filtro por colegio (opcional).  
4. Solo usuarios autenticados aparecen en el podio público (opt-in).

```text
leaderboards/{periodId}
  periodStart, periodEnd, scope: global|school|group

leaderboards/{periodId}/entries/{uid}
  displayName, xpEarned, streak, schoolName
```

---

## Fase 3 — Salas en vivo (estilo Kahoot)

**Objetivo:** Un docente o estudiante líder crea sala; otros entran con código.

### Flujo

1. Usuario logueado → “Crear sala” → código 6 caracteres (ej. `LOG42A`).  
2. Firestore `live_rooms/{roomId}` en estado `lobby | playing | finished`.  
3. Participantes en `live_rooms/{roomId}/players/{uid}` (nickname, score, avatar).  
4. Host lanza pregunta desde banco (lógica/conjuntos/grafos).  
5. Respuestas en tiempo real con **Firestore onSnapshot** o **Realtime Database** para latencia baja.  
6. Pantalla podio al final de la ronda.

```text
live_rooms/{roomId}
  hostUid, code, status, currentQuestionIndex, moduleFilter, createdAt

live_rooms/{roomId}/players/{uid}
  nickname, score, lastAnswer, isReady

live_rooms/{roomId}/questions/{qId}
  type, payload, correctAnswer, timeLimitSec

question_bank/{id}
  module, difficulty, stem, options[], explanation
```

### UI nuevas

- `live-host-view` — crear sala, lanzar ronda, ver respuestas.  
- `live-join-view` — ingresar código.  
- `live-play-view` — alumno responde.  
- `live-podium-view` — resultados.

---

## Fase 4 — Grupos / cursos (institucional)

**Objetivo:** Profesor Unisimón o colegio agrupa estudiantes.

```text
groups/{groupId}
  name, institution, teacherUid, inviteCode, modulePath: ['logic','sets',...]

groups/{groupId}/members/{uid}
  role: student|teacher, joinedAt, progressSnapshot

groups/{groupId}/assignments/{assignmentId}
  moduleId, dueAt, requiredScore
```

- El profesor ve dashboard de % completado por alumno.  
- Los alumnos del grupo comparten ranking interno.

---

## Fase 5 — Módulos “completos” y banco de ejercicios

**Objetivo:** Más repertorio teórico + práctico sin confundir (como conjuntos Aprender → Prueba).

Por módulo:

1. **Lección** — texto corto + animación Logiko.  
2. **Práctica guiada** — pasos con pistas.  
3. **Prueba** — sin pistas; no mostrar respuesta en toast antes de responder.  
4. **Desafío** — opcional, XP extra.  

Al 100 % de la ruta del módulo → `tryAwardModuleCertificate` (ya enlazado a requisitos).

Ampliar `question_bank` reutilizable en módulos y en salas en vivo.

---

## Separación técnica recomendada (monorepo futuro)

```text
/apps
  web-student     → Vite actual (LOGIKA)
  web-teacher     → panel grupos (Fase 4)
/packages
  core-logic      → tokenizer, sets, graphs puro TS
  firebase-api    → sync, auth, types
  ui-kit          → toasts, modales, Logiko SVG
/firebase
  firestore.rules
  functions/      → rankings, cerrar salas, emails
```

---

## Reglas de negocio (certificados y XP)

| Evento | XP | Certificado |
|--------|-----|-------------|
| Mini-quiz lógica correcto | +50 | No |
| Coloreado Venn correcto | +50 | No |
| Dijkstra / BFS | +60–70 | No |
| Módulo completo (requisitos) | +80 bonus | Sí (módulo) |
| Ruta colegio 3 retos | +100 | Sí (especial) |
| 400 / 800 XP total | — | Sí (hito) |

PDF de certificado: **solo con sesión iniciada** (ya implementado en `medal.js`).

---

## Próximos pasos inmediatos (desarrollo)

1. Desplegar cambios actuales: `npm run deploy:hosting`  
2. Probar flujo invitado vs logueado en dashboard  
3. Completar un módulo entero y verificar un solo certificado  
4. Iniciar Fase 1 (Firebase Auth) antes de construir salas Kahoot  

---

## Referencia visual Logiko

Ojos **cibernéticos en visor**: anillos y pupilas cyan con filtro glow; expresiones por máscaras (arcos feliz/triste, anillos neutros). Variables CSS `--mascot-cyber-glow` adaptadas a modo claro/oscuro.
