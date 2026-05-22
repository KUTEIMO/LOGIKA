/**
 * Cuadros visuales estáticos para lecciones (sin interacción — solo ilustración).
 * Usar dentro del HTML de module-lessons.js
 */
export const LV = {
  logic_prop: `
    <figure class="learn-visual" aria-label="Ejemplo de proposiciones">
      <figcaption class="learn-visual-caption">Vista gráfica: frase → valor V o F</figcaption>
      <div class="learn-visual-grid learn-visual-grid-2">
        <div class="learn-visual-card learn-visual-ok">
          <p class="learn-visual-label">Sí es proposición</p>
          <p class="learn-visual-quote">«Hoy hace frío en Cúcuta»</p>
          <div class="learn-switch-row">
            <span class="learn-switch learn-switch-on">V</span>
            <span class="learn-switch-hint">o</span>
            <span class="learn-switch learn-switch-off">F</span>
          </div>
          <p class="learn-visual-note">Un día es V, otro día es F — pero siempre tiene un valor definido.</p>
        </div>
        <div class="learn-visual-card learn-visual-no">
          <p class="learn-visual-label">No es proposición</p>
          <p class="learn-visual-quote">«¿Cuánto es 2 + 2?»</p>
          <div class="learn-switch-row">
            <span class="learn-switch learn-switch-na">?</span>
          </div>
          <p class="learn-visual-note">Es pregunta, no se puede marcar solo V o F.</p>
        </div>
      </div>
      <div class="learn-var-row">
        <span class="learn-var-chip">p</span>
        <span class="learn-var-chip">q</span>
        <span class="learn-var-chip">r</span>
        <span class="learn-visual-note">En LOGIKA usamos letras para representar proposiciones.</span>
      </div>
    </figure>
  `,

  logic_connectors: `
    <figure class="learn-visual" aria-label="Conectores lógicos ilustrados">
      <figcaption class="learn-visual-caption">Cómo combinan dos proposiciones (p y q)</figcaption>
      <div class="learn-connector-grid">
        <div class="learn-connector-item">
          <span class="learn-connector-sym">~p</span>
          <div class="learn-connector-bar"><span class="learn-bar-f">F</span><span class="learn-bar-arrow">→</span><span class="learn-bar-v">V</span></div>
          <span class="learn-connector-name">NO · invierte</span>
        </div>
        <div class="learn-connector-item">
          <span class="learn-connector-sym">p ^ q</span>
          <div class="learn-connector-venn-mini">
            <span class="learn-venn-dot learn-venn-both">V</span>
          </div>
          <span class="learn-connector-name">Y · las dos V</span>
        </div>
        <div class="learn-connector-item">
          <span class="learn-connector-sym">p v q</span>
          <div class="learn-connector-venn-mini learn-connector-or">
            <span class="learn-venn-dot">V</span><span class="learn-venn-dot">V</span>
          </div>
          <span class="learn-connector-name">O · al menos una V</span>
        </div>
        <div class="learn-connector-item">
          <span class="learn-connector-sym">p → q</span>
          <div class="learn-imply-diagram">
            <span class="learn-imply-from">p</span><span class="learn-imply-arrow">⇒</span><span class="learn-imply-to">q</span>
          </div>
          <span class="learn-connector-name">Si p entonces q</span>
        </div>
      </div>
    </figure>
  `,

  logic_truth_table: `
    <figure class="learn-visual" aria-label="Tabla de verdad ejemplo">
      <figcaption class="learn-visual-caption">Ejemplo: p → q (dos variables = 4 filas)</figcaption>
      <table class="learn-truth-table">
        <thead><tr><th>p</th><th>q</th><th>Resultado p→q</th></tr></thead>
        <tbody>
          <tr><td class="cell-v">V</td><td class="cell-v">V</td><td class="cell-v">V</td></tr>
          <tr><td class="cell-v">V</td><td class="cell-f">F</td><td class="cell-f">F</td></tr>
          <tr><td class="cell-f">F</td><td class="cell-v">V</td><td class="cell-v">V</td></tr>
          <tr><td class="cell-f">F</td><td class="cell-f">F</td><td class="cell-v">V</td></tr>
        </tbody>
      </table>
      <div class="learn-classify-row">
        <div class="learn-classify-box learn-classify-mix"><span>Contingencia</span><small>mezcla V y F</small></div>
        <div class="learn-classify-box learn-classify-allv"><span>Tautología</span><small>siempre V</small></div>
        <div class="learn-classify-box learn-classify-allf"><span>Contradicción</span><small>siempre F</small></div>
      </div>
    </figure>
  `,

  logic_software: `
    <figure class="learn-visual" aria-label="Lógica en código">
      <figcaption class="learn-visual-caption">La misma regla en español, símbolos y código</figcaption>
      <div class="learn-code-compare">
        <div class="learn-code-line"><span class="learn-code-tag">Regla</span> Avanzar si NO hay obstáculo Y batería cargada</div>
        <div class="learn-code-line"><span class="learn-code-tag">Lógica</span> <code>~p ^ q</code></div>
        <div class="learn-code-line"><span class="learn-code-tag">Código</span> <code>if (!obstaculo &amp;&amp; bateria) avanzar();</code></div>
      </div>
    </figure>
  `,

  sets_venn_basic: `
    <figure class="learn-visual" aria-label="Diagrama de Venn">
      <figcaption class="learn-visual-caption">A = {1,2,3,4,5} · B = {4,5,6,7,8}</figcaption>
      <svg class="learn-svg-venn" viewBox="0 0 320 200" role="img" aria-hidden="true">
        <ellipse cx="115" cy="100" rx="78" ry="62" class="venn-circle-a"/>
        <ellipse cx="205" cy="100" rx="78" ry="62" class="venn-circle-b"/>
        <text x="70" y="98" class="venn-label">solo A</text>
        <text x="95" y="72" class="venn-num">1 2 3</text>
        <text x="155" y="98" class="venn-label-center">A ∩ B</text>
        <text x="150" y="118" class="venn-num-center">4 5</text>
        <text x="235" y="98" class="venn-label">solo B</text>
        <text x="218" y="72" class="venn-num">6 7 8</text>
      </svg>
      <p class="learn-visual-note"><strong>∈</strong> significa «pertenece»: 3 ∈ A (sí), 6 ∉ A (no está en A).</p>
    </figure>
  `,

  sets_operations: `
    <figure class="learn-visual" aria-label="Operaciones de conjuntos">
      <figcaption class="learn-visual-caption">Misma pareja A y B — distintas operaciones (regiones sombreadas)</figcaption>
      <div class="learn-ops-grid">
        <div class="learn-op-card">
          <p class="learn-op-title">A ∪ B (unión)</p>
          <svg viewBox="0 0 120 80" class="learn-svg-mini"><ellipse cx="45" cy="40" rx="32" ry="26" class="venn-fill"/><ellipse cx="75" cy="40" rx="32" ry="26" class="venn-fill"/></svg>
          <p class="learn-op-result">{1,2,3,4,5,6,7,8}</p>
        </div>
        <div class="learn-op-card">
          <p class="learn-op-title">A ∩ B (intersección)</p>
          <svg viewBox="0 0 120 80" class="learn-svg-mini"><ellipse cx="45" cy="40" rx="32" ry="26" class="venn-stroke"/><ellipse cx="75" cy="40" rx="32" ry="26" class="venn-stroke"/><path d="M60 18 Q60 40 60 62" class="venn-lens-fill"/></svg>
          <p class="learn-op-result">{4, 5}</p>
        </div>
        <div class="learn-op-card">
          <p class="learn-op-title">A − B (diferencia)</p>
          <svg viewBox="0 0 120 80" class="learn-svg-mini"><ellipse cx="45" cy="40" rx="32" ry="26" class="venn-fill"/><ellipse cx="75" cy="40" rx="32" ry="26" class="venn-stroke"/></svg>
          <p class="learn-op-result">{1,2,3}</p>
        </div>
        <div class="learn-op-card">
          <p class="learn-op-title">A Δ B (simétrica)</p>
          <svg viewBox="0 0 120 80" class="learn-svg-mini"><ellipse cx="45" cy="40" rx="32" ry="26" class="venn-fill-partial"/><ellipse cx="75" cy="40" rx="32" ry="26" class="venn-fill-partial"/></svg>
          <p class="learn-op-result">{1,2,3,6,7,8}</p>
        </div>
      </div>
    </figure>
  `,

  sets_practice_flow: `
    <figure class="learn-visual" aria-label="Flujo aprender y practicar conjuntos">
      <figcaption class="learn-visual-caption">Dos pasos en el módulo de conjuntos</figcaption>
      <div class="learn-flow-steps">
        <div class="learn-flow-step"><span class="learn-flow-num">1</span><div><strong>Calcular</strong><p>Escribes A y B, eliges operación, ves el resultado en lista.</p></div></div>
        <div class="learn-flow-arrow">↓</div>
        <div class="learn-flow-step"><span class="learn-flow-num">2</span><div><strong>Colorear</strong><p>En el diagrama marcas la región correcta sin copiar solo números.</p></div></div>
      </div>
    </figure>
  `,

  sets_db: `
    <figure class="learn-visual" aria-label="Conjuntos en filtros SQL">
      <figcaption class="learn-visual-caption">Filtro de datos ≈ operación de conjuntos</figcaption>
      <div class="learn-code-compare">
        <div class="learn-code-line"><span class="learn-code-tag">Conjuntos</span> (Linux) ∩ (con virus) − (con cortafuegos)</div>
        <div class="learn-code-line"><span class="learn-code-tag">Idea SQL</span> WHERE linux AND malware AND NOT firewall</div>
      </div>
    </figure>
  `,

  graphs_basic: `
    <figure class="learn-visual" aria-label="Grafo con pesos">
      <figcaption class="learn-visual-caption">Nodos = lugares · Aristas = caminos · Números = peso (costo)</figcaption>
      <svg class="learn-svg-graph" viewBox="0 0 340 160" role="img" aria-hidden="true">
        <line x1="50" y1="80" x2="120" y2="40" class="graph-edge"/><text x="75" y="52" class="graph-weight">4</text>
        <line x1="50" y1="80" x2="120" y2="120" class="graph-edge"/><text x="75" y="108" class="graph-weight">2</text>
        <line x1="120" y1="40" x2="200" y2="80" class="graph-edge"/><text x="155" y="52" class="graph-weight">3</text>
        <line x1="120" y1="120" x2="200" y2="80" class="graph-edge"/><text x="155" y="108" class="graph-weight">1</text>
        <line x1="200" y1="80" x2="280" y2="80" class="graph-edge graph-edge-alt"/><text x="235" y="68" class="graph-weight">8</text>
        <circle cx="50" cy="80" r="18" class="graph-node"/><text x="50" y="85" class="graph-node-label">A</text>
        <circle cx="120" cy="40" r="18" class="graph-node"/><text x="120" y="45" class="graph-node-label">B</text>
        <circle cx="120" cy="120" r="18" class="graph-node"/><text x="120" y="125" class="graph-node-label">C</text>
        <circle cx="200" cy="80" r="18" class="graph-node"/><text x="200" y="85" class="graph-node-label">D</text>
        <circle cx="280" cy="80" r="18" class="graph-node graph-node-end"/><text x="280" y="85" class="graph-node-label">E</text>
      </svg>
      <p class="learn-visual-note">A→B→D suma 4+3=7. A→C→D suma 2+1=3 (mejor aunque tenga más tramos).</p>
    </figure>
  `,

  graphs_bfs: `
    <figure class="learn-visual" aria-label="BFS por capas">
      <figcaption class="learn-visual-caption">BFS desde A: visita por «oleadas» (distancia en saltos)</figcaption>
      <div class="learn-bfs-layers">
        <div class="learn-bfs-layer"><span class="learn-bfs-label">Capa 0</span><span class="learn-bfs-node active">A</span></div>
        <div class="learn-bfs-layer"><span class="learn-bfs-label">Capa 1</span><span class="learn-bfs-node">B</span><span class="learn-bfs-node">C</span></div>
        <div class="learn-bfs-layer"><span class="learn-bfs-label">Capa 2</span><span class="learn-bfs-node">D</span></div>
      </div>
      <p class="learn-visual-note">No mira pesos: solo pregunta «¿a quién llego en 1 paso, luego en 2 pasos…?»</p>
    </figure>
  `,

  graphs_dijkstra: `
    <figure class="learn-visual" aria-label="Dijkstra camino mínimo">
      <figcaption class="learn-visual-caption">Dijkstra: elige el camino con menor suma de pesos</figcaption>
      <div class="learn-path-compare">
        <div class="learn-path-card learn-path-bad">
          <p><strong>Directo A → E</strong></p>
          <p class="learn-path-sum">Peso total: <strong>8</strong></p>
        </div>
        <div class="learn-path-card learn-path-good">
          <p><strong>A → C → D → E</strong></p>
          <p class="learn-path-sum">Peso total: 2 + 1 + … = <strong>menor</strong></p>
        </div>
      </div>
    </figure>
  `,

  graphs_algo_pick: `
    <figure class="learn-visual" aria-label="Cuándo usar cada algoritmo">
      <div class="learn-visual-grid learn-visual-grid-2">
        <div class="learn-visual-card"><p class="learn-visual-label">BFS</p><p>Pesos iguales o no importan. Orden por capas.</p></div>
        <div class="learn-visual-card"><p class="learn-visual-label">Dijkstra</p><p>Pesos distintos (km, ms, $). Camino más barato.</p></div>
      </div>
    </figure>
  `,

  rel_pairs: `
    <figure class="learn-visual" aria-label="Pares ordenados y matriz">
      <figcaption class="learn-visual-caption">Relación R = lista de flechas (a → b)</figcaption>
      <div class="learn-rel-wrap">
        <div class="learn-rel-pairs">
          <p class="learn-visual-label">Pares en R</p>
          <p>(1,1) (1,2) (2,2) (3,4)</p>
          <svg viewBox="0 0 140 100" class="learn-svg-arrows">
            <circle cx="25" cy="50" r="12" class="rel-node"/><text x="25" y="54" class="rel-node-t">1</text>
            <circle cx="70" cy="25" r="12" class="rel-node"/><text x="70" y="29" class="rel-node-t">2</text>
            <circle cx="115" cy="50" r="12" class="rel-node"/><text x="115" y="54" class="rel-node-t">3</text>
            <path d="M32 48 L58 30" class="rel-arrow" marker-end="url(#arr)"/>
            <path d="M30 52 L62 48" class="rel-arrow"/>
            <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="rel-arrow-head"/></marker></defs>
          </svg>
        </div>
        <div class="learn-rel-matrix">
          <p class="learn-visual-label">Matriz (fila → columna)</p>
          <table class="learn-matrix-mini">
            <tr><th></th><th>1</th><th>2</th><th>3</th></tr>
            <tr><th>1</th><td class="m1">1</td><td class="m1">1</td><td>0</td></tr>
            <tr><th>2</th><td>0</td><td class="m1">1</td><td>0</td></tr>
            <tr><th>3</th><td>0</td><td>0</td><td>0</td></tr>
          </table>
        </div>
      </div>
    </figure>
  `,

  rel_properties: `
    <figure class="learn-visual" aria-label="Propiedades de relaciones">
      <figcaption class="learn-visual-caption">Resumen visual de cada propiedad</figcaption>
      <div class="learn-prop-list">
        <div class="learn-prop-item"><span class="learn-prop-icon">↺</span><div><strong>Reflexiva</strong><p>Toda flecha (a,a): cada elemento se relaciona consigo mismo.</p></div></div>
        <div class="learn-prop-item"><span class="learn-prop-icon">↔</span><div><strong>Simétrica</strong><p>Si hay (a,b) también hay (b,a).</p></div></div>
        <div class="learn-prop-item"><span class="learn-prop-icon">⇢</span><div><strong>Transitiva</strong><p>Si (a,b) y (b,c) entonces existe (a,c).</p></div></div>
        <div class="learn-prop-item"><span class="learn-prop-icon">≠</span><div><strong>Antisimétrica</strong><p>(a,b) y (b,a) solo si a = b.</p></div></div>
      </div>
    </figure>
  `,

  rel_equivalence: `
    <figure class="learn-visual" aria-label="Equivalencia">
      <figcaption class="learn-visual-caption">Equivalencia = partición en «grupos» (clases)</figcaption>
      <div class="learn-equiv-groups">
        <div class="learn-equiv-class"><span>{1, 2}</span><small>misma «zona»</small></div>
        <div class="learn-equiv-class"><span>{3}</span><small>solo</small></div>
        <div class="learn-equiv-class"><span>{4}</span><small>solo</small></div>
      </div>
      <p class="learn-visual-note">Ejemplo real: «misma ciudad» — reflexiva, simétrica y transitiva.</p>
    </figure>
  `,

  rel_db: `
    <figure class="learn-visual" aria-label="Relaciones en BD">
      <div class="learn-code-compare">
        <div class="learn-code-line"><span class="learn-code-tag">Tabla Alumno</span> id → nombre</div>
        <div class="learn-code-line"><span class="learn-code-tag">Tabla Curso</span> id_alumno → id_curso (relación)</div>
      </div>
    </figure>
  `
};
