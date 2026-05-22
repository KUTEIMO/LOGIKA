/** Ruta colegio: primero enseñanza, luego reto (3 etapas) */
export const SCHOOL_ADVENTURE = [
  {
    step: 1,
    lessonTitle: 'Lección 1 · Decisiones con lógica',
    lessonBody: `
      <p>Los programas toman decisiones con reglas del tipo <strong>SI … ENTONCES …</strong>.</p>
      <p>Imagina un robot en un almacén:</p>
      <ul>
        <li><strong>p</strong> = «hay obstáculo»</li>
        <li><strong>q</strong> = «batería cargada»</li>
      </ul>
      <p>Regla: <em>avanza solo si NO hay obstáculo Y la batería está bien</em>. En símbolos: <code>~p ^ q</code>.</p>
      <p class="learn-tip">Si ambas condiciones se cumplen, la salida es «sí avanza». Eso es lógica proposicional aplicada a robots reales.</p>
    `,
    mascotLesson: '¡Hola! Soy Logiko. Primero te explico la idea y luego juegas un reto corto. ¡Vamos paso a paso!',
    challengeTitle: 'Reto 1 · ¿Qué hace el robot?',
    question:
      'El robot avanza <strong>solo si</strong> no hay obstáculo <strong>y</strong> la batería está cargada.<br><br>Obstáculo = <strong>FALSO</strong> (no hay). Batería = <strong>VERDADERO</strong> (cargada).<br><br>¿Qué debe hacer?',
    options: [
      { text: 'Avanzar', value: 'correct' },
      { text: 'Quedarse quieto', value: 'wrong' },
      { text: 'Apagarse por error', value: 'wrong' }
    ],
    explanation:
      'Con <code>~p ^ q</code>: sin obstáculo y con batería → la regla se cumple y el robot <strong>avanza</strong>. Así funcionan muchos programas de control.',
    mascotChallenge: '¡Tu turno! Lee con calma y elige la opción que tenga más sentido.'
  },
  {
    step: 2,
    lessonTitle: 'Lección 2 · Conjuntos en ciberseguridad',
    lessonBody: `
      <p>Un <strong>conjunto</strong> agrupa elementos: servidores Linux, servidores con virus, servidores con cortafuegos.</p>
      <p><strong>A ∩ B</strong> = están en A <em>y</em> en B (Linux con malware).</p>
      <p><strong>− C</strong> = quitar los que tienen cortafuegos activo.</p>
      <p class="learn-tip">Los filtros de seguridad en redes usan estas operaciones todo el tiempo.</p>
    `,
    mascotLesson: 'Los conjuntos no son solo números en círculos: son filtros de datos en la vida real.',
    challengeTitle: 'Reto 2 · Filtrar servidores',
    question:
      'Queremos servidores <strong>Linux con malware</strong>, pero <strong>sin</strong> cortafuegos activo.<br><br>¿Qué operación describe ese filtro?',
    options: [
      { text: '(A ∪ B) ∩ C', value: 'wrong' },
      { text: '(A ∩ B) − C', value: 'correct' },
      { text: 'A − B − C', value: 'wrong' }
    ],
    explanation:
      'Primero <code>A ∩ B</code> (Linux y malware). Luego restamos C (sin cortafuegos). ¡Eso es un filtro típico en seguridad!',
    mascotChallenge: 'Piensa en «qué grupo quiero» y «qué grupo quiero excluir».'
  },
  {
    step: 3,
    lessonTitle: 'Lección 3 · Rutas más rápidas (grafos)',
    lessonBody: `
      <p>Un <strong>grafo</strong> conecta puntos (nodos) con caminos (aristas). Cada camino tiene un <strong>peso</strong>: tiempo, distancia o ping.</p>
      <p>Los juegos online y Google Maps buscan el camino con <strong>menor suma de pesos</strong>, no siempre el camino con menos tramos.</p>
      <p class="learn-tip">Ruta A→B→D: 2 ms + 3 ms = <strong>5 ms</strong>. Ruta directa A→D: <strong>8 ms</strong>. ¿Cuál es mejor?</p>
    `,
    mascotLesson: '¡Última lección! Después viene el reto final y tu medalla si lo completas todo.',
    challengeTitle: 'Reto 3 · Mejor ruta de red',
    question:
      'Camino 1: A → D directo, ping <strong>8 ms</strong>.<br>Camino 2: A → B → D, pings <strong>2 ms</strong> + <strong>3 ms</strong>.<br><br>¿Qué ruta elegiría un algoritmo de camino mínimo?',
    options: [
      { text: 'A → B → D (total 5 ms)', value: 'correct' },
      { text: 'A → D directo (8 ms)', value: 'wrong' }
    ],
    explanation:
      '5 ms &lt; 8 ms. El algoritmo suma pesos; por eso a veces un camino con más saltos es más rápido.',
    mascotChallenge: '¡Último reto! Suma los tiempos y compara.'
  }
];
