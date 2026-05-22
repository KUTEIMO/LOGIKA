# LOGIKA — Plataforma interactiva de Matemáticas Discretas

Aplicación web (SPA) para aprender y practicar **lógica proposicional**, **teoría de conjuntos**, **grafos** y **relaciones**, con gamificación, mascota **Logiko** y modo **Colegio** para grados 9–11.

**Producción:** https://logika-cad29.web.app  
**Proyecto Firebase:** `logika-cad29`  
**Institución:** Universidad Simón Bolívar — Sede Cúcuta (Ingeniería de Sistemas)

---

## Integrantes

- Jesus Omar Avendaño Avendaño  
- Saraic Noemi León Hernández  
- Eduardo José Soto Herrera  

---

## Qué incluye la aplicación (estado actual)

| Área | Descripción |
|------|-------------|
| **Panel de módulos** | Cuatro módulos con fases **Aprender** (lecciones + notación) y **Practicar** (simuladores). |
| **Invitado** | Complejidad configurable (básico / medio / avanzado), progreso local por perfil, acceso libre a módulos. |
| **Sesión iniciada** | **Mi ruta** secuencial, lecciones extendidas, certificados PDF, progreso por usuario (email). |
| **Colegio** | Aventura en 3 etapas: lección → reto (lógica, conjuntos, grafos) con notación explicada en contexto. |
| **Gamificación** | XP, nivel, racha, medallas/certificados por módulo e hitos de XP (sin medalla en cada mini-reto). |
| **Backend** | Firebase Hosting + Firestore (leads, logros, snapshots de progreso). Auth real: planificado (ver plan de producto). |

### Módulos académicos

1. **Lógica** — Tablas de verdad, conectores (`~`, `^`, `v`, `->`, `<->`), clasificación (tautología / contradicción / contingencia).  
2. **Conjuntos** — Diagramas de Venn, operaciones (∪, ∩, −, Δ), cálculo y coloreado.  
3. **Grafos** — Editor en canvas, **BFS** y **Dijkstra** (no incluye DFS, Kruskal ni Prim en esta versión).  
4. **Relaciones** — Matriz y pares, propiedades y equivalencia.  

---

## Documentación del repositorio

| Documento | Contenido |
|-----------|-----------|
| [docs/EJECUCION-Y-DEPLOY.md](docs/EJECUCION-Y-DEPLOY.md) | Instalar en otra máquina, desarrollo local, build, deploy, variables de entorno, problemas frecuentes. |
| [docs/STACK-TECNOLOGICO.md](docs/STACK-TECNOLOGICO.md) | Stack detallado: Vite, Firebase, librerías, almacenamiento, arquitectura de carpetas. |
| [docs/FORMULACION-PROYECTO-SCRUM.md](docs/FORMULACION-PROYECTO-SCRUM.md) | Visión, alcance, roles Scrum, backlog, sprints y criterios de aceptación. |
| [docs/ARQUITECTURA-Y-FLUJOS.md](docs/ARQUITECTURA-Y-FLUJOS.md) | Diagramas de flujo (navegación, aprendizaje, datos, deploy). |
| [docs/FIRESTORE.md](docs/FIRESTORE.md) | Colecciones, reglas, pruebas en consola. |
| [docs/PLAN-PRODUCTO-Y-BD.md](docs/PLAN-PRODUCTO-Y-BD.md) | Roadmap: Auth, rankings, salas tipo Kahoot. |
| [docs/PLAN-RUTA-APRENDIZAJE-IMPLEMENTACION.md](docs/PLAN-RUTA-APRENDIZAJE-IMPLEMENTACION.md) | Detalle de la ruta de aprendizaje implementada. |

---

## Inicio rápido

```bash
git clone <url-del-repositorio>
cd DISCRETAS_WEB_LOGIKA
npm install
cp .env.example .env
# Completar VITE_FIREBASE_* en .env (ver docs/EJECUCION-Y-DEPLOY.md)
npm run dev
```

Abrir la URL que muestra Vite (por defecto `http://localhost:5173`).

**Deploy solo hosting:**

```bash
npm run deploy:hosting
```

Guía completa: [docs/EJECUCION-Y-DEPLOY.md](docs/EJECUCION-Y-DEPLOY.md).

---

## Estructura del código (resumen)

```text
DISCRETAS_WEB_LOGIKA/
├── index.html              # SPA: vistas y módulos en DOM
├── package.json
├── vite.config.js
├── firebase.json           # Hosting (dist/) + reglas Firestore
├── firestore.rules
├── .env.example
├── docs/                   # Documentación técnica y de proyecto
└── src/
    ├── main.js             # Router, auth mock, colegio, bootstrap
    ├── style.css
    ├── config/             # Lecciones, ruta, colegio, notación, visuales
    ├── components/         # UI, progreso, certificados, mascota, dashboard
    ├── modules/            # Motores: logic, sets, graphs, relations
    └── services/           # Cliente Firebase (Firestore)
```

---

## Licencia

Ver [LICENSE](LICENSE) en la raíz del repositorio.
