// Graph Theory Module with Interactive Draggable Canvas, Dijkstra & BFS (KISS & Canvas)
import { addXP, playSuccess, playError, playClick } from '../components/gamification.js';
import { saveModuleProgress, promptLoginIfNeeded, getModuleProgress } from '../components/progress.js';
import { afterModuleActivity } from '../components/certificates.js';
import { setGlobalMascotExpression } from '../components/mascot.js';
import { showToast, isLightMode } from '../components/ui.js';
import { icon, refreshIcons } from '../components/icons.js';
import { registerPracticeReset } from '../components/module-learn.js';

export function initGraphsModule() {
  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  
  const toolNode = document.getElementById('btn-graph-tool-node');
  const toolEdge = document.getElementById('btn-graph-tool-edge');
  const toolDelete = document.getElementById('btn-graph-tool-delete');
  
  const edgeWeightInput = document.getElementById('graph-edge-weight');
  const nodeStartSelect = document.getElementById('graph-node-start');
  const nodeEndSelect = document.getElementById('graph-node-end');
  
  const btnRunDijkstra = document.getElementById('btn-run-dijkstra'); // wait, in html it is btn-graph-run-dijkstra
  const btnRunDijkstraReal = document.getElementById('btn-graph-run-dijkstra');
  const btnRunBFS = document.getElementById('btn-graph-run-bfs');
  const btnClearAll = document.getElementById('btn-graph-clear');
  const logEl = document.getElementById('graph-log');
  const canvasTip = document.getElementById('graph-canvas-tip');

  // Graph state
  let nodes = [];
  let edges = [];
  let activeTool = 'node'; // node, edge, delete
  
  const nodeRadius = 20;
  let nextNodeChar = 65; // ASCII 'A'
  
  // Drag state
  let draggingNode = null;
  let connectingNode = null; // Storing first click for edge creation
  
  // Highlight state for animations
  let highlightedNodes = [];
  let highlightedEdges = [];
  let animating = false;

  // Set up listeners for tools
  const tools = [
    { btn: toolNode, val: 'node', tip: `${icon('mouse-pointer-2')} Tip: Haz clic en el lienzo para colocar un nodo.` },
    { btn: toolEdge, val: 'edge', tip: `${icon('share-2')} Tip: Haz clic en un nodo y arrastra o haz clic en otro nodo para conectarlos.` },
    { btn: toolDelete, val: 'delete', tip: `${icon('eraser')} Tip: Haz clic en un nodo o arista para eliminarlo.` }
  ];

  function setLog(html) {
    logEl.innerHTML = html;
    refreshIcons(logEl);
  }

  tools.forEach(t => {
    t.btn.addEventListener('click', () => {
      tools.forEach(x => x.btn.classList.remove('active'));
      t.btn.classList.add('active');
      activeTool = t.val;
      canvasTip.innerHTML = t.tip;
      refreshIcons(canvasTip);
      connectingNode = null;
      redraw();
    });
  });

  canvasTip.innerHTML = tools[0].tip;
  refreshIcons(canvasTip);

  // Graph actions
  btnClearAll.addEventListener('click', () => {
    nodes = [];
    edges = [];
    nextNodeChar = 65;
    connectingNode = null;
    highlightedNodes = [];
    highlightedEdges = [];
    setLog(`<p>${icon('info', 'text-cyan')} Grafo limpiado.</p>`);
    updateSelects();
    redraw();
    setGlobalMascotExpression('normal');
  });

  btnRunDijkstraReal.addEventListener('click', () => {
    runDijkstraAlg();
  });

  btnRunBFS.addEventListener('click', () => {
    runBFSAlg();
  });

  // Canvas Mouse Actions
  canvas.addEventListener('mousedown', (e) => {
    if (animating) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = getNodeAt(x, y);
    
    if (activeTool === 'node') {
      if (clickedNode) {
        // Drag node
        draggingNode = clickedNode;
      } else {
        // Create new node
        if (nextNodeChar > 90) {
          showToast('Se alcanzó el límite de letras del abecedario para los nodos.', 'warning');
          return;
        }
        const name = String.fromCharCode(nextNodeChar++);
        nodes.push({ id: name, x, y });
        playClick();
        updateSelects();
        redraw();
        setLog(`<p>${icon('plus', 'text-green')} Nodo ${name} creado.</p>`);
      }
    } else if (activeTool === 'edge') {
      if (clickedNode) {
        connectingNode = clickedNode;
      }
    } else if (activeTool === 'delete') {
      if (clickedNode) {
        // Delete Node + Edges connected
        nodes = nodes.filter(n => n.id !== clickedNode.id);
        edges = edges.filter(ed => ed.u !== clickedNode.id && ed.v !== clickedNode.id);
        setLog(`<p>${icon('trash-2', 'text-danger')} Nodo ${clickedNode.id} eliminado.</p>`);
        updateSelects();
        redraw();
      } else {
        // Check if edge clicked
        const clickedEdge = getEdgeAt(x, y);
        if (clickedEdge) {
          edges = edges.filter(ed => !(ed.u === clickedEdge.u && ed.v === clickedEdge.v));
          setLog(`<p>${icon('trash-2', 'text-danger')} Arista ${clickedEdge.u} - ${clickedEdge.v} eliminada.</p>`);
          redraw();
        }
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (animating) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'node' && draggingNode) {
      // Bounds checks
      draggingNode.x = Math.max(nodeRadius, Math.min(canvas.width - nodeRadius, x));
      draggingNode.y = Math.max(nodeRadius, Math.min(canvas.height - nodeRadius, y));
      redraw();
    } else if (activeTool === 'edge' && connectingNode) {
      redraw();
      // Draw temp line from connectingNode to current mouse
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.moveTo(connectingNode.x, connectingNode.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (animating) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'node') {
      draggingNode = null;
    } else if (activeTool === 'edge' && connectingNode) {
      const releasedNode = getNodeAt(x, y);
      if (releasedNode && releasedNode.id !== connectingNode.id) {
        // Connect them!
        const w = parseInt(edgeWeightInput.value) || 1;
        
        // Prevent duplicate edges (undirected)
        const exists = edges.some(ed => 
          (ed.u === connectingNode.id && ed.v === releasedNode.id) ||
          (ed.u === releasedNode.id && ed.v === connectingNode.id)
        );
        
        if (!exists) {
          edges.push({ u: connectingNode.id, v: releasedNode.id, weight: w });
          playClick();
          setLog(`<p>${icon('link', 'text-cyan')} Conexión ${connectingNode.id} - ${releasedNode.id} con peso ${w} creada.</p>`);
        }
      }
      connectingNode = null;
      redraw();
    }
  });

  // Core Math Algorithms
  function runDijkstraAlg() {
    const start = nodeStartSelect.value;
    const end = nodeEndSelect.value;
    
    if (!start || !end) {
      showToast('Selecciona nodos de Origen y Destino.', 'warning');
      return;
    }
    
    if (start === end) {
      showToast('El origen y el destino deben ser diferentes.', 'warning');
      return;
    }

    highlightedNodes = [];
    highlightedEdges = [];
    
    // Dijkstra execution
    const dist = {};
    const prev = {};
    const queue = new Set();
    
    nodes.forEach(n => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
      queue.add(n.id);
    });
    
    dist[start] = 0;
    
    while (queue.size > 0) {
      let u = null;
      queue.forEach(id => {
        if (u === null || dist[id] < dist[u]) {
          u = id;
        }
      });
      
      if (u === null || dist[u] === Infinity) break;
      if (u === end) break;
      
      queue.delete(u);
      
      const neighbors = [];
      edges.forEach(e => {
        if (e.u === u && queue.has(e.v)) neighbors.push({ id: e.v, w: e.weight });
        else if (e.v === u && queue.has(e.u)) neighbors.push({ id: e.u, w: e.weight });
      });
      
      neighbors.forEach(n => {
        const alt = dist[u] + n.w;
        if (alt < dist[n.id]) {
          dist[n.id] = alt;
          prev[n.id] = u;
        }
      });
    }

    // Reconstruct path
    const path = [];
    let curr = end;
    if (prev[curr] !== null || curr === start) {
      while (curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
      }
    }

    if (path.length === 0) {
      setGlobalMascotExpression('sad');
      playError();
      setLog(`<p>${icon('triangle-alert', 'text-danger')} No existe camino entre ${start} y ${end}.</p>`);
      return;
    }

    // Map path to highlighted structures
    highlightedNodes = [...path];
    for (let i = 0; i < path.length - 1; i++) {
      const u1 = path[i];
      const u2 = path[i+1];
      highlightedEdges.push({ u: u1, v: u2 });
    }

    // Animating step-by-step
    animatePath(path, dist[end]);
  }

  function animatePath(path, totalDist) {
    animating = true;
    let index = 0;
    highlightedNodes = [];
    highlightedEdges = [];
    
    setGlobalMascotExpression('thoughtful');

    const timer = setInterval(() => {
      if (index < path.length) {
        highlightedNodes.push(path[index]);
        if (index > 0) {
          highlightedEdges.push({ u: path[index-1], v: path[index] });
        }
        playClick();
        redraw();
        index++;
      } else {
        clearInterval(timer);
        animating = false;
        setGlobalMascotExpression('happy');
        addXP(70, `graphs_dijkstra_${start}_${end}_${Date.now()}`);
        saveModuleProgress('graphs', {
          dijkstraRuns: (getModuleProgress('graphs').dijkstraRuns || 0) + 1
        });
        promptLoginIfNeeded();
        afterModuleActivity('graphs');
        setLog(`<p>${icon('route', 'text-green')} Dijkstra completado. Revisa el camino resaltado en el canvas.</p>`);
      }
    }, 400);
  }

  function runBFSAlg() {
    const start = nodeStartSelect.value;
    if (!start) {
      showToast('Selecciona un nodo de Origen para iniciar el recorrido.', 'warning');
      return;
    }

    animating = true;
    highlightedNodes = [];
    highlightedEdges = [];
    setGlobalMascotExpression('thoughtful');

    const visited = new Set();
    const queue = [start];
    const order = [];
    
    visited.add(start);

    while (queue.length > 0) {
      const u = queue.shift();
      order.push(u);
      
      const neighbors = [];
      edges.forEach(e => {
        if (e.u === u && !visited.has(e.v)) neighbors.push(e.v);
        else if (e.v === u && !visited.has(e.u)) neighbors.push(e.u);
      });
      
      // deterministic order
      neighbors.sort().forEach(v => {
        visited.add(v);
        queue.push(v);
      });
    }

    // Animate visiting nodes sequentially
    let index = 0;
    const timer = setInterval(() => {
      if (index < order.length) {
        highlightedNodes.push(order[index]);
        playClick();
        redraw();
        index++;
      } else {
        clearInterval(timer);
        animating = false;
        setGlobalMascotExpression('happy');
        addXP(60, `graphs_bfs_${start}_${Date.now()}`);
        saveModuleProgress('graphs', {
          bfsRuns: (getModuleProgress('graphs').bfsRuns || 0) + 1
        });
        promptLoginIfNeeded();
        afterModuleActivity('graphs');
        setLog(`<p>${icon('waypoints', 'text-green')} BFS completado. Observa el orden de visita en el grafo.</p>`);
      }
    }, 450);
  }

  // Draw Functions
  function redraw() {
    const light = isLightMode();
    const theme = {
      bg: light ? '#f8fafc' : '#020617',
      edge: light ? 'rgba(8, 145, 178, 0.55)' : 'rgba(6, 182, 212, 0.4)',
      edgeLabelBg: light ? '#e2e8f0' : '#0f172a',
      edgeLabel: light ? '#0e7490' : '#22d3ee',
      nodeFill: light ? '#5b21b6' : '#7c3aed',
      nodeStroke: light ? '#4c1d95' : '#a78bfa',
      nodeText: light ? '#ffffff' : '#ffffff',
      tempEdge: light ? 'rgba(8, 145, 178, 0.35)' : 'rgba(6, 182, 212, 0.4)'
    };

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Edges
    edges.forEach(e => {
      const uNode = nodes.find(n => n.id === e.u);
      const vNode = nodes.find(n => n.id === e.v);
      if (!uNode || !vNode) return;

      const isHighlighted = highlightedEdges.some(he => 
        (he.u === e.u && he.v === e.v) || (he.u === e.v && he.v === e.u)
      );

      ctx.beginPath();
      ctx.moveTo(uNode.x, uNode.y);
      ctx.lineTo(vNode.x, vNode.y);
      
      if (isHighlighted) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#10b981'; // Emerald path
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
      } else {
        ctx.lineWidth = 2;
        ctx.strokeStyle = theme.edge;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw Edge Weight
      const midX = (uNode.x + vNode.x) / 2;
      const midY = (uNode.y + vNode.y) / 2;
      
      ctx.fillStyle = theme.edgeLabelBg;
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, Math.PI*2);
      ctx.fill();
      
      ctx.fillStyle = isHighlighted ? '#10b981' : theme.edgeLabel;
      ctx.font = '700 11px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.weight, midX, midY);
    });

    // 2. Draw Nodes
    nodes.forEach(n => {
      const isHighlighted = highlightedNodes.includes(n.id);
      
      ctx.beginPath();
      ctx.arc(n.x, n.y, nodeRadius, 0, Math.PI * 2);
      
      if (isHighlighted) {
        ctx.fillStyle = '#10b981'; // green path
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = theme.nodeFill;
        ctx.strokeStyle = theme.nodeStroke;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = theme.nodeText;
      ctx.font = '700 14px Sora';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.id, n.x, n.y);
    });
  }

  // Helpers
  function getNodeAt(x, y) {
    return nodes.find(n => Math.hypot(n.x - x, n.y - y) <= nodeRadius);
  }

  function getEdgeAt(x, y) {
    // Check projection distance to lines
    for (const e of edges) {
      const uNode = nodes.find(n => n.id === e.u);
      const vNode = nodes.find(n => n.id === e.v);
      if (!uNode || !vNode) continue;
      
      // Calculate distance to line segment
      const d = distToSegment({ x, y }, uNode, vNode);
      if (d <= 8) {
        return e;
      }
    }
    return null;
  }

  function distToSegment(p, v, w) {
    const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  function updateSelects() {
    const startVal = nodeStartSelect.value;
    const endVal = nodeEndSelect.value;
    
    let optionsHTML = '<option value="">--Seleccionar--</option>';
    nodes.forEach(n => {
      optionsHTML += `<option value="${n.id}">${n.id}</option>`;
    });
    
    nodeStartSelect.innerHTML = optionsHTML;
    nodeEndSelect.innerHTML = optionsHTML;
    
    // restore selected values if still exist
    if (nodes.some(n => n.id === startVal)) nodeStartSelect.value = startVal;
    if (nodes.some(n => n.id === endVal)) nodeEndSelect.value = endVal;
  }

  // Init default simple graph for first usage
  function loadDefaultGraph() {
    nodes = [
      { id: 'A', x: 100, y: 150 },
      { id: 'B', x: 250, y: 100 },
      { id: 'C', x: 250, y: 250 },
      { id: 'D', x: 420, y: 150 }
    ];
    edges = [
      { u: 'A', v: 'B', weight: 4 },
      { u: 'A', v: 'C', weight: 2 },
      { u: 'B', v: 'C', weight: 1 },
      { u: 'B', v: 'D', weight: 3 },
      { u: 'C', v: 'D', weight: 6 }
    ];
    nextNodeChar = 69; // 'E'
    updateSelects();
    redraw();
  }

  loadDefaultGraph();

  registerPracticeReset('graphs', () => {
    highlightedNodes = [];
    highlightedEdges = [];
    animating = false;
    connectingNode = null;
    draggingNode = null;
    loadDefaultGraph();
    setLog(`<p>${icon('info', 'text-cyan')} Ejercicio reiniciado — prueba otra ruta.</p>`);
    setGlobalMascotExpression('normal');
  });

  document.addEventListener('logika-theme-change', () => {
    if (!animating) redraw();
  });
}
