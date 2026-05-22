// Progreso local por módulo + umbral para pedir inicio de sesión (por perfil invitado/usuario)
import { getProgress } from './gamification.js';
import { getPlayerNickname, getSchoolProfile, getModuleCache } from './profile.js';
import { showModal } from './ui.js';
import {
  getGuestId,
  getActiveProfileId,
  scopedKey,
  migrateLegacyModuleProgressIfNeeded,
  onUserLogin,
  onUserLogout
} from './progress-profile.js';

export { getGuestId, onUserLogin, onUserLogout, getActiveProfileId };

const PREFIX = 'logika_';
const MODULES = ['logic', 'sets', 'graphs', 'relations'];
const LOGIN_PROMPT_KEY = PREFIX + 'login_prompt_shown';
const ACTION_COUNT_KEY = 'local_action_count';

export const ACTIONS_BEFORE_LOGIN_HINT = 4;
export const XP_BEFORE_LOGIN_HINT = 120;

function modulesStorageKey() {
  migrateLegacyModuleProgressIfNeeded();
  return scopedKey('module_progress');
}

function defaultModuleState(moduleId) {
  const base = {
    moduleId,
    hasActivity: false,
    updatedAt: null,
    lessonsCompleted: [],
    learnComplete: false,
    currentPhase: 'learn',
    complexity: null
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
    const raw = localStorage.getItem(modulesStorageKey());
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
  localStorage.setItem(modulesStorageKey(), JSON.stringify(all));
  bumpLocalActionCount();
  return all[moduleId];
}

function bumpLocalActionCount() {
  const key = scopedKey(ACTION_COUNT_KEY);
  const n = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, n);
  return n;
}

export function getLocalActionCount() {
  return parseInt(localStorage.getItem(scopedKey(ACTION_COUNT_KEY)) || '0', 10);
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
    profileId: getActiveProfileId(),
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
  localStorage.setItem(modulesStorageKey(), JSON.stringify(all));
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
