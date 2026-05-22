// Zona de aprendizaje + pestañas Aprender / Practicar por módulo
import { getLessonsForModule } from '../config/module-lessons.js';
import { getModuleProgress, saveModuleProgress } from './progress.js';
import { addXP, playSuccess } from './gamification.js';
import { showToast } from './ui.js';
import { icon, refreshIcons } from './icons.js';

const LESSON_XP = 15;
const practiceResetHandlers = new Map();

/** Registrar reinicio de práctica al volver a Aprender */
export function registerPracticeReset(moduleId, fn) {
  practiceResetHandlers.set(moduleId, fn);
}

export function isLearnPhaseComplete(moduleId) {
  const lessons = getLessonsForModule(moduleId);
  if (!lessons.length) return true;
  const done = getModuleProgress(moduleId).lessonsCompleted || [];
  return lessons.every((l) => done.includes(l.id));
}

export function getLearnProgressPercent(moduleId) {
  const lessons = getLessonsForModule(moduleId);
  if (!lessons.length) return 100;
  const done = getModuleProgress(moduleId).lessonsCompleted || [];
  return Math.round((done.filter((id) => lessons.some((l) => l.id === id)).length / lessons.length) * 100);
}

function markLessonDone(moduleId, lessonId) {
  const p = getModuleProgress(moduleId);
  const completed = [...new Set([...(p.lessonsCompleted || []), lessonId])];
  saveModuleProgress(moduleId, {
    lessonsCompleted: completed,
    learnComplete: isLearnCompleteAfter(completed, moduleId)
  });
}

function isLearnCompleteAfter(completed, moduleId) {
  const lessons = getLessonsForModule(moduleId);
  return lessons.every((l) => completed.includes(l.id));
}

function resetPracticeState(moduleId) {
  const n = (getModuleProgress(moduleId).practiceResetCount || 0) + 1;
  saveModuleProgress(moduleId, { practiceResetCount: n });
  practiceResetHandlers.get(moduleId)?.();
  document.dispatchEvent(new CustomEvent('logika-practice-reset', { detail: { moduleId } }));
}

function setModulePhase(moduleId, phase, options = {}) {
  const view = document.getElementById(`${moduleId}-view`);
  if (!view) return;

  const prev = getModuleProgress(moduleId).currentPhase || 'learn';

  if (prev === 'practice' && phase === 'learn' && !options.skipReset) {
    resetPracticeState(moduleId);
  }

  const learnMount = view.querySelector(`#${moduleId}-learn-mount`);
  const practiceZone = view.querySelector(`#${moduleId}-practice-zone`);
  const tabLearn = view.querySelector('[data-phase-tab="learn"]');
  const tabPractice = view.querySelector('[data-phase-tab="practice"]');
  const practiceHint = view.querySelector(`#${moduleId}-practice-hint`);

  const isLearn = phase === 'learn';
  learnMount?.classList.toggle('hidden', !isLearn);
  practiceZone?.classList.toggle('hidden', isLearn);
  tabLearn?.classList.toggle('active', isLearn);
  tabPractice?.classList.toggle('active', !isLearn);
  practiceHint?.classList.toggle('hidden', isLearn);

  saveModuleProgress(moduleId, { currentPhase: phase });
}

function renderLesson(moduleId, index) {
  const lessons = getLessonsForModule(moduleId);
  const lesson = lessons[index];
  const mount = document.getElementById(`${moduleId}-learn-mount`);
  if (!mount || !lesson) return;

  const done = (getModuleProgress(moduleId).lessonsCompleted || []).includes(lesson.id);
  const total = lessons.length;
  const allDone = isLearnPhaseComplete(moduleId);

  mount.innerHTML = `
    <div class="card card-neon learn-card">
      <div class="learn-card-header">
        <span class="learn-step-badge">Lección ${index + 1} de ${total}</span>
        ${done ? `<span class="learn-done-badge">${icon('check', 'lk-icon')} Vista</span>` : ''}
      </div>
      <h3>${lesson.title}</h3>
      <div class="learn-body">${lesson.body}</div>
      <div class="learn-nav">
        <button type="button" class="btn btn-sm btn-dark btn-learn-prev" ${index === 0 ? 'disabled' : ''}>Anterior</button>
        ${!done
          ? `<button type="button" class="btn btn-sm btn-primary btn-learn-complete">Lo entendí — continuar (+${LESSON_XP} XP)</button>`
          : `<button type="button" class="btn btn-sm btn-secondary btn-learn-next">${index < total - 1 ? 'Siguiente' : ''}</button>
             ${allDone ? `<button type="button" class="btn btn-sm btn-primary btn-go-practice">Ir a practicar</button>` : ''}`
        }
      </div>
    </div>
  `;

  refreshIcons(mount);

  mount.querySelector('.btn-learn-prev')?.addEventListener('click', () => renderLesson(moduleId, index - 1));

  mount.querySelector('.btn-learn-complete')?.addEventListener('click', () => {
    markLessonDone(moduleId, lesson.id);
    addXP(LESSON_XP, `lesson_${moduleId}_${lesson.id}`);
    playSuccess();
    showToast(`+${LESSON_XP} XP · Lección registrada`, 'success', 2000);
    if (isLearnPhaseComplete(moduleId)) unlockPractice(moduleId);
    renderLesson(moduleId, index);
    updatePhaseTabs(moduleId);
  });

  mount.querySelector('.btn-learn-next')?.addEventListener('click', () => {
    if (index < total - 1) renderLesson(moduleId, index + 1);
  });

  mount.querySelector('.btn-go-practice')?.addEventListener('click', () => {
    if (!isLearnPhaseComplete(moduleId)) {
      showToast('Completa todas las lecciones primero.', 'warning');
      return;
    }
    setModulePhase(moduleId, 'practice');
  });
}

