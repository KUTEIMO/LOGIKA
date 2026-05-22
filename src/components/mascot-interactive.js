// Logiko flotante: arrastre estable, mirada suave solo en widget flotante
const FLOATING_ID = 'global-mascot-svg-container';
const POS_KEY = 'logika_mascot_position';
const DRAG_THRESHOLD = 6;

function mascotFootprint(widget) {
  const handle = document.getElementById(FLOATING_ID);
  const w = handle?.offsetWidth || widget?.offsetWidth || 110;
  const h = handle?.offsetHeight || widget?.offsetHeight || 110;
  return { w, h };
}

const instances = new Map();
let rafId = null;
let gazeX = 0;
let gazeY = 0;
let targetGazeX = 0;
let targetGazeY = 0;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function registerHost(containerId, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const floating = options.floating ?? containerId === FLOATING_ID;
  instances.set(containerId, { el, floating });
}

function updateGazeFromSvg(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  if (rect.width < 1) return;
  const relX = (clientX - rect.left) / rect.width;
  const relY = (clientY - rect.top) / rect.height;
  targetGazeX = clamp((relX - 0.5) * 2.2, -1.8, 1.8);
  targetGazeY = clamp((relY - 0.5) * 1.8, -1.5, 1.5);
}

function applyTransforms() {
  gazeX += (targetGazeX - gazeX) * 0.12;
  gazeY += (targetGazeY - gazeY) * 0.12;

  const floating = instances.get(FLOATING_ID);
  if (!floating || floating.el.closest('.mascot-floating-hidden')) {
    rafId = requestAnimationFrame(applyTransforms);
    return;
  }

  const svg = floating.el.querySelector('.mascot-svg-element');
  if (svg) {
    svg.querySelectorAll('.mascot-eye-gaze').forEach((g) => {
      g.setAttribute('transform', `translate(${gazeX}, ${gazeY})`);
    });
  }

  rafId = requestAnimationFrame(applyTransforms);
}

function applySavedPosition(widget) {
  const saved = localStorage.getItem(POS_KEY);
  if (!saved) return false;
  try {
    const { x, y } = JSON.parse(saved);
    const { w, h } = mascotFootprint(widget);
    const maxL = Math.max(8, window.innerWidth - w - 8);
    const maxT = Math.max(8, window.innerHeight - h - 8);
    widget.style.left = `${clamp(x, 8, maxL)}px`;
    widget.style.top = `${clamp(y, 8, maxT)}px`;
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    return true;
  } catch {
    return false;
  }
}

function initDrag(widget) {
  const handle = document.getElementById(FLOATING_ID);
  if (!widget || !handle) return;

  applySavedPosition(widget);

  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;

  const onDown = (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    window.logikaMascotDidDrag = false;

    const rect = widget.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;

    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    widget.style.left = `${origLeft}px`;
    widget.style.top = `${origTop}px`;
    widget.classList.add('mascot-dragging');
    e.preventDefault();
  };

  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) moved = true;

    const { w, h } = mascotFootprint(widget);
    const maxL = Math.max(8, window.innerWidth - w - 8);
    const maxT = Math.max(8, window.innerHeight - h - 8);
    widget.style.left = `${clamp(origLeft + dx, 8, maxL)}px`;
    widget.style.top = `${clamp(origTop + dy, 8, maxT)}px`;
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    widget.classList.remove('mascot-dragging');

    if (moved) {
      window.logikaMascotDidDrag = true;
      setTimeout(() => {
        window.logikaMascotDidDrag = false;
      }, 120);
    }

    const left = parseFloat(widget.style.left) || widget.getBoundingClientRect().left;
    const top = parseFloat(widget.style.top) || widget.getBoundingClientRect().top;
    localStorage.setItem(POS_KEY, JSON.stringify({ x: left, y: top }));
  };

  handle.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  window.addEventListener('resize', () => {
    if (widget.style.left && widget.style.left !== 'auto') {
      applySavedPosition(widget);
    }
  });
}

export function initMascotInteractivity() {
  const widget = document.getElementById('global-mascot-widget');
  if (widget) {
    registerHost(FLOATING_ID, { floating: true });
    initDrag(widget);
  }

  document.addEventListener('mousemove', (e) => {
    const floating = instances.get(FLOATING_ID);
    if (!floating || floating.el.closest('.mascot-floating-hidden')) return;
    const svg = floating.el.querySelector('.mascot-svg-element');
    if (svg) updateGazeFromSvg(svg, e.clientX, e.clientY);
  });

  if (!rafId) rafId = requestAnimationFrame(applyTransforms);

  document.addEventListener('logika-mascot-rendered', (e) => {
    const { containerId } = e.detail || {};
    registerHost(containerId, { floating: containerId === FLOATING_ID });
  });
}
