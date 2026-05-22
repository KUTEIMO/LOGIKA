// Mascot "Logiko" — ojos simples (círculos), mensajes humanos
const mascotInstances = new Map();
let speechTimer = null;

const VIEWS_HIDE_FLOATING = ['landing-view', 'school-view'];

function uidFromContainer(containerId) {
  return (containerId || 'global').replace(/[^a-z0-9]/gi, '') || 'g';
}

/** Ojos cibernéticos sobre el visor (anillos + pupila luminosa; máscaras por expresión) */
function buildCyberEyes(expression, uid) {
  const glow = 'var(--mascot-cyber-glow, #22d3ee)';
  const lx = 38;
  const rx = 82;
  const ly = 58;
  const filter = `url(#eyeGlow-${uid})`;

  if (expression === 'happy') {
    return `
      <g class="mascot-eye-l mascot-eye-gaze">
        <path d="M 30,58 Q 38,51 46,58" fill="none" stroke="${glow}" stroke-width="3.5" stroke-linecap="round" filter="${filter}"/>
      </g>
      <g class="mascot-eye-r mascot-eye-gaze">
        <path d="M 74,58 Q 82,51 90,58" fill="none" stroke="${glow}" stroke-width="3.5" stroke-linecap="round" filter="${filter}"/>
      </g>
    `;
  }

  if (expression === 'sad') {
    return `
      <g class="mascot-eye-l mascot-eye-gaze">
        <path d="M 30,56 Q 38,62 46,56" fill="none" stroke="${glow}" stroke-width="3" stroke-linecap="round" opacity="0.75" filter="${filter}"/>
      </g>
      <g class="mascot-eye-r mascot-eye-gaze">
        <path d="M 74,56 Q 82,62 90,56" fill="none" stroke="${glow}" stroke-width="3" stroke-linecap="round" opacity="0.75" filter="${filter}"/>
      </g>
    `;
  }

  const ringR = expression === 'surprised' ? 6 : 5;
  const dotR = expression === 'surprised' ? 2.8 : 2.2;
  const py = expression === 'thoughtful' ? ly - 2 : ly;

  const cyberRing = (cx) => `
    <g class="mascot-eye-gaze">
      <circle cx="${cx}" cy="${py}" r="${ringR}" fill="none" stroke="${glow}" stroke-width="2" opacity="0.9" filter="${filter}"/>
      <circle class="mascot-pupil" cx="${cx}" cy="${py}" r="${dotR}" fill="${glow}" filter="${filter}"/>
      <circle cx="${cx - 1}" cy="${py - 1}" r="0.7" fill="rgba(255,255,255,0.7)"/>
    </g>
  `;

  return `
    <g class="mascot-eye-l">${cyberRing(lx)}</g>
    <g class="mascot-eye-r">${cyberRing(rx)}</g>
  `;
}