function unlockPractice(moduleId) {
  const view = document.getElementById(`${moduleId}-view`);
  const tabPractice = view?.querySelector('[data-phase-tab="practice"]');
  tabPractice?.removeAttribute('disabled');
  tabPractice?.classList.remove('locked');
  view?.querySelector(`#${moduleId}-practice-hint`)?.classList.remove('hidden');
  updatePhaseTabs(moduleId);
}

function updatePhaseTabs(moduleId) {
  const view = document.getElementById(`${moduleId}-view`);
  const learnPct = getLearnProgressPercent(moduleId);
  const labelLearn = view?.querySelector('.phase-label-learn');
  const labelPractice = view?.querySelector('.phase-label-practice');
  if (labelLearn) {
    labelLearn.textContent = isLearnPhaseComplete(moduleId)
      ? `Repasar (${learnPct}%)`
      : `Aprender (${learnPct}%)`;
  }
  if (labelPractice) {
    labelPractice.textContent = isLearnPhaseComplete(moduleId) ? 'Practicar' : 'Practicar (bloqueado)';
  }
}

export function initModulePhases(moduleId) {
  const view = document.getElementById(`${moduleId}-view`);
  if (!view || view.dataset.phasesInit === '1') return;

  const layout = view.querySelector('.module-layout');
  if (!layout) return;

  const shell = document.createElement('div');
  shell.className = 'module-phases';
  shell.innerHTML = `
    <nav class="module-phase-tabs" aria-label="Fases del módulo">
      <button type="button" class="module-phase-tab active" data-phase-tab="learn">
        <i data-lucide="book-open" class="lk-icon"></i> <span class="phase-label-learn">Aprender</span>
      </button>
      <button type="button" class="module-phase-tab locked" data-phase-tab="practice" disabled>
        <i data-lucide="flask-conical" class="lk-icon"></i> <span class="phase-label-practice">Practicar</span>
      </button>
    </nav>
    <p class="module-phase-hint text-small text-muted hidden" id="${moduleId}-practice-hint">
      <i data-lucide="info" class="lk-icon"></i> Puedes volver a <strong>Repasar</strong> cuando quieras. Si sales de Practicar, el ejercicio se reiniciará.
    </p>
    <div id="${moduleId}-learn-mount" class="module-learn-mount"></div>
  `;

  const practiceWrap = document.createElement('div');
  practiceWrap.id = `${moduleId}-practice-zone`;
  practiceWrap.className = 'module-practice-zone hidden';
  layout.parentNode.insertBefore(shell, layout);
  practiceWrap.appendChild(layout);
  shell.appendChild(practiceWrap);

  view.dataset.phasesInit = '1';

  if (isLearnPhaseComplete(moduleId)) {
    unlockPractice(moduleId);
    const savedPhase = getModuleProgress(moduleId).currentPhase;
    setModulePhase(moduleId, savedPhase === 'practice' ? 'practice' : 'learn', { skipReset: true });
  } else {
    setModulePhase(moduleId, 'learn', { skipReset: true });
  }

  view.querySelector('[data-phase-tab="learn"]')?.addEventListener('click', () => {
    const lessons = getLessonsForModule(moduleId);
    const done = (getModuleProgress(moduleId).lessonsCompleted || []).length;
    setModulePhase(moduleId, 'learn');
    renderLesson(moduleId, Math.min(Math.max(0, done - 1), lessons.length - 1));
  });

  view.querySelector('[data-phase-tab="practice"]')?.addEventListener('click', () => {
    if (!isLearnPhaseComplete(moduleId)) {
      showToast('Termina las lecciones de Aprender primero.', 'warning');
      return;
    }
    setModulePhase(moduleId, 'practice');
    document.dispatchEvent(new CustomEvent('logika-practice-enter', { detail: { moduleId } }));
  });

  const lessons = getLessonsForModule(moduleId);
  const startIdx = Math.min(
    Math.max(0, (getModuleProgress(moduleId).lessonsCompleted || []).length - 1),
    lessons.length - 1
  );
  renderLesson(moduleId, startIdx);
  updatePhaseTabs(moduleId);
  refreshIcons(shell);
}

export function initAllModulePhases() {
  ['logic', 'sets', 'graphs', 'relations'].forEach(initModulePhases);
}
