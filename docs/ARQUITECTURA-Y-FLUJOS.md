# Arquitectura y diagramas de flujo — LOGIKA

Diagramas en **Mermaid** (legibles en GitHub, VS Code y Cursor). Reflejan el comportamiento **actual** del código.

---

## 1. Arquitectura de despliegue (C4 simplificado)

```mermaid
flowchart TB
  subgraph Cliente["Navegador del estudiante"]
    SPA["SPA LOGIKA\nindex.html + src/"]
    LS["localStorage\nperfil invitado / usuario"]
    SPA --> LS
  end

  subgraph Firebase["Google Firebase — logika-cad29"]
    HOST["Firebase Hosting\nsirve dist/"]
    FS["Cloud Firestore"]
    ANA["Analytics opcional"]
  end

  SPA -->|HTTPS| HOST
  SPA -->|SDK write create| FS
  SPA -.->|eventos| ANA

  DEV["Desarrollador"]
  DEV -->|npm run build| DIST["carpeta dist/"]
  DIST -->|firebase deploy| HOST
  DEV -->|deploy:rules| FS
```

---

## 2. Estructura lógica del frontend

```mermaid
flowchart LR
  main["main.js\nrouter + bootstrap"]
  config["config/\nlecciones, ruta, colegio"]
  comp["components/\nUI, progreso, XP"]
  mod["modules/\nlogic, sets, graphs, relations"]
  fb["services/firebase.js"]

  main --> config
  main --> comp
  main --> mod
  comp --> fb
  comp --> config
  mod --> comp
```

---

## 3. Flujo de navegación (vistas)

```mermaid
flowchart TD
  START([Usuario abre la app]) --> LAND[landing-view]
  LAND -->|Comenzar / invitado| DASH[dashboard-view]
  LAND -->|Iniciar sesión| LOGIN[login-view]
  LOGIN -->|submit mock| DASH

  DASH -->|Módulo| MOD[logic / sets / graphs / relations -view]
  DASH -->|Colegio| SCH[school-view]
  DASH -->|Mi ruta| ROUTE[learning-route-view]
  DASH -->|Perfil| PROF[profile-view]

  ROUTE -.->|solo si isLoggedIn| DASH
  PROF -.->|solo si isLoggedIn| DASH

  SCH -->|Empezar aventura| QUIZ[school-quiz-area\nlección → reto]

  MOD --> TABS{Pestañas módulo}
  TABS -->|Aprender| LEARN[Lecciones + notación]
  TABS -->|Practicar| PRAC[Simulador]
  LEARN -->|volver desde práctica| LEARN
  PRAC -->|tab Aprender| LEARN
```

---

## 4. Flujo modo invitado vs sesión (panel de módulos)

```mermaid
flowchart TD
  OPEN[Abrir dashboard] --> LOGGED{¿Sesión iniciada?}

  LOGGED -->|No| GUEST[Panel invitado]
  GUEST --> CX[Selector complejidad\nbásico / medio / avanzado]
  GUEST --> ALL[Todos los módulos abiertos]
  ALL --> MODG[Entrar módulo]

  LOGGED -->|Sí| USER[Panel cuenta + Mi ruta]
  USER --> LOCK{¿Módulo anterior\ncompleto?}
  LOCK -->|No| BLOCK[Módulo bloqueado\nen tarjeta]
  LOCK -->|Sí| MODU[Entrar módulo]
  MODU --> ROUTE2[Mi ruta muestra\nmismo orden de desbloqueo]
```

---

## 5. Flujo Aprender → Practicar (un módulo)

```mermaid
flowchart TD
  ENTER[Entrar al módulo] --> INIT[initModulePhases]
  INIT --> L1[Mostrar lección actual]
  L1 --> COMP{¿Marca Lo entendí?}
  COMP -->|Sí| XP[+15 XP, guardar lessonId]
  XP --> ALLL{¿Todas las lecciones\ndel modo actual?}
  ALLL -->|No| L1
  ALLL -->|Sí| UNLOCK[Desbloquear pestaña Practicar]
  UNLOCK --> PRAC[Usuario en Practicar]
  PRAC --> BACK{¿Clic en Aprender?}
  BACK -->|Sí| RESET[Reiniciar ejercicio práctica]
  RESET --> L1
  L1 --> PICK[Navegación por píldoras\nlecciones ya vistas]
```

