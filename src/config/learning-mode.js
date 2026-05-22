/** Modo invitado vs sesión: lecciones, requisitos y bloqueo de ruta */
import { getProgress } from '../components/gamification.js';
import { LEARNING_PATH } from './learning-path.js';
import { MODULE_LESSONS, MODULE_LESSONS_EXTENDED } from './module-lessons.js';
import { getModuleProgress } from '../components/progress.js';

export const GUEST_COMPLEXITY_KEY = 'logika_guest_complexity';

export const COMPLEXITY_OPTIONS = [
  { id: 'basico', label: 'Básico', hint: '1 lección breve y 1 reto sencillo por módulo' },
  { id: 'medio', label: 'Medio', hint: '2 lecciones y práctica moderada' },
  { id: 'avanzado', label: 'Avanzado', hint: 'Ruta corta completa (3 lecciones) y práctica estándar' }
];

/** Lecciones visibles para invitado según complejidad */
const GUEST_LESSON_IDS = {
  basico: {
    logic: ['l1'],
    sets: ['s1'],
    graphs: ['g1'],
    relations: ['r1']
  },
  medio: {
    logic: ['l1', 'l2'],
    sets: ['s1', 's2'],
    graphs: ['g1', 'g2'],
    relations: ['r1', 'r2']
  },
  avanzado: {
    logic: ['l1', 'l2', 'l3'],
    sets: ['s1', 's2', 's3'],
    graphs: ['g1', 'g2', 'g3'],
    relations: ['r1', 'r2', 'r3']
  }
};

/** Requisitos de práctica para invitado (certificado / % práctica) */
export const GUEST_PRACTICE_REQUIREMENTS = {
  basico: {
    logic: { tablesGenerated: 1, quizzesCorrect: 1 },
    sets: { learnCount: 1, practiceWins: 1 },
    graphs: { dijkstraRuns: 1, bfsRuns: 0 },
    relations: { checksRun: 1 }
  },
  medio: {
    logic: { tablesGenerated: 2, quizzesCorrect: 1 },
    sets: { learnCount: 2, practiceWins: 1 },
    graphs: { dijkstraRuns: 1, bfsRuns: 1 },
    relations: { checksRun: 2 }
  },
  avanzado: {
    logic: { tablesGenerated: 3, quizzesCorrect: 2 },
    sets: { learnCount: 2, practiceWins: 2 },
    graphs: { dijkstraRuns: 1, bfsRuns: 1 },
    relations: { checksRun: 4 }
  }
};

export function isUserLoggedIn() {
  return getProgress().isLoggedIn;
}

export function getGuestComplexity() {
  const v = localStorage.getItem(GUEST_COMPLEXITY_KEY);
  return COMPLEXITY_OPTIONS.some((o) => o.id === v) ? v : 'basico';
}

export function setGuestComplexity(id) {
  if (!COMPLEXITY_OPTIONS.some((o) => o.id === id)) return;
  localStorage.setItem(GUEST_COMPLEXITY_KEY, id);
}

export function getLessonsForModule(moduleId) {
  const base = MODULE_LESSONS[moduleId] || [];
  if (isUserLoggedIn()) {
    const extra = MODULE_LESSONS_EXTENDED[moduleId] || [];
    return [...base, ...extra];
  }
  const ids = GUEST_LESSON_IDS[getGuestComplexity()]?.[moduleId] || GUEST_LESSON_IDS.basico[moduleId] || [];
  return base.filter((l) => ids.includes(l.id));
}

export function getEffectiveRequirements(moduleId) {
  const def = LEARNING_PATH.find((m) => m.id === moduleId);
  if (!def) return {};
  if (isUserLoggedIn()) return { ...def.requirements };
  const c = getGuestComplexity();
  return { ...(GUEST_PRACTICE_REQUIREMENTS[c]?.[moduleId] || GUEST_PRACTICE_REQUIREMENTS.basico[moduleId]) };
}

/** Completado según ruta oficial (solo para desbloqueo secuencial con sesión) */
export function isModuleCompleteForRoute(moduleId) {
  const p = getModuleProgress(moduleId);
  if (p.completed) return true;
  const def = LEARNING_PATH.find((m) => m.id === moduleId);
  if (!def) return false;
  const lessons = getLessonsForModule(moduleId);
  const done = p.lessonsCompleted || [];
  if (lessons.length && !lessons.every((l) => done.includes(l.id))) return false;
  return Object.entries(def.requirements).every(([k, min]) => (p[k] || 0) >= min);
}

export function isRouteModuleLocked(moduleId) {
  if (!isUserLoggedIn()) return false;
  const idx = LEARNING_PATH.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return false;
  return !isModuleCompleteForRoute(LEARNING_PATH[idx - 1].id);
}

export function canOpenModule(moduleId) {
  return !isRouteModuleLocked(moduleId);
}

export function getRouteModuleStatus(moduleId) {
  if (isRouteModuleLocked(moduleId)) return 'locked';
  if (isModuleCompleteForRoute(moduleId) || getModuleProgress(moduleId).completed) return 'complete';
  const lessons = getLessonsForModule(moduleId);
  const done = getModuleProgress(moduleId).lessonsCompleted || [];
  const learnDone = lessons.length > 0 && lessons.every((l) => done.includes(l.id));
  if (!learnDone) return 'learn';
  return 'practice';
}