const createMascotSVG = (containerId, expression = 'normal') => {
  const uid = uidFromContainer(containerId);
  let eyeColor = 'var(--mascot-eye, #06b6d4)';
  let mouthPath = 'M 50,75 Q 60,82 70,75';
  let eyebrowLeft = 'M 32,42 Q 40,40 48,45';
  let eyebrowRight = 'M 72,45 Q 80,40 88,42';

  switch (expression) {
    case 'happy':
      eyeColor = 'var(--mascot-eye-happy, #10b981)';
      mouthPath = 'M 48,72 Q 60,86 72,72';
      break;
    case 'sad':
      eyeColor = 'var(--mascot-eye-sad, #ef4444)';
      mouthPath = 'M 52,78 Q 60,70 68,78';
      eyebrowLeft = 'M 32,46 Q 40,48 48,44';
      eyebrowRight = 'M 72,44 Q 80,48 88,46';
      break;
    case 'thoughtful':
      eyeColor = 'var(--mascot-eye-thought, #a78bfa)';
      mouthPath = 'M 52,74 L 68,74';
      eyebrowLeft = 'M 32,40 Q 40,44 48,44';
      eyebrowRight = 'M 72,36 Q 80,36 88,40';
      break;
    case 'surprised':
      eyeColor = 'var(--mascot-eye-surprise, #f59e0b)';
      mouthPath = 'M 54,76 Q 60,82 66,76';
      eyebrowLeft = 'M 30,36 Q 40,34 50,38';
      eyebrowRight = 'M 70,38 Q 80,34 90,36';
      break;
    default:
      break;
  }

  const eyes = buildCyberEyes(expression, uid);

  return `
    <svg viewBox="0 0 120 120" width="100%" height="100%" class="mascot-svg-element" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logiko">
      <defs>
        <filter id="eyeGlow-${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="chassisGrad-${uid}" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="var(--mascot-chassis-light, #334155)"/>
          <stop offset="100%" stop-color="var(--mascot-chassis-dark, #0f172a)"/>
        </radialGradient>
        <linearGradient id="visorGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--mascot-visor-top, #1e293b)"/>
          <stop offset="100%" stop-color="var(--mascot-visor-bot, #0f172a)"/>
        </linearGradient>
      </defs>
      <style>
        .mascot-head-${uid} { transform-origin: 60px 65px; animation: mascotBreathe-${uid} 3s ease-in-out infinite alternate; }
        .mascot-ear-l-${uid} { transform-origin: 35px 45px; animation: earTwitchL-${uid} 6s infinite ease-in-out; }
        .mascot-ear-r-${uid} { transform-origin: 85px 45px; animation: earTwitchR-${uid} 7s infinite ease-in-out; }
        .chip-glow-${uid} { transform-origin: 60px 105px; animation: chipPulse-${uid} 2s infinite ease-in-out alternate; }
        @keyframes mascotBreathe-${uid} { 0% { transform: translateY(0); } 100% { transform: translateY(2px); } }
        @keyframes earTwitchL-${uid} { 0%,90%,100% { transform: rotate(0); } 93% { transform: rotate(-4deg); } }
        @keyframes earTwitchR-${uid} { 0%,88%,100% { transform: rotate(0); } 91% { transform: rotate(4deg); } }
        @keyframes chipPulse-${uid} { 0% { opacity: 0.55; } 100% { opacity: 1; } }
      </style>
      <path d="M 40,110 L 80,110 L 75,98 L 45,98 Z" fill="url(#chassisGrad-${uid})" stroke="var(--mascot-stroke)" stroke-width="1"/>
      <circle cx="60" cy="106" r="6" fill="${eyeColor}" class="chip-glow-${uid}"/>
      <g class="mascot-head mascot-head-${uid}">
        <g class="mascot-ear-l-${uid}">
          <polygon points="18,22 45,46 25,56" fill="var(--mascot-ear-dark, #4c1d95)"/>
          <polygon points="22,26 42,46 27,52" fill="var(--mascot-ear-light, #7c3aed)"/>
        </g>
        <g class="mascot-ear-r-${uid}">
          <polygon points="102,22 75,46 95,56" fill="var(--mascot-ear-dark, #4c1d95)"/>
          <polygon points="98,26 78,46 93,52" fill="var(--mascot-ear-light, #7c3aed)"/>
        </g>
        <path d="M 22,50 Q 15,68 32,84 Q 45,92 60,92 Q 75,92 88,84 Q 105,68 98,50 Z" fill="url(#chassisGrad-${uid})" stroke="var(--mascot-stroke)" stroke-width="1.5"/>
        <path d="M 26,52 Q 60,42 94,52 Q 96,66 90,70 Q 60,78 30,70 Q 24,66 26,52 Z" fill="url(#visorGrad-${uid})" stroke="var(--mascot-stroke)" stroke-width="1"/>
        ${eyes}
        <polygon points="56,70 64,70 60,74" fill="var(--mascot-nose)"/>
        <path d="${mouthPath}" fill="none" stroke="var(--mascot-mouth)" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </svg>
  `;
};

export function renderMascot(containerId, expression = 'normal') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = createMascotSVG(containerId, expression);
  container.dataset.mascotExpression = expression;
  mascotInstances.set(containerId, expression);
  document.dispatchEvent(
    new CustomEvent('logika-mascot-rendered', { detail: { containerId, expression } })
  );
}

