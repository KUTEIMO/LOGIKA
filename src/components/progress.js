// Progreso local por módulo + umbral para pedir inicio de sesión
import { getProgress } from './gamification.js';
import { getPlayerNickname, getSchoolProfile, getModuleCache } from './profile.js';
import { showModal } from './ui.js';

const PREFIX = 'logika_';
const MODULES = ['logic', 'sets', 'graphs', 'relations'];
const LOGIN_PROMPT_KEY = PREFIX + 'login_prompt_shown';
const ACTION_COUNT_KEY = PREFIX + 'local_action_count';
const MODULES_KEY = PREFIX + 'module_progress';

/** Tras N interacciones con recompensa, sugerir iniciar sesión */
export const ACTIONS_BEFORE_LOGIN_HINT = 4;
export const XP_BEFORE_LOGIN_HINT = 120;

export function getGuestId() {
  let id = localStorage.getItem(PREFIX + 'guest_id');
  if (!id) {
    id = `guest_${crypto.randomUUID?.() ?? Date.now()}`;
    localStorage.setItem(PREFIX + 'guest_id', id);
  }
  return id;
}

function defaultModuleState(moduleId) {
  const base = {
    moduleId,
    hasActivity: false,
    updatedAt: null,
    lessonsCompleted: [],
    learnComplete: false,
    currentPhase: 'learn'
  };
  if (moduleId === 'sets') {
    return { ...base, phase: 'learn', learnCount: 0, practiceWins: 0 };
  }
  if (moduleId === 'logic') {
    return { ...base, tablesGenerated: 0, quizzesCorrect: 0 };
  }
  if (moduleId === 'graphs') {
    return { ...base, dijkstraRuns: 0, bfsRuns: 0 };
  }
  if (moduleId === 'relations') {
    return { ...base, checksRun: 0 };
  }
  return base;
}

export function getAllModuleProgress() {
  try {
    const raw = localStorage.getItem(MODULES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const out = {};
    MODULES.forEach((m) => {
      out[m] = { ...defaultModuleState(m), ...(parsed[m] || {}) };
    });
    return out;
  } catch {
    return Object.fromEntries(MODULES.map((m) => [m, defaultModuleState(m)]));
  }
}

export function getModuleProgress(moduleId) {
  return getAllModuleProgress()[moduleId] || defaultModuleState(moduleId);
}

export function saveModuleProgress(moduleId, patch) {
  const all = getAllModuleProgress();
  all[moduleId] = {
    ...all[moduleId],
    ...patch,
    hasActivity: true,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(MODULES_KEY, JSON.stringify(all));
  bumpLocalActionCount();
  return all[moduleId];
}

function bumpLocalActionCount() {
  const n = parseInt(localStorage.getItem(ACTION_COUNT_KEY) || '0', 10) + 1;
  localStorage.setItem(ACTION_COUNT_KEY, n);
  return n;
}

export function getLocalActionCount() {
  return parseInt(localStorage.getItem(ACTION_COUNT_KEY) || '0', 10);
}

export function shouldSuggestLogin() {
  if (getProgress().isLoggedIn) return false;
  if (localStorage.getItem(LOGIN_PROMPT_KEY) === 'true') return false;
  const xp = getProgress().xp;
  const actions = getLocalActionCount();
  return xp >= XP_BEFORE_LOGIN_HINT || actions >= ACTIONS_BEFORE_LOGIN_HINT;
}

export function markLoginPromptShown() {
  localStorage.setItem(LOGIN_PROMPT_KEY, 'true');
}

export function promptLoginIfNeeded() {
  if (!shouldSuggestLogin()) return;
  markLoginPromptShown();
  showModal(
    'Guarda tu progreso en la nube',
    '<p>Llevas buen avance en este dispositivo. <strong>Inicia sesión</strong> para respaldar XP, módulos y medallas en la base de datos y recuperarlos después.</p>',
    {
      confirmLabel: 'Ir a iniciar sesión',
      onConfirm: () => {
        document.getElementById('btn-login-view')?.click();
      },
      cancelLabel: 'Seguir como invitado'
    }
  );
}

export function buildProgressPayload(email = '') {
  const progress = getProgress();
  const school = getSchoolProfile();
  return {
    guestId: getGuestId(),
    email: email || localStorage.getItem(PREFIX + 'auth_email') || '',
    nickname: getPlayerNickname() || progress.username,
    xp: progress.xp,
    level: progress.level,
    streak: progress.streak,
    completedChallenges: progress.completedChallenges,
    schoolProfile: school,
    modules: getAllModuleProgress(),
    moduleCache: getModuleCache(),
    exportedAt: new Date().toISOString()
  };
}

export function resetModuleProgress(moduleId) {
  const all = getAllModuleProgress();
  all[moduleId] = defaultModuleState(moduleId);
  localStorage.setItem(MODULES_KEY, JSON.stringify(all));
}

export function offerModuleResume(moduleId, labels, onContinue, onRestart) {
  const p = getModuleProgress(moduleId);
  if (!p.hasActivity) {
    onContinue();
    return;
  }

  const phaseLabel =
    moduleId === 'sets' && p.phase === 'practice'
      ? 'Estabas en el <strong>desafío de coloreado</strong>.'
      : 'Tienes avance guardado en este módulo.';

  showModal(
    labels.title || 'Continuar módulo',
    `<p>${phaseLabel}</p><p>¿Seguimos donde lo dejaste o empezamos desde cero?</p>`,
    {
      confirmLabel: 'Seguir donde lo dejé',
      cancelLabel: 'Empezar desde 0',
      onConfirm: onContinue,
      onCancel: () => {
        resetModuleProgress(moduleId);
        onRestart();
      }
    }
  );
}
