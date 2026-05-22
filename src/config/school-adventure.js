/** Ruta colegio: primero enseñanza, luego reto (3 etapas) */
import { LV } from './learn-visuals.js';
import { N_SCHOOL } from './learn-notation.js';

export const SCHOOL_ADVENTURE = [
  {
    step: 1,
    lessonTitle: 'Lección 1 · Decisiones con lógica',
    lessonBody: `
      <p>Los programas toman decisiones con reglas del tipo <strong>SI … ENTONCES …</strong>. En esta lección verás cómo se escribe esa idea con <strong>letras y símbolos</strong>.</p>
      <p>Imagina un robot en un almacén. Definimos dos frases (proposiciones):</p>
      <ul>
        <li><strong>p</strong> = «hay obstáculo en el camino»</li>
        <li><strong>q</strong> = «la batería está cargada»</li>
      </ul>
      ${N_SCHOOL.adventure1}
      ${N_SCHOOL.adventure1_formula}
      ${LV.logic_software}
      <p class="learn-tip">En el reto: si <strong>p</strong> es FALSO (no hay obstáculo), entonces <code>~p</code> es verdadero. Con <code>^</code> hace falta que <strong>q</strong> también sea verdadero (batería cargada).</p>
    `,
    mascotLesson: 'Primero te enseño qué significa cada símbolo de la fórmula; después haces el reto.',
    challengeTitle: 'Reto 1 · ¿Qué hace el robot?',
    question: `
      <p><strong>Regla del robot:</strong> <code>~p ^ q</code> (sin obstáculo <strong>y</strong> batería cargada).</p>
      <ul class="learn-reto-legend">
        <li><code>~</code> = NO · <code>^</code> = Y</li>
        <li><strong>p</strong> = obstáculo · <strong>q</strong> = batería</li>
      </ul>
      <p>Obstáculo = <strong>FALSO</strong> (no hay). Batería = <strong>VERDADERO</strong> (cargada).</p>
      <p>¿Qué debe hacer el robot?</p>
    `,
    options: [
      { text: 'Avanzar', value: 'correct' },
      { text: 'Quedarse quieto', value: 'wrong' },
      { text: 'Apagarse por error', value: 'wrong' }
    ],
    explanation: `
      <p><code>~p</code> = NO hay obstáculo → con p=F, <code>~p</code> es <strong>verdadero</strong>.</p>
      <p><code>^ q</code> = Y además batería cargada → q es <strong>verdadero</strong>.</p>
      <p>Como <code>~p ^ q</code> se cumple, el robot <strong>avanza</strong>.</p>
    `,
    mascotChallenge: 'Recuerda: ~ niega · ^ exige las dos cosas. Elige con calma.'
  },
  {
    step: 2,
    lessonTitle: 'Lección 2 · Conjuntos en ciberseguridad',
    lessonBody: `
      <p>Un <strong>conjunto</strong> agrupa elementos. Aquí cada conjunto es un tipo de servidor:</p>
      <ul>
        <li><strong>A</strong> = servidores Linux</li>
        <li><strong>B</strong> = servidores con malware</li>
        <li><strong>C</strong> = servidores con cortafuegos activo</li>
      </ul>
      ${N_SCHOOL.adventure2}
      ${N_SCHOOL.adventure2_formula}
      ${LV.sets_operations}
      <p class="learn-tip">En el reto verás <code>(A ∩ B) − C</code>: primero «Linux y virus», luego «quitar los que tienen cortafuegos».</p>
    `,
    mascotLesson: 'Te explico solo los símbolos ∩, − y ∪ que aparecen en el filtro.',
    challengeTitle: 'Reto 2 · Filtrar servidores',
    question: `
      <p>Queremos: <strong>Linux con malware</strong>, pero <strong>sin</strong> cortafuegos activo.</p>
      <ul class="learn-reto-legend">
        <li><code>∩</code> = Y (en ambos conjuntos)</li>
        <li><code>− C</code> = quitar los de C</li>
        <li><code>∪</code> en una opción = O (unión, no es este caso)</li>
      </ul>
      <p>¿Qué notación describe ese filtro?</p>
    `,
    options: [
      { text: '(A ∪ B) ∩ C — unión de A y B, luego con C', value: 'wrong' },
      { text: '(A ∩ B) − C — Linux y malware, sin cortafuegos', value: 'correct' },
      { text: 'A − B − C — quitar B y C de A', value: 'wrong' }
    ],
    explanation: `
      <p><code>A ∩ B</code> = servidores que están en <strong>A y en B</strong> (Linux con malware).</p>
      <p><code>− C</code> = se <strong>excluyen</strong> los que están en C (sin cortafuegos activo).</p>
      <p>Por eso la respuesta es <code>(A ∩ B) − C</code>.</p>
    `,
    mascotChallenge: 'Piensa: ¿qué conjuntos quieres juntar (∩) y cuál quieres sacar (−)?'
  },
  {
    step: 3,
    lessonTitle: 'Lección 3 · Rutas más rápidas (grafos)',
    lessonBody: `
      <p>Un <strong>grafo</strong> conecta <strong>nodos</strong> (puntos) con <strong>aristas</strong> (caminos). El número en cada camino es el <strong>peso</strong> (aquí, ping en <strong>ms</strong>).</p>
      ${N_SCHOOL.adventure3}
      ${N_SCHOOL.adventure3_formula}
      ${LV.graphs_basic}
      <p class="learn-tip">Compara <strong>sumas</strong>: A→B→D = 2 ms + 3 ms = 5 ms frente a A→D directo = 8 ms.</p>
    `,
    mascotLesson: 'Última lección: nodos, flechas y milisegundos. Luego el reto final.',
    challengeTitle: 'Reto 3 · Mejor ruta de red',
    question: `
      <p>¿Qué ruta es más rápida según la <strong>suma de ms</strong>?</p>
      <ul class="learn-reto-legend">
        <li>Camino 1: <strong>A → D</strong> directo = <strong>8 ms</strong></li>
        <li>Camino 2: <strong>A → B → D</strong> = 2 ms + 3 ms</li>
      </ul>
    `,
    options: [
      { text: 'A → B → D (total 5 ms)', value: 'correct' },
      { text: 'A → D directo (8 ms)', value: 'wrong' }
    ],
    explanation: `
      <p>2 ms + 3 ms = <strong>5 ms</strong>, que es menor que 8 ms.</p>
      <p>El algoritmo de camino mínimo elige la suma de <strong>pesos</strong> más baja, no el camino con menos flechas.</p>
    `,
    mascotChallenge: 'Suma los ms de cada tramo antes de elegir.'
  }
];
