/**
 * Leyendas de notación: solo los símbolos que aparecen en esa lección o escena.
 * Uso: colegio, invitados y bloques puntuales en la ruta completa.
 */

function notationRow(sym, name, meaning) {
  return `
    <tr>
      <td class="notation-sym"><code>${sym}</code></td>
      <td><strong>${name}</strong></td>
      <td class="notation-mean">${meaning}</td>
    </tr>
  `;
}

/** Cuadro «En esta lección usamos…» */
export function notationLegend(title, rows) {
  const body = rows
    .map((r) => notationRow(r.sym, r.name, r.meaning))
    .join('');
  return `
    <aside class="learn-notation-box" aria-label="Notación usada aquí">
      <p class="learn-notation-title">${title}</p>
      <table class="learn-notation-table">
        <thead><tr><th>Símbolo</th><th>Nombre</th><th>Qué significa aquí</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </aside>
  `;
}

/** Colegio / invitado — solo lo que sale en esa etapa */
export const N_SCHOOL = {
  adventure1: notationLegend('Notación de esta lección (léela antes de la fórmula)', [
    { sym: 'p', name: 'Proposición p', meaning: '«Hay obstáculo en el camino del robot».' },
    { sym: 'q', name: 'Proposición q', meaning: '«La batería del robot está cargada».' },
    { sym: '~', name: 'Negación (NO)', meaning: 'Va delante: <code>~p</code> = «NO hay obstáculo» (lo contrario de p).' },
    { sym: '^', name: 'Conjunción (Y)', meaning: 'Une dos ideas: ambas deben cumplirse. <code>~p ^ q</code> = sin obstáculo <em>y</em> con batería.' },
    { sym: 'V / F', name: 'Verdadero / Falso', meaning: 'Valor de cada proposición en un momento dado (como sí/no lógico).' }
  ]),

  adventure1_formula: `
    <p class="learn-formula-read">
      <strong>Regla en palabras:</strong> avanza solo si NO hay obstáculo Y la batería está bien.<br>
      <strong>Misma regla en notación LOGIKA:</strong> <code>~p ^ q</code>
      <span class="learn-formula-hint">(~ = no · ^ = y)</span>
    </p>
  `,

  adventure2: notationLegend('Notación de esta lección (conjuntos A, B, C)', [
    { sym: 'A', name: 'Conjunto A', meaning: 'Servidores <strong>Linux</strong>.' },
    { sym: 'B', name: 'Conjunto B', meaning: 'Servidores con <strong>malware</strong> detectado.' },
    { sym: 'C', name: 'Conjunto C', meaning: 'Servidores con <strong>cortafuegos</strong> activo.' },
    { sym: '∩', name: 'Intersección', meaning: '<code>A ∩ B</code> = están en A <em>y también</em> en B (Linux con virus).' },
    { sym: '−', name: 'Diferencia', meaning: '<code>… − C</code> = quitar los que están en C (excluir cortafuegos).' },
    { sym: '∪', name: 'Unión', meaning: '<code>A ∪ B</code> = todo lo de A o de B (aparece en el reto como opción incorrecta).' }
  ]),

  adventure2_formula: `
    <p class="learn-formula-read">
      <strong>Filtro pedido:</strong> Linux con malware, pero sin cortafuegos.<br>
      <strong>Notación:</strong> <code>(A ∩ B) − C</code> — primero <code>A ∩ B</code>, luego se resta C.
    </p>
  `,

  adventure3: notationLegend('Notación de esta lección (grafos y rutas)', [
    { sym: 'A, B, D', name: 'Nodos', meaning: 'Puntos de la red (origen, intermedio, destino).' },
    { sym: '→', name: 'Flecha / arista', meaning: 'Camino entre dos nodos (ej. A → B → D).' },
    { sym: 'ms', name: 'Milisegundos', meaning: '<strong>Peso</strong> del enlace: tiempo de ping (menos ms = más rápido).' },
    { sym: '8 ms, 5 ms', name: 'Suma de pesos', meaning: 'A→B→D = 2+3 = 5 ms total; se compara con A→D = 8 ms.' }
  ]),

  adventure3_formula: `
    <p class="learn-formula-read">
      <strong>Idea:</strong> no siempre el camino con menos flechas es el más rápido; se suman los <strong>ms</strong> de cada tramo.
    </p>
  `
};