---

## 6. Flujo modo Colegio (aventura)

```mermaid
flowchart TD
  S[school-view] --> FORM{¿Perfil colegio\nguardado?}
  FORM -->|No| F[Formulario\ncolegio, nombre, grado]
  F --> FS1[(Firestore\nschool_leads)]
  FORM -->|Sí| START[Empezar aventura]
  START --> L[Lección + tabla notación\nsolo símbolos de la etapa]
  L --> BTN[Ir al reto]
  BTN --> Q[Pregunta + leyenda símbolos]
  Q --> OK{¿Respuesta correcta?}
  OK -->|No| EXP[Mostrar explicación]
  EXP --> Q
  OK -->|Sí| NEXT{¿Última etapa?}
  NEXT -->|No| L
  NEXT -->|Sí| MED[Medalla + XP\nachievements FS]
```

---

## 7. Flujo de persistencia (progreso y login mock)

```mermaid
flowchart LR
  subgraph Local["localStorage"]
    G["guest_<guestId>\nmodule_progress, xp, ..."]
    U["user_<email>\nmodule_progress, xp, ..."]
  end

  PLAY[Acción con XP / módulo] --> PROF{¿isLoggedIn?}
  PROF -->|No| G
  PROF -->|Sí| U

  LOGIN[Login mock\nmain.js] --> COPY[onUserLogin:\ncopiar guest → user si vacío]
  COPY --> U
  LOGIN --> SNAP[syncUserProgress]
  SNAP --> PS[(progress_snapshots)]

  LOGOUT[Logout] --> G2[Volver a leer perfil guest]
```

---

## 8. Flujo de certificado (módulo completo)

```mermaid
flowchart TD
  ACT[Actividad en práctica\n tabla, venn, dijkstra, etc.] --> CHK[afterModuleActivity / checks]
  CHK --> REQ{¿Lecciones OK +\nrequisitos learning-path?}
  REQ -->|No| END1[Solo XP parcial]
  REQ -->|Sí| CERT[tryAwardModuleCertificate]
  CERT --> MED[Medalla pantalla]
  MED --> ACH[(achievements)]
  MED --> PDF{¿Sesión?}
  PDF -->|Sí| DL[Descarga PDF jsPDF]
  PDF -->|No| PNG[Solo celebración local]
```

---

## 9. Flujo de build y deploy

```mermaid
flowchart LR
  A[src/ + index.html] --> B[npm run build\nVite]
  ENV[.env VITE_FIREBASE_*] --> B
  B --> C[dist/]
  C --> D[npx firebase deploy\n--only hosting]
  D --> E[CDN Firebase Hosting\nlogika-cad29.web.app]

  R[firestore.rules] --> DR[npm run deploy:rules]
  DR --> F[Firestore reglas]
```

---

## 10. Flujo de datos Firestore (escrituras cliente)

```mermaid
sequenceDiagram
  participant U as Usuario
  participant App as SPA LOGIKA
  participant FS as Firestore

  U->>App: Guarda formulario colegio
  App->>FS: addDoc school_leads

  U->>App: Completa módulo / medalla
  App->>FS: addDoc achievements

  U->>App: Login mock con progreso
  App->>FS: addDoc progress_snapshots

  Note over FS: No hay lectura desde cliente<br/>según firestore.rules
```

---

## 11. Mapa de archivos por responsabilidad

| Flujo | Archivos principales |
|-------|----------------------|
| Router | `src/main.js`, `index.html` |
| Lecciones | `src/config/module-lessons.js`, `learn-notation.js`, `learn-visuals.js` |
| Modo invitado / ruta | `src/config/learning-mode.js`, `dashboard-ui.js`, `learning-route-ui.js` |
| Colegio | `src/config/school-adventure.js`, `main.js` (sección colegio) |
| Progreso | `progress.js`, `progress-profile.js`, `gamification.js` |
| Certificados | `certificates.js`, `medal.js`, `learning-path.js` |
| Firebase | `services/firebase.js`, `firestore.rules` |

---

## 12. Ver también

- [STACK-TECNOLOGICO.md](./STACK-TECNOLOGICO.md)
- [EJECUCION-Y-DEPLOY.md](./EJECUCION-Y-DEPLOY.md)
- [FORMULACION-PROYECTO-SCRUM.md](./FORMULACION-PROYECTO-SCRUM.md)
