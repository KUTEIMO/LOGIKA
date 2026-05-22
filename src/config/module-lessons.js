/** Lecciones didácticas por módulo — completar antes de practicar */
export const MODULE_LESSONS = {
  logic: [
    {
      id: 'l1',
      title: '¿Qué es una proposición?',
      body: `<p>Una <strong>proposición</strong> es una oración que puede ser <em>verdadera (V)</em> o <em>falsa (F)</em>, pero no ambas a la vez.</p>
      <p>En LOGIKA usamos variables <code>p</code>, <code>q</code>, <code>r</code> para representar proposiciones.</p>
      <ul><li>Ejemplo válido: «Hoy llueve» (puede ser V o F).</li><li>No es proposición: «¿Qué hora es?» (es pregunta).</li></ul>`
    },
    {
      id: 'l2',
      title: 'Conectores lógicos',
      body: `<p><strong>Negación (~):</strong> invierte el valor. Si p es V, ~p es F.</p>
      <p><strong>Conjunción (^):</strong> «p y q» — solo es V si ambas son V.</p>
      <p><strong>Disyunción (v):</strong> «p o q» — es V si al menos una es V.</p>
      <p><strong>Condicional (->):</strong> «si p entonces q». Solo es F cuando p es V y q es F.</p>
      <p><strong>Bicondicional (&lt;-&gt;):</strong> «p si y solo si q» — V cuando p y q tienen el mismo valor.</p>`
    },
    {
      id: 'l3',
      title: 'Tablas de verdad',
      body: `<p>Una <strong>tabla de verdad</strong> lista todas las combinaciones de V/F de las variables y el resultado de la fórmula.</p>
      <p>Con 2 variables hay 4 filas; con 3 variables, 8 filas.</p>
      <p><strong>Clasificación:</strong></p>
      <ul><li><strong>Tautología:</strong> siempre V.</li><li><strong>Contradicción:</strong> siempre F.</li><li><strong>Contingencia:</strong> mezcla de V y F.</li></ul>`
    }
  ],
  sets: [
    {
      id: 's1',
      title: 'Conjuntos y notación',
      body: `<p>Un <strong>conjunto</strong> es una colección de elementos distintos. Lo escribimos A = {1, 2, 3}.</p>
      <p><strong>Pertenencia:</strong> 2 ∈ A significa que 2 está en A.</p>
      <p>En diagramas de Venn, cada círculo representa un conjunto y los números se ubican en la región correcta.</p>`
    },
    {
      id: 's2',
      title: 'Operaciones entre conjuntos',
      body: `<p><strong>Unión (A ∪ B):</strong> todo lo que está en A, en B, o en ambos.</p>
      <p><strong>Intersección (A ∩ B):</strong> solo lo que está en A y en B a la vez.</p>
      <p><strong>Diferencia (A − B):</strong> lo que está en A pero no en B.</p>
      <p><strong>Diferencia simétrica (A Δ B):</strong> lo que está en uno solo, no en la intersección.</p>`
    },
    {
      id: 's3',
      title: 'Del cálculo al coloreado',
      body: `<p>Primero <strong>calculas</strong> la operación con tus listas y ves qué elementos forman el resultado.</p>
      <p>Después, en el desafío, <strong>coloreas</strong> las regiones del diagrama que representan esa operación (sin mirar solo los números).</p>
      <p>Así conectas la idea abstracta con la imagen visual.</p>`
    }
  ],
  graphs: [
    {
      id: 'g1',
      title: 'Grafos: nodos y aristas',
      body: `<p>Un <strong>grafo</strong> tiene <strong>nodos</strong> (vértices) y <strong>aristas</strong> que los conectan.</p>
      <p>En redes reales: ciudades = nodos, carreteras = aristas. El <strong>peso</strong> puede ser distancia o tiempo.</p>`
    },
    {
      id: 'g2',
      title: 'BFS — explorar por capas',
      body: `<p><strong>BFS</strong> (búsqueda en anchura) visita primero los vecinos del origen, luego los vecinos de esos vecinos.</p>
      <p>Sirve para saber <em>en qué orden</em> se alcanzan nodos o si hay conexión entre dos puntos.</p>`
    },
    {
      id: 'g3',
      title: 'Dijkstra — camino más corto',
      body: `<p><strong>Dijkstra</strong> encuentra el camino de <strong>menor peso total</strong> entre dos nodos (con pesos ≥ 0).</p>
      <p>Es la base de GPS, rutas en juegos multijugador y redes de datos.</p>`
    }
  ],
  relations: [
    {
      id: 'r1',
      title: 'Relaciones en un conjunto',
      body: `<p>Una <strong>relación R</strong> sobre A es un conjunto de pares ordenados (a, b) con a, b ∈ A.</p>
      <p>La <strong>matriz de adyacencia</strong> marca con 1 si existe el par (fila → columna).</p>`
    },
    {
      id: 'r2',
      title: 'Propiedades fundamentales',
      body: `<p><strong>Reflexiva:</strong> todo elemento se relaciona consigo mismo (a,a).</p>
      <p><strong>Simétrica:</strong> si (a,b) entonces (b,a).</p>
      <p><strong>Transitiva:</strong> si (a,b) y (b,c) entonces (a,c).</p>
      <p><strong>Antisimétrica:</strong> si (a,b) y (b,a) solo cuando a = b.</p>`
    },
    {
      id: 'r3',
      title: 'Relación de equivalencia',
      body: `<p>Si una relación es <strong>reflexiva, simétrica y transitiva</strong>, es de <strong>equivalencia</strong>.</p>
      <p>Particiona el conjunto en clases (por ejemplo: «misma ciudad»).</p>`
    }
  ]
};

export function getLessonsForModule(moduleId) {
  return MODULE_LESSONS[moduleId] || [];
}
