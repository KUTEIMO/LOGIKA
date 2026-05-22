# Plan de base de datos — LOGIKA

Objetivo: guardar progreso académico, leads de colegio (CTA) y cuentas de estudiantes Unisimón, con **costo cero o mínimo** en la fase piloto.

---

## ¿Firebase nos sirve?

**Sí, Firebase es una buena opción** para LOGIKA en esta etapa:

| Ventaja | Detalle |
|--------|---------|
| Plan gratuito (Spark) | Auth, Firestore y Hosting con cuotas generosas para un piloto universitario |
| Tiempo real | Útil si más adelante quieren tablas de verdad o rankings en vivo |
| Auth sencillo | Email/contraseña o Google para estudiantes |
| Hosting | Misma cuenta que `firebase deploy` del build de Vite |
| SDK en el navegador | Encaja con la app actual (sin backend propio al inicio) |

**Limitaciones a tener en cuenta:**

- Reglas de seguridad de Firestore mal escritas = datos expuestos (hay que diseñarlas desde el día 1).
- Consultas complejas (reportes por colegio) son más limitadas que SQL.
- Vendor lock-in moderado (migrable después exportando JSON).

**Alternativas gratuitas comparables:**

| Servicio | Cuándo elegirlo |
|----------|----------------|
| **Supabase** | Si prefieren PostgreSQL + SQL + Auth en un solo panel |
| **PocketBase** | Backend auto-hospedado en un VPS pequeño (más control, más DevOps) |
| **Convex** | Si quieren lógica reactiva tipo “hoja de cálculo viva” (menos familiar para el equipo) |

**Recomendación del equipo:** **Firebase (Firestore + Auth)** para el MVP con colegios y XP; evaluar Supabase si el profesor pide reportes SQL.

---

## Modelo de datos propuesto (Firestore)

### Colección `users` (estudiantes registrados)

```
users/{uid}
  email: string
  displayName: string
  role: "student" | "admin"
  xp: number
  level: number
  streak: number
  lastActive: timestamp
  createdAt: timestamp
```

### Colección `guest_profiles` (opcional, por deviceId)

Mientras no hay login, sincronizar desde `localStorage` usando un `deviceId` UUID:

```
guest_profiles/{deviceId}
  nickname: string
  xp, level, streak, completedChallenges[]
  updatedAt: timestamp
```

Al registrarse, fusionar guest → `users/{uid}` y borrar guest.

### Colección `school_leads` — **CTA Colegio** (prioridad negocio)

Cada envío del formulario Colegio Invitado:

```
school_leads/{autoId}
  schoolName: string
  studentName: string
  grade: "9" | "10" | "11"
  nickname: string
  xp: number
  quizProgress: { stepIndex, completed }
  source: "school_cta"
  createdAt: timestamp
  syncedFromLocal: boolean
```

Índices: `schoolName`, `grade`, `createdAt` (para dashboards de admisiones / extensión).

### Colección `module_progress`

```
module_progress/{uid_or_deviceId}_{module}
  module: "logic" | "sets" | "graphs" | "relations"
  lastFormula?: string
  cache: map (JSON)
  xpEarned: number
  updatedAt: timestamp
```

---

## Flujo de integración (desde lo ya implementado en front)

Hoy la app guarda en `localStorage`:

| Clave | Uso |
|-------|-----|
| `logika_xp`, `logika_streak`, … | Gamificación |
| `logika_player_nickname` | Apodo módulos |
| `logika_school_profile` | CTA colegio |
| `logika_school_quiz_progress` | Reto 1–3 |
| `logika_module_cache` | Estado por módulo |
| `logika_school_lead_pending_sync` | Bandera para subir lead |

**Paso 1 — Firebase Console**

1. Crear proyecto `logika-unisimon` (ejemplo).
2. Activar **Authentication** (Email/Password).
3. Crear base **Firestore** en modo producción con reglas restrictivas.
4. Registrar app Web y copiar config.

**Paso 2 — Proyecto**

```bash
npm install firebase
```

Crear `src/services/firebase.js` con init y funciones:

- `syncSchoolLead(exportLeadPayload())` → `addDoc(collection(db, 'school_leads'), …)`
- `saveUserProgress(uid, data)`
- `onAuthStateChanged` → merge localStorage

**Paso 3 — Reglas Firestore (borrador)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /school_leads/{id} {
      allow create: if request.resource.data.keys().hasAll(['schoolName','studentName','grade']);
      allow read: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

**Paso 4 — Hosting**

```bash
npm run build
firebase deploy --only hosting
```

---

## Fases de implementación

| Fase | Entregable | Esfuerzo estimado |
|------|------------|-------------------|
| **0** (hoy) | Caché local + CTA colegio + apodo | Hecho en front |
| **1** | `syncSchoolLead()` al guardar perfil colegio | 1–2 días |
| **2** | Auth Firebase + migración XP al login | 2–3 días |
| **3** | Panel admin (leads por colegio) — Firebase Console o mini dashboard | 3–5 días |
| **4** | Reglas + pruebas de seguridad + backup | 1–2 días |

---

## Coste estimado

- **Firebase Spark:** $0/mes para tráfico típico de curso (< 50k lecturas/día).
- **Dominio:** opcional (~$10/año).
- **Supabase free tier:** alternativa si superan límites de Firestore (poco probable en piloto).

---

## Qué NO guardar en Firebase sin cifrado

- Contraseñas en texto plano (usar solo Firebase Auth).
- Datos sensibles de menores: minimizar a nombre, colegio, grado; política de privacidad Unisimón.

---

## Resumen ejecutivo

1. **Firebase sí sirve** y es la ruta más rápida para conectar el CTA de colegio y el XP.
2. La colección **`school_leads`** es el call-to-action que ya preparó el front con `exportLeadPayload()`.
3. El front ya **no borra progreso al cerrar sesión**; todo queda en caché local hasta sincronizar.
4. Siguiente paso técnico: crear proyecto Firebase e implementar `syncSchoolLead` en `src/services/firebase.js`.
