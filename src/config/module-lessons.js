/** Lecciones didácticas por módulo — completar antes de practicar */
export const MODULE_LESSONS = {
  logic: [
    {
      id: 'l1',
      title: '¿Qué es una proposición?',
      body: `
        <p>Una <strong>proposición</strong> es una frase que puede clasificarse como <strong>verdadera (V)</strong> o <strong>falsa (F)</strong>, sin ambigüedad.</p>
        <ul>
          <li><strong>Sí es proposición:</strong> «Está lloviendo» (hoy puede ser V o F).</li>
          <li><strong>No lo es:</strong> «¿Qué hora es?» (es pregunta, no V/F).</li>
        </ul>
        <p>En LOGIKA usamos letras <code>p</code>, <code>q</code>, <code>r</code> como variables.</p>
        <p class="learn-tip">Piensa en interruptores: cada proposición es un switch que está encendido (V) o apagado (F).</p>
      `
    },
    {
      id: 'l2',
      title: 'Conectores lógicos',
      body: `
        <p>Combinamos proposiciones con <strong>conectores</strong>:</p>
        <table class="learn-mini-table">
          <tr><th>Símbolo</th><th>Nombre</th><th>Idea</th></tr>
          <tr><td><code>~</code></td><td>NO</td><td>Invierte V↔F</td></tr>
          <tr><td><code>^</code></td><td>Y</td><td>V solo si las dos son V</td></tr>
          <tr><td><code>v</code></td><td>O</td><td>V si al menos una es V</td></tr>
          <tr><td><code>-></code></td><td>Si… entonces</td><td>F solo cuando la primera es V y la segunda F</td></tr>
          <tr><td><code>&lt;-&gt;</code></td><td>Si y solo si</td><td>V cuando ambas iguales</td></tr>
        </table>
        <p class="learn-tip">Usa el teclado virtual en Practicar; el botón ↔ escribe <code>&lt;-&gt;</code> correctamente.</p>
      `
    },
    {
      id: 'l3',
      title: 'Tablas de verdad y clasificación',
      body: `
        <p>La <strong>tabla de verdad</strong> prueba todas las combinaciones de V/F y muestra el resultado final.</p>
        <ul>
          <li><strong>Tautología:</strong> siempre sale V (siempre verdadera).</li>
          <li><strong>Contradicción:</strong> siempre sale F.</li>
          <li><strong>Contingencia:</strong> mezcla de V y F (lo más común).</li>
        </ul>
        <p>En Practicar generarás la tabla y luego clasificarás el resultado en el mini-reto.</p>
        <p class="learn-tip">La tabla no te dice la respuesta del reto hasta que tú la interpretas.</p>
      `
    }
  ],
  sets: [
    {
      id: 's1',
      title: 'Conjuntos y diagrama de Venn',
      body: `
        <p>Un <strong>conjunto</strong> es una colección de elementos: A = {1, 2, 3, 4, 5}.</p>
        <p><strong>∈</strong> significa «pertenece»: 3 ∈ A.</p>
        <p>En el diagrama de Venn cada círculo es un conjunto; cada número va en la región donde corresponde (solo A, solo B, o en la intersección).</p>
        <p class="learn-tip">Primero entiendes la idea; en Practicar calcularás y luego colorearás regiones.</p>
      `
    },
    {
      id: 's2',
      title: 'Operaciones: unión, intersección, diferencia',
      body: `
        <p><strong>Unión A ∪ B:</strong> todo lo que está en A o en B (o en ambos).</p>
        <p><strong>Intersección A ∩ B:</strong> solo lo común a A y B.</p>
        <p><strong>Diferencia A − B:</strong> lo que está en A pero no en B.</p>
        <p><strong>Diferencia simétrica A Δ B:</strong> lo que está en uno u otro, pero no en los dos a la vez.</p>
        <p class="learn-tip">Ejemplo: A = {1,2,3,4,5}, B = {4,5,6,7,8} → A ∩ B = {4, 5}.</p>
      `
    },
    {
      id: 's3',
      title: 'Aprender y luego colorear',
      body: `
        <p>En Practicar hay <strong>dos pasos</strong>:</p>
        <ol>
          <li><strong>Calcular:</strong> escribes los elementos de A y B, eliges la operación y ves el resultado numérico.</li>
          <li><strong>Pon a prueba:</strong> coloreas en el diagrama la operación que te piden (sin mirar solo la lista).</li>
        </ol>
        <p>Si vuelves a Repasar, al regresar a Practicar el desafío de coloreado será nuevo.</p>
      `
    }
  ],
  graphs: [
    {
      id: 'g1',
      title: 'Nodos, aristas y pesos',
      body: `
        <p>Un <strong>grafo</strong> modela redes: nodos = lugares, aristas = conexiones, <strong>peso</strong> = costo (km, ms, dinero).</p>
        <p>Puedes crear tu propio grafo en Practicar o usar el ejemplo cargado.</p>
        <p class="learn-tip">Más aristas no siempre significa camino más corto: importa la suma de pesos.</p>
      `
    },
    {
      id: 'g2',
      title: 'BFS — explorar en oleadas',
      body: `
        <p><strong>BFS</strong> (búsqueda en anchura) explora «por capas»: primero vecinos del origen, luego vecinos de esos vecinos.</p>
        <p>Útil para: ¿hay conexión?, orden de visita, redes sociales cercanas.</p>
        <p class="learn-tip">En Practicar elige un nodo origen y ejecuta BFS para ver el orden en el log.</p>
      `
    },
    {
      id: 'g3',
      title: 'Dijkstra — el camino más barato',
      body: `
        <p><strong>Dijkstra</strong> encuentra el camino de <strong>menor peso total</strong> entre dos nodos (pesos ≥ 0).</p>
        <p>Base de GPS, rutas en videojuegos y tráfico de datos.</p>
        <p class="learn-tip">Compara con BFS: Dijkstra optimiza costo, no solo número de saltos.</p>
      `
    }
  ],
  relations: [
    {
      id: 'r1',
      title: 'Relaciones y pares ordenados',
      body: `
        <p>Una <strong>relación R</strong> en A es un conjunto de pares (a, b). Ejemplo: (1,1), (1,2), (2,2).</p>
        <p>La <strong>matriz</strong> es otra forma de ver lo mismo: fila = origen, columna = destino, 1 = sí hay par.</p>
        <p class="learn-tip">Puedes editar la matriz haciendo clic o escribir pares en el cuadro de texto.</p>
      `
    },
    {
      id: 'r2',
      title: 'Propiedades: reflexiva, simétrica, transitiva',
      body: `
        <ul>
          <li><strong>Reflexiva:</strong> todo se relaciona consigo mismo (a,a).</li>
          <li><strong>Simétrica:</strong> si (a,b) entonces (b,a).</li>
          <li><strong>Transitiva:</strong> si (a,b) y (b,c) entonces (a,c).</li>
          <li><strong>Antisimétrica:</strong> si (a,b) y (b,a) solo cuando a = b.</li>
        </ul>
        <p class="learn-tip">No todas las relaciones cumplen todo; depende del contexto (amistad, jerarquía, etc.).</p>
      `
    },
    {
      id: 'r3',
      title: 'Relación de equivalencia',
      body: `
        <p>Si es <strong>reflexiva + simétrica + transitiva</strong>, es una <strong>equivalencia</strong> (como «misma ciudad» o «mismo resto»).</p>
        <p>En Practicar verás si tu relación cumple cada propiedad y si es equivalencia.</p>
      `
    }
  ]
};

export function getLessonsForModule(moduleId) {
  return MODULE_LESSONS[moduleId] || [];
}
