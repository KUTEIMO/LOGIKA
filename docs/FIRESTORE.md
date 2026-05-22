# Firestore — LOGIKA (`logika-cad29`)

## ¿Por qué la consola dice “solo tienes que agregar datos”?

Firestore **no crea colecciones vacías** al desplegar reglas o hosting. Las colecciones aparecen **cuando la app en producción escribe el primer documento**.

| Colección | Cuándo se crea el primer documento |
|-----------|-------------------------------------|
| `school_leads` | Un estudiante guarda el formulario de colegio (colegio, nombre, grado) en la vista **Aventura Colegio**. |
| `achievements` | Al completar un reto y mostrar la **medalla** (ruta colegio, quiz de lógica, etc.). |
| `progress_snapshots` | Al **iniciar sesión** o registrarse, si hay progreso local (XP, módulos, apodo). |

### Cómo probar que funciona

1. Abre **https://logika-cad29.web.app**
2. Asegúrate de tener `.env` con `VITE_FIREBASE_*` (Vite las embebe en el build de hosting).
3. En **Aventura Colegio**, envía el formulario → revisa `school_leads`.
4. Completa un reto con medalla → revisa `achievements`.
5. Regístrate o inicia sesión con progreso local → revisa `progress_snapshots`.

Si no ves documentos: F12 → pestaña **Red** → filtra `firestore` y busca errores `permission-denied` (reglas) o `failed-precondition` (base no creada en la región correcta).

---

## Despliegue (ya funcionó en tu máquina)

```bash
npm install
npx firebase login
npm run deploy:rules    # reglas Firestore
npm run deploy:hosting  # build + sitio estático
```

- **Hosting:** https://logika-cad29.web.app  
- **Consola:** https://console.firebase.google.com/project/logika-cad29/overview  

---

## Reglas (`firestore.rules`)

- **Escritura pública solo `create`** (sin lectura desde el cliente).
- Pensado para una SPA sin Firebase Auth todavía; en producción conviene migrar a Auth + reglas por `request.auth.uid`.

---

## Seguridad

- **No** subas `.env` ni `*firebase-adminsdk*.json` al repositorio.
- El **Admin SDK** es solo para backend/Cloud Functions, nunca en el navegador.
- Las claves `apiKey` del cliente Firebase son públicas por diseño; la protección real son las **reglas** y (futuro) **Auth**.

---

## Estructura de documentos (referencia)

### `school_leads`

```json
{
  "schoolName": "IE San José",
  "studentName": "María",
  "grade": "10",
  "nickname": "María",
  "xp": 150,
  "level": "2",
  "createdAt": "<server timestamp>",
  "source": "school_cta"
}
```

### `achievements`

```json
{
  "displayName": "María",
  "achievementTitle": "Ruta del Programador",
  "subtitle": "...",
  "xp": 200,
  "level": 2,
  "createdAt": "<server timestamp>"
}
```

### `progress_snapshots`

```json
{
  "guestId": "guest_...",
  "email": "usuario@correo.com",
  "nickname": "...",
  "xp": 250,
  "modules": { "logic": { "phase": "..." }, "sets": { "phase": "practice" } },
  "createdAt": "<server timestamp>"
}
```