document.addEventListener('logika-theme-change', () => {
  mascotInstances.forEach((expr, id) => renderMascot(id, expr));
});

const HUMAN_MESSAGES = {
  happy: '¡Lo lograste! Me alegra ver ese avance.',
  sad: 'Tranqui, equivocarse también enseña. Vuelve a intentarlo.',
  thoughtful: 'Vamos paso a paso. Revisa la pista y prueba otra vez.',
  surprised: '¡Wow! Ese resultado sí que llama la atención.',
  normal: 'Hola, soy Logiko. Arrástrame si me estorbo; un clic y charlamos un momento.'
};

export function showMascotSpeech(text, durationMs = 6500) {
  const bubble = document.getElementById('global-speech-bubble');
  const textEl = document.getElementById('global-mascot-speech-text');
  if (!bubble || !textEl) return;

  if (speechTimer) clearTimeout(speechTimer);

  textEl.textContent = text;
  bubble.classList.remove('hidden');
  positionSpeechBubble();

  if (durationMs > 0) {
    speechTimer = setTimeout(() => hideMascotSpeech(), durationMs);
  }
}

export function hideMascotSpeech() {
  if (speechTimer) {
    clearTimeout(speechTimer);
    speechTimer = null;
  }
  document.getElementById('global-speech-bubble')?.classList.add('hidden');
}

/** Evita que la burbuja empuje al widget fuera de pantalla */
export function positionSpeechBubble() {
  const widget = document.getElementById('global-mascot-widget');
  const bubble = document.getElementById('global-speech-bubble');
  if (!widget || !bubble || bubble.classList.contains('hidden')) return;

  bubble.style.left = '';
  bubble.style.right = '0';
  bubble.style.bottom = 'calc(100% + 10px)';

  requestAnimationFrame(() => {
    const br = bubble.getBoundingClientRect();
    if (br.top < 12) {
      bubble.style.bottom = 'auto';
      bubble.style.top = 'calc(100% + 10px)';
    }
  });
}

export function setGlobalMascotExpression(expression, options = {}) {
  const { speak = false } = options;
  if (!document.getElementById('global-mascot-widget')?.classList.contains('mascot-floating-hidden')) {
    renderMascot('global-mascot-svg-container', expression);
  }
  if (speak) {
    showMascotSpeech(HUMAN_MESSAGES[expression] || HUMAN_MESSAGES.normal, 6500);
  }
}

export function updateFloatingMascotVisibility(activeViewId) {
  const widget = document.getElementById('global-mascot-widget');
  if (!widget) return;
  if (VIEWS_HIDE_FLOATING.includes(activeViewId)) {
    widget.classList.add('mascot-floating-hidden');
    hideMascotSpeech();
  } else {
    widget.classList.remove('mascot-floating-hidden');
    const expr = mascotInstances.get('global-mascot-svg-container') || 'normal';
    renderMascot('global-mascot-svg-container', expr);
  }
}

export function initFloatingMascot() {
  renderMascot('global-mascot-svg-container', 'normal');

  const widget = document.getElementById('global-mascot-widget');
  const container = document.getElementById('global-mascot-svg-container');
  const closeBtn = document.getElementById('btn-close-speech');
  const bubble = document.getElementById('global-speech-bubble');

  container?.addEventListener('click', () => {
    if (window.logikaMascotDidDrag) return;
    const current = mascotInstances.get('global-mascot-svg-container') || 'normal';
    showMascotSpeech(HUMAN_MESSAGES[current] || HUMAN_MESSAGES.normal, 7000);
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMascotSpeech();
  });

  document.addEventListener('click', (e) => {
    if (!bubble || bubble.classList.contains('hidden')) return;
    if (widget?.contains(e.target)) return;
    hideMascotSpeech();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMascotSpeech();
  });

  window.addEventListener('resize', positionSpeechBubble);
}

export function rerenderAllMascots() {
  mascotInstances.forEach((expr, id) => renderMascot(id, expr));
}
