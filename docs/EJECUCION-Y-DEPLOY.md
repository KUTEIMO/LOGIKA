# Ejecución, instalación y deploy — LOGIKA

Guía paso a paso para correr el proyecto en **otra máquina**, desarrollar en local y publicar en **Firebase Hosting**.

---

## 1. Requisitos previos

| Requisito | Notas |
|-----------|--------|
| **Git** | Para clonar el repositorio |
| **Node.js** | LTS 20+ o 22+ ([nodejs.org](https://nodejs.org)) |
| **npm** | Incluido con Node |
| **Cuenta Google** | Para Firebase CLI (`firebase login`) |
| **Acceso al proyecto Firebase** | Proyecto `logika-cad29` (solicitar al equipo si no eres colaborador) |

No es obligatorio instalar Firebase CLI de forma global: el proyecto usa `npx firebase` vía `firebase-tools` en `devDependencies`.

---

## 2. Instalación en una máquina nueva

### 2.1 Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd DISCRETAS_WEB_LOGIKA
```

Si recibes el proyecto como ZIP, descomprimir y abrir la carpeta en terminal.

### 2.2 Instalar dependencias

```bash
npm install
```

Esto crea `node_modules/` según `package-lock.json`. No subir `node_modules` a Git.

### 2.3 Configurar variables de entorno

```bash
# Windows (PowerShell)
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Editar `.env` y completar (Firebase Console → Configuración del proyecto → App web):

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=logika-cad29.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=logika-cad29
VITE_FIREBASE_STORAGE_BUCKET=logika-cad29.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Sin `.env` la app **arranca en local**, pero Firestore y Analytics no funcionarán (verás aviso en consola del navegador).

### 2.4 Desarrollo local

```bash
npm run dev
```

- Vite muestra una URL (típicamente `http://localhost:5173`).
- Los cambios en `src/` recargan automáticamente (HMR).
- Detener con `Ctrl+C`.

### 2.5 Vista previa del build de producción

```bash
npm run build
npm run preview
```

Sirve la carpeta `dist/` localmente para validar antes de deploy.

---

## 3. Scripts npm disponibles

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Genera `dist/` optimizado |
| `npm run preview` | Sirve `dist/` en local |
| `npm run deploy:rules` | Publica solo `firestore.rules` |
| `npm run deploy:hosting` | `build` + deploy Hosting |
| `npm run deploy` | `build` + deploy Hosting + lo configurado en `firebase.json` |

---

## 4. Deploy a Firebase (primera vez en la máquina)

### 4.1 Iniciar sesión en Firebase CLI

```bash
npx firebase login
```

Se abre el navegador con la cuenta Google. Usar la cuenta con permisos en `logika-cad29`.

### 4.2 Verificar proyecto activo

En la raíz debe existir `.firebaserc` (o asociar proyecto):

```bash
npx firebase use logika-cad29
```

### 4.3 Crear Firestore (solo una vez por proyecto)

En [Firebase Console](https://console.firebase.google.com/project/logika-cad29):

1. Crear base de datos **Firestore** (modo producción, región cercana a usuarios, ej. `southamerica-east1` o `us-east1`).
2. Publicar reglas:

```bash
npm run deploy:rules
```

### 4.4 Deploy del sitio web

```bash
npm run deploy:hosting
```

Al terminar, la CLI muestra la URL de Hosting (https://logika-cad29.web.app).

**Importante:** cada cambio en `.env` o en código requiere:

```bash
npm run deploy:hosting
```

para que producción refleje el nuevo bundle.

---

## 5. Checklist: otra máquina → producción

```
[ ] Node.js LTS instalado (node -v)
[ ] git clone + cd al proyecto
[ ] npm install
[ ] .env creado y VITE_FIREBASE_* completos
[ ] npm run dev → app abre en navegador
[ ] npx firebase login
[ ] npm run deploy:rules (si cambiaste firestore.rules)
[ ] npm run deploy:hosting
[ ] Probar https://logika-cad29.web.app (formulario colegio, módulo, login mock)
[ ] Consola Firebase → Firestore → verificar documentos de prueba
```

---

## 6. Instalación solo para usar (sin desarrollar)

Si solo necesitas **ver la app en local** sin desplegar:

```bash
npm install
cp .env.example .env
# Completar .env
npm run dev
```

No hace falta Firebase CLI salvo que vayas a publicar.

---

## 7. Problemas frecuentes

### `npm install` falla o es lento

- Verificar proxy/red corporativa.
- Probar `npm install --legacy-peer-deps` solo si npm reporta conflictos de peers.
- Borrar `node_modules` y `package-lock.json` solo como último recurso (coordinar con el equipo).

### La app en local no guarda en Firestore

1. ¿Existe `.env` con todas las `VITE_FIREBASE_*`?
2. ¿Reiniciaste `npm run dev` después de crear `.env`?
3. F12 → Consola / Red: errores `permission-denied` → revisar `npm run deploy:rules`.
4. ¿Firestore está creado en la consola Firebase?

### Deploy: `Firebase CLI not found`

Usar siempre:

```bash
npx firebase deploy --only hosting
```

o los scripts `npm run deploy:hosting`.

### Producción muestra versión vieja

- Hosting puede cachear: forzar recarga (`Ctrl+F5`).
- Confirmar que ejecutaste `npm run build` antes del deploy.
- Revisar en Firebase Console → Hosting → último release.

### Puerto 5173 ocupado

```bash
npm run dev -- --port 5174
```

---

## 8. Archivos que no deben publicarse ni commitearse

| Archivo | Motivo |
|---------|--------|
| `.env` | Secretos de configuración (aunque apiKey sea pública, mantener convención) |
| `node_modules/` | Se regenera con `npm install` |
| `dist/` | Se regenera con `npm run build` (opcional en gitignore) |
| `*firebase-adminsdk*.json` | Credenciales de servidor |
| `.firebase/` | Cache local de CLI |

---

## 9. Referencias

- Stack: [STACK-TECNOLOGICO.md](./STACK-TECNOLOGICO.md)
- Firestore: [FIRESTORE.md](./FIRESTORE.md)
- Flujos: [ARQUITECTURA-Y-FLUJOS.md](./ARQUITECTURA-Y-FLUJOS.md)
