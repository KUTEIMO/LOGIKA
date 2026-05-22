/** Lecciones didácticas por módulo — texto detallado + notación progresiva + visuales */
import { LV } from './learn-visuals.js';
import { N } from './learn-notation.js';

export const MODULE_LESSONS = {
  logic: [
    {
      id: 'l1',
      title: '¿Qué es una proposición?',
      body: `
        <p>En matemáticas discretas y en programación necesitamos frases cuyo valor sea <strong>claro</strong>: verdadero o falso. Eso es una <strong>proposición</strong>.</p>
        <h4 class="learn-subtitle">Definición paso a paso</h4>
        <ol class="learn-steps">
          <li>Es una oración afirmativa (no pregunta, no orden, no exclamación).</li>
          <li>En un momento dado se puede decidir si es <strong>V (verdadera)</strong> o <strong>F (falsa)</strong>.</li>
          <li>No puede ser las dos a la vez ni quedar «sin definir».</li>
        </ol>
        ${LV.logic_prop}
        <h4 class="learn-subtitle">Ejemplos que debes distinguir</h4>
        <ul>
          <li><strong>Proposición:</strong> «El servidor está encendido» — hoy V, mañana podría ser F.</li>
          <li><strong>Proposición:</strong> «2 + 2 = 5» — siempre F (sigue siendo proposición).</li>
          <li><strong>No es proposición:</strong> «Cierra la puerta» (orden).</li>
          <li><strong>No es proposición:</strong> «x + 1 = 3» si no sabemos qué es x (no está fijado).</li>
        </ul>
        ${N.logic_vars}
        <p>En LOGIKA usamos letras <code>p</code>, <code>q</code>, <code>r</code> en lugar de escribir la frase completa cada vez. Cada letra es una proposición con valor <strong>V</strong> o <strong>F</strong> en el momento que evaluamos.</p>
        <p class="learn-tip"><strong>Siguiente lección:</strong> verás los símbolos <code>~</code>, <code>^</code>, <code>v</code> para combinar proposiciones (no confundir la letra <code>p</code> con el conector <code>v</code> de «o»).</p>
      `
    },
    {
      id: 'l2',
      title: 'Conectores lógicos',
      body: `
        <p>Solas las proposiciones bastan poco. Los <strong>conectores</strong> permiten armar frases compuestas, igual que en un <code>if</code> de programación.</p>
        ${N.logic_connectors}
        <p class="learn-formula-read"><strong>Importante en LOGIKA:</strong> el símbolo <code>^</code> (acento circunflejo) significa <strong>Y</strong>. No es la letra «x». El símbolo <code>v</code> (vé minúscula) significa <strong>O</strong>; no es la variable <code>p</code>.</p>
        ${LV.logic_connectors}
        <h4 class="learn-subtitle">Tabla de referencia (lee el símbolo en voz alta)</h4>
        <table class="learn-mini-table">
          <tr><th>Símbolo</th><th>Lectura</th><th>Resultado V cuando…</th></tr>
          <tr><td><code>~p</code></td><td>NO p</td><td>p era F (invierte)</td></tr>
          <tr><td><code>p ^ q</code></td><td>p Y q</td><td><strong>ambas</strong> son V</td></tr>
          <tr><td><code>p v q</code></td><td>p O q</td><td><strong>al menos una</strong> es V</td></tr>
          <tr><td><code>p -&gt; q</code></td><td>si p entonces q</td><td>solo F si p=V y q=F (promesa rota)</td></tr>
          <tr><td><code>p &lt;-&gt; q</code></td><td>p si y solo si q</td><td>p y q tienen el <strong>mismo</strong> valor</td></tr>
        </table>
        <h4 class="learn-subtitle">Ejemplo numérico con p y q</h4>
        <p>Sea <strong>p = V</strong> (hay conexión) y <strong>q = F</strong> (no hay respaldo).</p>
        <ul>
          <li><code>~p</code> = F</li>
          <li><code>p ^ q</code> = F (no están las dos en V)</li>
          <li><code>p v q</code> = V (al menos p es V)</li>
          <li><code>p -&gt; q</code> = F (p prometió q y q falló)</li>
        </ul>
        <p class="learn-tip">En <strong>Practicar</strong> usa el teclado virtual. Para bicondicional escribe <code>&lt;-&gt;</code> o pulsa el botón ↔ (evita escribir solo <code>&lt;</code>).</p>
      `
    },
    {
      id: 'l3',
      title: 'Tablas de verdad y clasificación',
      body: `
        <p>¿Cómo saber si una fórmula compuesta es siempre verdadera, siempre falsa o depende de los valores? Se construye la <strong>tabla de verdad</strong>: se listan <strong>todas</strong> las combinaciones de V/F de las variables y se calcula el resultado.</p>
        ${N.logic_truth}
        <h4 class="learn-subtitle">¿Cuántas filas hay?</h4>
        <p>Con <strong>n</strong> variables, hay <strong>2ⁿ</strong> filas. Ejemplo: p y q → 2² = 4 filas.</p>
        ${LV.logic_truth_table}
        <h4 class="learn-subtitle">Clasificación del resultado final (columna derecha)</h4>
        <ul>
          <li><strong>Tautología:</strong> todas las filas dan V → siempre verdadera (ej. <code>p v ~p</code>).</li>
          <li><strong>Contradicción:</strong> todas las filas dan F → siempre falsa (ej. <code>p ^ ~p</code>).</li>
          <li><strong>Contingencia:</strong> aparecen V y F → depende de los valores (lo más habitual).</li>
        </ul>
        <p>En LOGIKA primero generas la tabla en <strong>Practicar</strong>; el mini-reto te pide clasificar. La tabla es evidencia: debes <strong>leerla</strong>, no adivinar.</p>
        <p class="learn-tip">Si todas las filas de «Resultado» son V → tautología. Si todas son F → contradicción. Si hay mezcla → contingencia.</p>
      `
    }
  ],
  sets: [
    {
      id: 's1',
      title: 'Conjuntos y diagrama de Venn',
      body: `
        <p>Un <strong>conjunto</strong> es una colección de objetos distintos llamados <strong>elementos</strong>. Se escribe entre llaves: A = {1, 2, 3, 4, 5}.</p>
        ${N.sets_basic}
        <h4 class="learn-subtitle">Pertenencia (cómo leerlo)</h4>
        <p><strong>3 ∈ A</strong> se lee «3 pertenece a A». <strong>9 ∉ A</strong> se lee «9 no pertenece a A».</p>
        <p>Ejemplo: 4 ∈ A (sí), 9 ∉ A (no está en la lista).</p>
        ${LV.sets_venn_basic}
        <h4 class="learn-subtitle">Diagrama de Venn (para qué sirve)</h4>
        <p>Cada círculo es un conjunto. Cada región del dibujo representa «solo A», «solo B», «A y B a la vez», etc. Colocar un número en la región correcta es <strong>traducir</strong> la operación a un dibujo.</p>
        <p class="learn-tip">No memorices solo la fórmula: mira <strong>dónde cae cada elemento</strong> en el diagrama. Eso es lo que harás al colorear en Practicar.</p>
      `
    },
    {
      id: 's2',
      title: 'Operaciones: unión, intersección, diferencia',
      body: `
        <p>Con dos conjuntos A y B definimos operaciones que producen otro conjunto (otra lista de elementos).</p>
        ${N.sets_ops}
        ${LV.sets_operations}
        <h4 class="learn-subtitle">Definiciones con palabras (misma notación)</h4>
        <ul>
          <li><strong>Unión A ∪ B:</strong> todo elemento que está en A <em>o</em> en B (o en ambos). «O» inclusivo.</li>
          <li><strong>Intersección A ∩ B:</strong> solo los que están en los <em>dos</em> a la vez.</li>
          <li><strong>Diferencia A − B:</strong> los de A que <em>no</em> están en B.</li>
          <li><strong>Diferencia simétrica A Δ B:</strong> los que están en uno solo, pero no en la intersección.</li>
        </ul>
        <h4 class="learn-subtitle">Mismo ejemplo numérico</h4>
        <p>A = {1,2,3,4,5}, B = {4,5,6,7,8}.</p>
        <ul>
          <li>A ∪ B = {1,2,3,4,5,6,7,8}</li>
          <li>A ∩ B = {4,5}</li>
          <li>A − B = {1,2,3}</li>
          <li>A Δ B = {1,2,3,6,7,8}</li>
        </ul>
        <p class="learn-tip">Calcula primero con números; luego en el diagrama colorea la región que corresponde a la operación pedida.</p>
      `
    },
    {
      id: 's3',
      title: 'Aprender y luego colorear',
      body: `
        <p>El módulo tiene dos momentos complementarios. Primero entiendes y calculas; después demuestras que reconoces la región en el Venn.</p>
        ${LV.sets_practice_flow}
        <h4 class="learn-subtitle">Errores comunes</h4>
        <ul>
          <li>Confundir <strong>∪</strong> (todo junto) con <strong>∩</strong> (solo el centro).</li>
          <li>Olvidar que A − B <strong>no</strong> incluye elementos que solo están en B.</li>
          <li>Colorear todo el círculo de A cuando solo pedían la intersección.</li>
        </ul>
        <p>Si vuelves a <strong>Repasar</strong> desde Practicar, el ejercicio de coloreado se reinicia (nueva operación aleatoria).</p>
        <p class="learn-tip">Usa la lista del paso 1 para verificar mentalmente antes de pintar en el paso 2.</p>
      `
    }
  ],
  graphs: [
    {
      id: 'g1',
      title: 'Nodos, aristas y pesos',
      body: `
        <p>Un <strong>grafo</strong> modela redes del mundo real: ciudades, routers, páginas web, estados de un juego.</p>
        ${N.graphs_basic}
        <ul>
          <li><strong>Nodo (vértice):</strong> un punto, un lugar, un estado.</li>
          <li><strong>Arista:</strong> una conexión entre dos nodos (puede ser de ida o bidireccional según el problema).</li>
          <li><strong>Peso:</strong> costo de usar esa arista (km, tiempo, dinero, ping en ms).</li>
        </ul>
        ${LV.graphs_basic}
        <h4 class="learn-subtitle">Idea clave</h4>
        <p>El camino con <strong>menos aristas</strong> no siempre es el más barato. Hay que <strong>sumar pesos</strong> del camino completo.</p>
        <p class="learn-tip">En Practicar puedes arrastrar nodos y crear aristas. El ejemplo inicial ya trae pesos para experimentar.</p>
      `
    },
    {
      id: 'g2',
      title: 'BFS — explorar en oleadas',
      body: `
        <p><strong>BFS</strong> (Breadth-First Search, búsqueda en anchura) explora el grafo por <strong>capas</strong> desde un nodo origen. En notación: se marca cada nodo con su <strong>distancia en saltos</strong> desde el origen (capa 0, 1, 2…).</p>
        <h4 class="learn-subtitle">Proceso en palabras</h4>
        <ol class="learn-steps">
          <li>Visita el origen (capa 0).</li>
          <li>Visita todos sus vecinos directos (capa 1), sin repetir nodos ya vistos.</li>
          <li>Desde cada nodo de capa 1, visita sus vecinos nuevos (capa 2).</li>
          <li>Continúa hasta no tener nodos nuevos.</li>
        </ol>
        ${LV.graphs_bfs}
        <h4 class="learn-subtitle">¿Para qué sirve?</h4>
        <ul>
          <li>Saber si hay conexión entre dos puntos.</li>
          <li>Obtener el orden de descubrimiento (útil en redes sociales «a 1 paso, a 2 pasos…»).</li>
          <li>Camino con <strong>mínimo número de saltos</strong> si todos los pesos son iguales.</li>
        </ul>
        <p class="learn-tip">BFS <strong>no usa</strong> pesos distintos en cada arista para decidir el orden; solo la estructura de conexiones.</p>
      `
    },
    {
      id: 'g3',
      title: 'Dijkstra — el camino más barato',
      body: `
        <p><strong>Dijkstra</strong> calcula el camino de <strong>menor costo total</strong> (suma de <strong>pesos</strong> en las aristas) desde un origen hasta un destino. Notación habitual: <code>d(v)</code> = distancia mínima acumulada hasta el nodo <code>v</code>.</p>
        ${LV.graphs_dijkstra}
        <h4 class="learn-subtitle">Idea (sin fórmula pesada)</h4>
        <ol class="learn-steps">
          <li>Empieza en el origen con costo 0.</li>
          <li>Revisa vecinos y guarda el costo acumulado por cada camino conocido.</li>
          <li>Elige el nodo pendiente con menor costo acumulado y repite.</li>
          <li>Cuando llegas al destino, esa es la suma mínima (con pesos positivos).</li>
        </ol>
        <p>Es la base de GPS, rutas en juegos y enrutamiento de paquetes en redes.</p>
        <p class="learn-tip">Compara en Practicar: mismo grafo, ejecuta BFS y luego Dijkstra y lee el log de cada uno.</p>
      `
    }
  ],
  relations: [
    {
      id: 'r1',
      title: 'Relaciones y pares ordenados',
      body: `
        ${N.relations_basic}
        <p>Una <strong>relación R</strong> sobre un conjunto A es un conjunto de <strong>pares ordenados</strong> (a, b) con a, b ∈ A.</p>
        <p>Leer <code>(a, b)</code> como: «a se relaciona con b». El orden importa: <code>(1, 2) ≠ (2, 1)</code> salvo casos especiales.</p>
        ${LV.rel_pairs}
        <h4 class="learn-subtitle">Matriz de relación</h4>
        <p>Fila = primer elemento, columna = segundo. Un <strong>1</strong> en la celda (i, j) significa que sí existe el par. Cero = no hay relación.</p>
        <p>La matriz y la lista de pares son la <strong>misma información</strong> en dos formatos.</p>
        <p class="learn-tip">En Practicar puedes escribir pares como (1,2), (2,3) o marcar celdas en la cuadrícula.</p>
      `
    },
    {
      id: 'r2',
      title: 'Propiedades: reflexiva, simétrica, transitiva',
      body: `
        <p>No toda relación «se comporta bien». Estas propiedades describen patrones que aparecen en matemáticas y en sistemas reales.</p>
        ${N.relations_props}
        ${LV.rel_properties}
        <h4 class="learn-subtitle">Cómo comprobarlas (método)</h4>
        <ul>
          <li><strong>Reflexiva:</strong> para cada elemento x debe existir (x, x). En la matriz, la diagonal principal son 1.</li>
          <li><strong>Simétrica:</strong> por cada (a, b) debe existir (b, a). La matriz es espejo en diagonal.</li>
          <li><strong>Transitiva:</strong> si (a,b) y (b,c) están, debe estar (a,c). Hay que revisar cadenas.</li>
          <li><strong>Antisimétrica:</strong> si (a,b) y (b,a) coexisten, entonces a = b.</li>
        </ul>
        <p class="learn-tip">LOGIKA te mostrará Sí/No por propiedad al pulsar calcular. Intenta predecir antes de mirar el resultado.</p>
      `
    },
    {
      id: 'r3',
      title: 'Relación de equivalencia',
      body: `
        <p>Si una relación es <strong>reflexiva, simétrica y transitiva</strong> a la vez, se llama <strong>relación de equivalencia</strong>.</p>
        ${LV.rel_equivalence}
        <h4 class="learn-subtitle">¿Qué significa en la práctica?</h4>
        <p>Agrupa elementos en <strong>clases de equivalencia</strong>: todos los que están «relacionados» entre sí forman un grupo.</p>
        <ul>
          <li>«Misma ciudad de nacimiento» — equivalencia.</li>
          <li>«Es hermano de» — suele ser simétrica pero no transitiva (no sirve cadena de hermanos como equivalencia global).</li>
          <li>«Es mayor que» — no es simétrica ni reflexiva.</li>
        </ul>
        <p>En Practicar verás un indicador si tu relación es de equivalencia.</p>
      `
    }
  ]
};