/** Ruta completa — bloques por lección (progresivo) */
export const N = {
  logic_vars: notationLegend('Notación básica de proposiciones', [
    { sym: 'p, q, r', name: 'Variables proposicionales', meaning: 'Cada letra representa una frase que es V o F.' },
    { sym: 'V', name: 'Verdadero', meaning: 'La proposición se cumple en ese caso.' },
    { sym: 'F', name: 'Falso', meaning: 'La proposición no se cumple.' }
  ]),

  logic_connectors: notationLegend('Notación de conectores (módulo Lógica)', [
    { sym: '~', name: 'Negación', meaning: 'NO. <code>~p</code> invierte el valor de p.' },
    { sym: '^', name: 'Y (conjunción)', meaning: 'Ambas deben ser V. En código a veces se escribe <code>&&</code>.' },
    { sym: 'v', name: 'O (disyunción)', meaning: 'Al menos una V. No confundir con la letra p; es el símbolo <strong>v</strong> minúscula.' },
    { sym: '->', name: 'Condicional', meaning: 'Si… entonces. Solo es F cuando la primera es V y la segunda F.' },
    { sym: '<->', name: 'Bicondicional', meaning: 'Si y solo si. V cuando p y q tienen el mismo valor.' }
  ]),

  logic_truth: notationLegend('Notación en tablas de verdad', [
    { sym: 'p, q', name: 'Columnas de entrada', meaning: 'Todas las combinaciones V/F de las variables.' },
    { sym: 'Resultado', name: 'Columna final', meaning: 'Valor de la fórmula completa para esa fila.' },
    { sym: 'Tautología', name: 'Clasificación', meaning: 'Todas las filas del resultado son V.' },
    { sym: 'Contradicción', name: 'Clasificación', meaning: 'Todas las filas del resultado son F.' },
    { sym: 'Contingencia', name: 'Clasificación', meaning: 'Hay filas V y filas F en el resultado.' }
  ]),

  sets_basic: notationLegend('Notación de conjuntos', [
    { sym: '{ }', name: 'Llaves', meaning: 'Lista los elementos: A = {1, 2, 3}.' },
    { sym: '∈', name: 'Pertenece', meaning: '<code>3 ∈ A</code> = 3 está en A.' },
    { sym: '∉', name: 'No pertenece', meaning: '<code>9 ∉ A</code> = 9 no está en A.' },
    { sym: 'A, B', name: 'Nombres de conjuntos', meaning: 'Etiquetas de colecciones (números, servidores, etc.).' }
  ]),

  sets_ops: notationLegend('Notación de operaciones entre conjuntos', [
    { sym: '∪', name: 'Unión', meaning: 'A ∪ B = en A o en B (o en ambos).' },
    { sym: '∩', name: 'Intersección', meaning: 'A ∩ B = solo los que están en los dos.' },
    { sym: '−', name: 'Diferencia', meaning: 'A − B = los de A que no están en B.' },
    { sym: 'Δ', name: 'Diferencia simétrica', meaning: 'En uno u otro, pero no en la intersección.' }
  ]),

  graphs_basic: notationLegend('Notación de grafos', [
    { sym: 'Nodo', name: 'Vértice', meaning: 'Punto del grafo (A, B, C…).' },
    { sym: 'Arista', name: 'Enlace', meaning: 'Conexión entre dos nodos.' },
    { sym: 'Peso', name: 'Costo', meaning: 'Número en la arista (km, ms, dinero).' },
    { sym: '→', name: 'Dirección del camino', meaning: 'Orden al recorrer: A → B → D.' }
  ]),

  graphs_algo: notationLegend('Notación en algoritmos', [
    { sym: 'BFS', name: 'Búsqueda en anchura', meaning: 'Explora por capas; no usa pesos distintos.' },
    { sym: 'Dijkstra', name: 'Camino mínimo', meaning: 'Minimiza la <strong>suma de pesos</strong>.' }
  ]),

  relations_basic: notationLegend('Notación de relaciones', [
    { sym: '(a, b)', name: 'Par ordenado', meaning: '«a se relaciona con b». El orden importa.' },
    { sym: 'R', name: 'Relación', meaning: 'Conjunto de todos los pares que cumplen la regla.' },
    { sym: 'M[i,j]=1', name: 'Matriz', meaning: 'Fila i, columna j: hay relación de i hacia j.' }
  ]),

  relations_props: notationLegend('Propiedades (símbolos en pantalla)', [
    { sym: '(a,a)', name: 'Reflexiva', meaning: 'Todo elemento relacionado consigo mismo.' },
    { sym: '(a,b)(b,a)', name: 'Simétrica', meaning: 'Si va de a a b, también de b a a.' },
    { sym: '(a,b)(b,c)(a,c)', name: 'Transitiva', meaning: 'Cadena de dos saltos implica el salto directo a→c.' }
  ]),

  logic_programming: notationLegend('Notación: LOGIKA ↔ programación', [
    { sym: '&&', name: 'Y en código', meaning: 'Mismo sentido que <code>^</code> en una fórmula.' },
    { sym: '||', name: 'O en código', meaning: 'Mismo sentido que <code>v</code> (vé minúscula, no la letra p).' },
    { sym: '!', name: 'NO en código', meaning: 'Mismo sentido que <code>~</code> al inicio.' }
  ]),

  sets_sql: notationLegend('Notación: conjuntos ↔ filtros SQL', [
    { sym: 'WHERE', name: 'Condición', meaning: 'Selecciona un subconjunto de filas (como ∩).' },
    { sym: 'AND', name: 'Y lógico', meaning: 'Equivale a intersección ∩ entre condiciones.' },
    { sym: 'OR', name: 'O lógico', meaning: 'Equivale a unión ∪ entre condiciones.' },
    { sym: 'NOT', name: 'Negación', meaning: 'Excluye un subconjunto (como restar o complemento).' }
  ])
};
