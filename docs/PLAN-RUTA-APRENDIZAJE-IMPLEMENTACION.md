# Plan de implementación — Ruta de aprendizaje LOGIKA

## Objetivo

Que ningún estudiante llegue a retos o simuladores **sin haber visto la teoría didáctica**, y que el progreso quede organizado en **tres niveles por módulo**, visible solo para usuarios con sesión en **Mi ruta**.

---

## Modelo pedagógico (por módulo)

```text
Nivel 1 · APRENDER (lecciones en pantalla)
    ↓ obligatorio
Nivel 2 · PRACTICAR (herramientas actuales: tablas, Venn, grafos, matrices)
    ↓ requisitos de práctica cumplidos
Nivel 3 · CERTIFICADO (PNG invitado / PDF con sesión)
```

### Estado actual (Fase A — implementada)

| Pieza | Archivo | Estado |
|-------|---------|--------|
| Lecciones por módulo (3 cada uno) | `src/config/module-lessons.js` | ✅ |
| Pestañas Aprender / Practicar | `src/components/module-learn.js` | ✅ |
| Bloqueo práctica hasta lecciones | `module-learn.js` | ✅ |
| Vista **Mi ruta** (solo login) | `learning-route-view` + `learning-route-ui.js` | ✅ |
| Vista **Mi perfil** (solo login) | `profile-view` + `profile-ui.js` | ✅ |
| Dashboard invitado sin ruta | `dashboard-ui.js` | ✅ |
| Certificado exige lecciones + práctica | `certificates.js` | ✅ |

---

## Progreso almacenado (`logika_module_progress`)

Por módulo (`logic`, `sets`, `graphs`, `relations`):

```json
{
  "lessonsCompleted": ["l1", "l2", "l3"],
  "learnComplete": true,
  "currentPhase": "learn|practice",
  "tablesGenerated": 0,
  "quizzesCorrect": 0,
  ...
}
```

Cálculo en **Mi ruta**:

- **Aprendizaje %** = lecciones hechas / total  
- **Práctica %** = requisitos del módulo (ver `learning-path.js`)  
- **Total mostrado** ≈ 40% aprendizaje + 60% práctica  

---

## Fase B — Contenido didáctico ampliado (siguiente sprint)

1. **Más lecciones** (5–7 por módulo) con:
   - Diagramas SVG inline  
   - Preguntas de comprensión (sin revelar respuesta en toast)  
   - Mini-quiz al final de cada lección (+10 XP)  
2. **Videos o animaciones** (opcional, URLs embebidas)  
3. **Glosario** por módulo en panel lateral  

Archivos: ampliar `module-lessons.js`, nuevo `lesson-quiz.js`.

---

## Fase C — Ruta global y desbloqueos

1. Módulo 2 bloqueado hasta certificado módulo 1 (ya parcial en UI de ruta).  
2. Enforzar en `openModule()` con toast si intenta saltar.  
3. Mapa visual tipo “camino” (nodos conectados) en `learning-route-view`.  

---

## Fase D — Práctica por niveles dentro del módulo

Dividir **Practicar** en sub-niveles:

| Sub-nivel | Lógica | Conjuntos | Grafos | Relaciones |
|-----------|--------|-----------|--------|------------|
| Guiado | Tabla con fórmula ejemplo | Calcular con datos fijos | Grafo demo + BFS | Matriz precargada |
| Libre | Tablas propias | Venn libre + coloreado | Grafo editable | Pares libres |
| Reto | Clasificar sin pistas | Coloreado aleatorio | Dijkstra examen | Equivalencia |

Reutilizar código actual en sub-pestañas dentro de `#*-practice-zone`.

---

## Fase E — Firebase Auth + sincronización de ruta

1. `users/{uid}/modules/{moduleId}` espejo de `logika_module_progress`.  
2. Al login, merge local → nube.  
3. Mi ruta lee de Firestore si hay sesión (fallback local offline).  

Colecciones: ver `PLAN-PRODUCTO-Y-BD.md`.

---

## Fase F — Rankings y salas (después de ruta estable)

No mezclar con lecciones hasta Fase E cerrada:

- Rankings leen XP de `users`  
- Salas Kahoot usan `question_bank` alineado a lecciones  

---

## Criterios de “módulo completo” (certificado)

Definidos en `src/config/learning-path.js`:

| Módulo | Lecciones | Práctica |
|--------|-----------|----------|
| Lógica | 3/3 | 3 tablas + 2 quizzes correctos |
| Conjuntos | 3/3 | 2 cálculos + 2 coloreados OK |
| Grafos | 3/3 | 1 Dijkstra + 1 BFS |
| Relaciones | 3/3 | 4 verificaciones de propiedades |

---

## QA manual

1. **Invitado:** entra a módulo → solo pestaña Aprender habilitada al inicio → completa lecciones → Practicar se desbloquea. No ve “Mi ruta” en menú.  
2. **Login:** aparecen Mi ruta y Mi perfil; Mi ruta muestra 3 niveles por módulo.  
3. **Certificado:** solo tras lecciones + práctica; no tras un solo mini-reto.  
4. **Dashboard:** invitado no ve ruta embebida; logueado ve enlaces a Mi ruta / perfil.  

---

## Despliegue

```bash
npm run build
npm run deploy:hosting
```

---

## Resumen para stakeholders

LOGIKA deja de ser “solo juegos”: primero **enseña**, luego **practica**, luego **certifica**. La ruta y el perfil son el incentivo para **registrarse**; el modo invitado sigue pudiendo estudiar en el dispositivo local.