/** Solo con sesión iniciada — profundización */
export const MODULE_LESSONS_EXTENDED = {
  logic: [
    {
      id: 'l4',
      title: 'Aplicación: decisiones en software',
      body: `
        <p>La lógica proposicional no es abstracta: es el corazón de las condiciones en programación.</p>
        ${N.logic_programming}
        ${LV.logic_software}
        <h4 class="learn-subtitle">De Morgan (muy usado al negar condiciones)</h4>
        <p><code>~(p ^ q)</code> equivale a <code>~p v ~q</code>. Negar «A y B» es «no A o no B».</p>
        <p><code>~(p v q)</code> equivale a <code>~p ^ ~q</code>.</p>
        <h4 class="learn-subtitle">Por qué importa en ingeniería</h4>
        <p>Cada <code>if</code> que escribes es una fila (o combinación de filas) de una tabla de verdad. Probar casos V/F ayuda a encontrar bugs antes de desplegar.</p>
        <p class="learn-tip">Prueba en el módulo la fórmula <code>~(p ^ q) &lt;-&gt; (~p v ~q)</code> y confirma que es tautología.</p>
      `
    }
  ],
  sets: [
    {
      id: 's4',
      title: 'Conjuntos en datos y filtros',
      body: `
        <p>En bases de datos y hojas de cálculo filtras filas que cumplen condiciones. Eso es álgebra de conjuntos disfrazada.</p>
        ${N.sets_sql}
        ${LV.sets_db}
        <h4 class="learn-subtitle">Traducción mental</h4>
        <ul>
          <li>Tabla completa = universo U.</li>
          <li>WHERE condición 1 = subconjunto A.</li>
          <li>AND = intersección ∩.</li>
          <li>OR = unión ∪.</li>
          <li>NOT = complemento respecto al universo considerado.</li>
        </ul>
        <p class="learn-tip">Antes del desafío de coloreado, imagina el filtro SQL y luego pinta la región equivalente.</p>
      `
    }
  ],
  graphs: [
    {
      id: 'g4',
      title: 'Cuándo usar BFS o Dijkstra',
      body: `
        <p>Elegir el algoritmo correcto ahorra tiempo y errores en proyectos reales.</p>
        ${N.graphs_algo}
        ${LV.graphs_algo_pick}
        <table class="learn-mini-table">
          <tr><th>Situación</th><th>Algoritmo</th></tr>
          <tr><td>Todos los tramos cuestan «1» (misma distancia)</td><td>BFS</td></tr>
          <tr><td>Cada tramo tiene costo distinto (km, ms)</td><td>Dijkstra</td></tr>
          <tr><td>Solo preguntar «¿está conectado?»</td><td>BFS alcanza</td></tr>
          <tr><td>Ruta más barata entre dos puntos</td><td>Dijkstra</td></tr>
        </table>
        <p class="learn-tip">Construye un grafo pequeño con 4–5 nodos y ejecuta ambos; observa cómo cambia el log.</p>
      `
    }
  ],
  relations: [
    {
      id: 'r4',
      title: 'Relaciones en bases de datos y redes',
      body: `
        <p>Las relaciones entre tablas en SQL y las matrices en LOGIKA comparten la misma idea: quién se conecta con quién.</p>
        ${LV.rel_db}
        <h4 class="learn-subtitle">Clave foránea</h4>
        <p><code>id_alumno</code> en la tabla Matrícula apunta a un alumno: es un par (alumno, curso) en una relación muchos-a-muchos modelada con tablas.</p>
        <h4 class="learn-subtitle">Equivalencia en datos</h4>
        <p>Agrupar por «mismo código postal» particiona clientes en clases — igual que las cajas del diagrama de equivalencia.</p>
        <p class="learn-tip">Edita la matriz, predice reflexiva/simétrica/transitiva y luego verifica con el botón calcular.</p>
      `
    }
  ]
};
