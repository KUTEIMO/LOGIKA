// Certificados / medallas solo por hitos (módulo completo o XP), no por cada mini-reto
import { getProgress, addXP } from './gamification.js';
import { getModuleProgress, saveModuleProgress } from './progress.js';
import { LEARNING_PATH, XP_MILESTONES } from '../config/learning-path.js';
import { isLearnPhaseComplete } from './module-learn.js';
import { showMedalCelebration } from './medal.js';
import { showToast } from './ui.js';

const AWARDED_KEY = 'logika_certificates_awarded';

function getAwarded() {
  try {
    return JSON.parse(localStorage.getItem(AWARDED_KEY) || '[]');
  } catch {
    return [];
  }
}

function markAwarded(id) {
  const list = getAwarded();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(AWARDED_KEY, JSON.stringify(list));
  }
}

function hasAwarded(id) {
  return getAwarded().includes(id);
}

function meetsRequirements(progress, requirements) {
  return Object.entries(requirements).every(([key, min]) => (progress[key] || 0) >= min);
}

export function getModuleCompletionPercent(moduleId) {
  const def = LEARNING_PATH.find((m) => m.id === moduleId);
  if (!def) return 0;
  const p = getModuleProgress(moduleId);
  const keys = Object.keys(def.requirements);
  const ratios = keys.map((k) => Math.min(1, (p[k] || 0) / def.requirements[k]));
  return Math.round((ratios.reduce((a, b) => a + b, 0) / keys.length) * 100);
}

export function isModuleComplete(moduleId) {
  const def = LEARNING_PATH.find((m) => m.id === moduleId);
  if (!def) return false;
  if (!isLearnPhaseComplete(moduleId)) return false;
  return meetsRequirements(getModuleProgress(moduleId), def.requirements);
}

/**
 * Otorga certificado si el módulo cumple requisitos (una sola vez).
 * @returns {boolean} si se mostró celebración
 */
export function tryAwardModuleCertificate(moduleId) {
  const def = LEARNING_PATH.find((m) => m.id === moduleId);
  if (!def || hasAwarded(`module_${moduleId}`)) return false;

  if (!isModuleComplete(moduleId)) return false;

  markAwarded(`module_${moduleId}`);
  saveModuleProgress(moduleId, { completed: true, completedAt: new Date().toISOString() });
  addXP(def.xpReward, `cert_module_${moduleId}`);

  showMedalCelebration(def.certificateTitle, 'Módulo completado en la ruta LOGIKA');
  showToast(`¡Módulo completado! +${def.xpReward} XP. Certificado desbloqueado.`, 'success', 4500);
  return true;
}

export function tryAwardXpMilestones() {
  const xp = getProgress().xp;
  let awarded = false;
  for (const m of XP_MILESTONES) {
    const id = `xp_${m.xp}`;
    if (xp >= m.xp && !hasAwarded(id)) {
      markAwarded(id);
      showMedalCelebration(m.title, m.subtitle);
      awarded = true;
    }
  }
  return awarded;
}

/** Certificado especial (ruta colegio, etc.) */
export function tryAwardSpecialCertificate(certId, title, subtitle) {
  if (hasAwarded(certId)) return false;
  markAwarded(certId);
  showMedalCelebration(title, subtitle);
  return true;
}

export function afterModuleActivity(moduleId) {
  tryAwardModuleCertificate(moduleId);
  tryAwardXpMilestones();
}
