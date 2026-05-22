# Stack tecnológico — LOGIKA

Documento de referencia para desarrolladores y despliegue. Describe **lo que el repositorio usa hoy**, no el roadmap completo.

---

## 1. Resumen ejecutivo

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend | HTML5 + CSS3 + JavaScript (ES modules) | UI, simuladores, lógica de negocio en cliente |
| Bundler / dev server | Vite 5.x | Desarrollo con HMR, build a `dist/` |
| Iconografía | Lucide (npm) | Iconos lineales SVG vía `createIcons` |
| PDF | jsPDF 4.x | Certificados descargables (usuarios con sesión) |
| Backend / BaaS | Firebase (proyecto `logika-cad29`) | Hosting estático + Firestore |
| Persistencia local | `localStorage` | XP, módulos, perfiles invitado/usuario, apodo |
| Control de versiones | Git | Código fuente |

**No hay** en este repositorio: servidor Node propio, Express, React/Vue, base SQL, Firebase Authentication implementado (solo planificado).

---

## 2. Runtime y herramientas de desarrollo

### Node.js

- **Versión recomendada:** LTS 20.x o 22.x (cualquier LTS reciente con soporte `npm`).
- **Uso:** instalar dependencias, `vite`, `firebase-tools` (devDependency local).

### npm

- Gestor de paquetes del proyecto (`package-lock.json` presente).
- Scripts definidos en `package.json` (ver [EJECUCION-Y-DEPLOY.md](./EJECUCION-Y-DEPLOY.md)).

### Vite

- **Archivo:** `vite.config.js`
- **Entrada:** `index.html` (raíz del proyecto).
- **Salida:** carpeta `dist/` (archivos estáticos para Firebase Hosting).
- **Variables de entorno:** prefijo `VITE_` (inyectadas en build; ver `.env`).

---

## 3. Dependencias de producción (`dependencies`)

| Paquete | Versión (aprox.) | Uso en LOGIKA |
|---------|------------------|---------------|
| `firebase` | ^12.x | SDK modular: `initializeApp`, Firestore `addDoc`, Analytics opcional |
| `lucide` | ^1.x | Iconos en navegación, lecciones, módulos |
| `jspdf` | ^4.x | Generación de certificados PDF en cliente |

### Firebase SDK (cliente)

Archivo: `src/services/firebase.js`

- `initializeApp` con config desde `import.meta.env.VITE_FIREBASE_*`
- Firestore: escritura en colecciones `school_leads`, `achievements`, `progress_snapshots`
- Sin uso de Firebase Auth en código actual (sesión simulada en `gamification.js`)

### Lucide

Archivo: `src/components/icons.js`

- Registro explícito de iconos usados (tree-shaking manual).
- Atributo HTML: `data-lucide="nombre-icono"`.
- Clase CSS: `lk-icon`.

### jsPDF

Archivo: `src/components/certificates.js` (y flujo de medallas)

- Export PDF cuando el usuario tiene sesión iniciada (flag en `localStorage`).

---

## 4. Dependencias de desarrollo (`devDependencies`)

| Paquete | Uso |
|---------|-----|
| `vite` | Servidor de desarrollo y build |
| `firebase-tools` | CLI vía `npx firebase` (deploy hosting y reglas; no requiere instalación global) |

---

## 5. Infraestructura Firebase

### Firebase Hosting

- **Config:** `firebase.json` → `"public": "dist"`
- **SPA:** rewrite `**` → `/index.html`
- **URL producción:** https://logika-cad29.web.app

### Cloud Firestore

- **Reglas:** `firestore.rules`
- **Modo actual:** escritura `create` desde cliente; sin lectura pública (seguridad por ocultación de datos, no por Auth).
- **Colecciones activas:** ver [FIRESTORE.md](./FIRESTORE.md)

### Variables de entorno (build)

Archivo plantilla: `.env.example`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Obtener valores en: Firebase Console → Configuración del proyecto → Tu app web.

**Importante:** las variables se embeben en el bundle en `npm run build`. Para cambiar Firebase en producción hay que **rebuild + redeploy**.

---

## 6. Arquitectura frontend (patrones)

### SPA sin framework

- Una sola página: `index.html` con secciones `.view`.
- Router manual en `src/main.js`: atributo `data-target` y clase `active` en vistas.
- Sin React Router ni estado global externo (KISS).

### Módulos ES

- `import` / `export` nativos.
- Separación:
  - `src/modules/*` — algoritmos y canvas (dominio matemático).
  - `src/components/*` — UI transversal, progreso, gamificación.
  - `src/config/*` — datos declarativos (lecciones, ruta, colegio).

### Persistencia por perfil

- `src/components/progress-profile.js` — claves `localStorage` por invitado (`guest_*`) o usuario (`user_<email>`).
- Al iniciar sesión: copia opcional desde perfil invitado al de usuario.

### Aprendizaje

- `src/components/module-learn.js` — pestañas Aprender / Practicar, ruta de lecciones, reinicio de práctica.
- `src/config/learning-mode.js` — complejidad invitado, bloqueo secuencial con sesión.
- `src/config/learn-notation.js` — leyendas de símbolos por lección.

### Gráficos y audio

- **Canvas HTML5:** `sets.js`, `graphs.js` (Venn y grafos).
- **SVG inline:** mascota Logiko (`mascot.js`), algunos diagramas en lecciones.
- **Web Audio API:** efectos en `gamification.js` (sin archivos MP3).

---

## 7. Almacenamiento en el navegador

| Clave / prefijo | Contenido |
|----------------|-----------|
| `logika_xp__<perfil>` | Experiencia |
| `logika_module_progress__<perfil>` | Progreso por módulo (lecciones, práctica) |
| `logika_is_logged_in` | Flag de sesión (mock) |
| `logika_auth_email` | Email usado al login mock |
| `logika_guest_complexity` | básico / medio / avanzado |
| `logika_certificates_awarded__<perfil>` | IDs de certificados ya mostrados |
| `logika_player_nickname` | Apodo invitado |
| `logika_school_profile` | Datos formulario colegio |

---

## 8. Seguridad (estado actual y límites)

- Claves `VITE_FIREBASE_*` son **públicas** en el bundle (normal en apps Firebase cliente).
- Protección de datos: **reglas Firestore** (solo `create`, campos mínimos validados).
- **Riesgo conocido:** sin Firebase Auth, cualquier cliente puede escribir en las colecciones permitidas; mitigación futura en Fase Auth ([PLAN-PRODUCTO-Y-BD.md](./PLAN-PRODUCTO-Y-BD.md)).
- No commitear: `.env`, JSON de cuenta de servicio Admin SDK.

---

## 9. Compatibilidad de navegadores

Orientado a navegadores modernos con soporte de:

- ES modules
- Canvas 2D
- `localStorage`
- CSS variables y flexbox/grid

Probar en Chrome/Edge/Firefox recientes antes de release.

---

## 10. Diagramas relacionados

Ver [ARQUITECTURA-Y-FLUJOS.md](./ARQUITECTURA-Y-FLUJOS.md) para flujos de usuario y datos.
