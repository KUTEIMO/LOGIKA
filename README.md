# LOGIKA: Plataforma Interactiva de Matemáticas Discretas

LOGIKA es una plataforma web interactiva diseñada para apoyar el aprendizaje visual y dinámico de las matemáticas discretas mediante simulaciones, representaciones gráficas e interacción digital.

Este proyecto está especialmente adaptado para los cursos de matemáticas discretas de **Ingeniería de Sistemas de la Universidad Simón Bolívar (Sede Cúcuta)**, incorporando un **Modo Colegio Invitado** diseñado para incentivar a estudiantes de grados 9°, 10° y 11° a considerar la Ingeniería de Sistemas como su futura carrera profesional mediante gamificación.

---

## 👥 Integrantes
- **Jesus Omar Avendaño Avendaño**
- **Saraic Noemi León Hernández**
- **Eduardo José Soto Herrera**

---

## 🧠 ¿Cómo se implementan las Matemáticas Discretas?
El núcleo de la plataforma se compone de **cuatro módulos temáticos interactivos**:

1. **Módulo de Lógica Proposicional:**
   - Generación automática de tablas de verdad a partir de fórmulas proposicionales ingresadas por el usuario.
   - Visualización y explicación de conectores lógicos de forma intuitiva.
   - Resolución y validación de equivalencias lógicas complejas.

2. **Módulo de Teoría de Conjuntos:**
   - Representación visual e interactiva mediante diagramas de Venn (2 y 3 conjuntos).
   - Animación del cálculo de operaciones comunes: Unión ($\cup$), Intersección ($\cap$), Diferencia ($-$) y Diferencia Simétrica ($\Delta$).
   - Pruebas lúdicas para rellenar/colorear las secciones correspondientes de una operación planteada.

3. **Módulo de Teoría de Grafos:**
   - Lienzo interactivo para crear nodos y aristas (grafos dirigidos y no dirigidos).
   - Simulación paso a paso de recorridos clásicos: Búsqueda en Anchura (BFS) y Búsqueda en Profundidad (DFS).
   - Algoritmo de Dijkstra interactivo para calcular y visualizar el camino mínimo.
   - Visualización de árboles de expansión mínima (Kruskal y Prim).

4. **Módulo de Relaciones y Funciones:**
   - Simulación visual de relaciones binarias entre conjuntos finitos.
   - Análisis y validación de propiedades algebraicas: Reflexividad, Simetría, Transitividad y Antisimetría con explicaciones guiadas sobre por qué cumple o no cada una.

---

## 🎮 Gamificación y la Mascota: "Logiko"
Para romper la barrera del aprendizaje tradicional y fomentar un engagement similar al de plataformas como Duolingo, LOGIKA incorpora:
- **"Logiko" (La Mascota):** Un compañero digital interactivo (diseñado en SVG para rendimiento nativo) que reacciona con micro-animaciones según el desempeño. Saluda al entrar, celebra los éxitos y se muestra pensativo o da pistas cuando el usuario se equivoca.
- **Sistema de XP y Rachas:** Los estudiantes ganan puntos de experiencia (XP) al completar retos, ganando rachas de días consecutivos de aprendizaje para mantener el hábito.
- **Modo Colegio Invitado:** Una ruta guiada especial para colegios enfocada en cómo la lógica proposicional, la teoría de conjuntos y los grafos son la base de la Inteligencia Artificial, la programación de videojuegos y el hackeo de redes, invitándolos a formar parte de la Universidad Simón Bolívar.

---

## 🛠️ Estructura del Proyecto (Principio KISS)
El proyecto está estructurado siguiendo las mejores prácticas de modularidad, simplicidad y legibilidad (KISS: Keep It Simple and Stupid):

```text
discretas_web_logika/
├── README.md               # Este archivo de documentación
├── index.html              # Contenedor HTML principal y esqueleto de la SPA
├── package.json            # Script de empaquetado y dependencias (Vite)
├── vite.config.js          # Configuración de compilación de Vite
├── public/                 # Recursos y assets estáticos públicos
└── src/
    ├── main.js             # Enrutamiento dinámico, control de estado y bootstrap
    ├── style.css           # Estilo premium cyber-dark (glassmorphism, variables CSS, animaciones)
    ├── components/         # Componentes dinámicos de interfaz
    │   ├── mascot.js       # Motor gráfico SVG y estados de ánimo de "Logiko"
    │   └── gamification.js # Manejador de persistencia de XP, nivel y racha diaria en localStorage
    └── modules/            # Motores de cálculo y simuladores de matemáticas discretas
        ├── logic.js        # Analizador de sintaxis de lógica, evaluador y tablas de verdad
        ├── sets.js         # Dibujo interactivo y operaciones de diagramas de Venn
        ├── graphs.js       # Editor y algoritmos interactivos de grafos (canvas HTML5)
        └── relations.js    # Analizador de propiedades y mapeo de relaciones binarias
```

---

## 🚀 Requisitos e Instalación

Para correr y desarrollar localmente el proyecto, debes contar con [Node.js](https://nodejs.org/) instalado en tu equipo.

1. **Instalar Dependencias:**
   ```bash
   cd discretas_web_logika
   npm install
   ```

2. **Ejecutar en Entorno de Desarrollo (con recarga en vivo):**
   ```bash
   npm run dev
   ```
   Abre el enlace provisto por la terminal (usualmente `http://localhost:5173`) en tu navegador web.

3. **Compilar para Producción:**
   ```bash
   npm run build
   ```
   Los archivos optimizados para hosting se generarán en la carpeta `dist/`, listos para subirse a plataformas como Vercel, Netlify o Firebase Hosting.

---

## Sitio en producción

**https://logika-cad29.web.app**

Documentación de Firestore (por qué la consola está vacía al inicio, colecciones y pruebas): [docs/FIRESTORE.md](docs/FIRESTORE.md)

Plan de producto (ruta de aprendizaje, rankings, salas Kahoot, grupos, BD futura): [docs/PLAN-PRODUCTO-Y-BD.md](docs/PLAN-PRODUCTO-Y-BD.md)

Implementación ruta + lecciones + fases siguientes: [docs/PLAN-RUTA-APRENDIZAJE-IMPLEMENTACION.md](docs/PLAN-RUTA-APRENDIZAJE-IMPLEMENTACION.md)

---

## Firebase (Firestore + Hosting)

1. Copia `.env.example` a `.env` y completa las variables `VITE_FIREBASE_*` (consola Firebase → Configuración del proyecto → Tu app web).
2. **No subas** `.env` ni el JSON `*firebase-adminsdk*.json` al repositorio; el Admin SDK es solo para backend/Cloud Functions.
3. Instala dependencias (incluye `firebase-tools` local para deploy):
   ```bash
   npm install
   ```
4. En la consola Firebase, crea la base de datos **Firestore** en modo producción y publica las reglas:
   ```bash
   npm run deploy:rules
   ```
   (usa `npx firebase`; no hace falta instalar Firebase CLI global)
5. Despliegue completo (build + hosting):
   ```bash
   npm run deploy
   ```
   La primera vez: `npx firebase login`

Colecciones usadas por la app:
- `school_leads` — colegio, nombre y grado del formulario de aventura
- `achievements` — medallas obtenidas (nombre + título del logro)
- `progress_snapshots` — respaldos opcionales de progreso invitado
