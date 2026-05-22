// Zona de aprendizaje + pestañas Aprender / Practicar por módulo
import { getLessonsForModule } from '../config/module-lessons.js';
import { getModuleProgress, saveModuleProgress } from './progress.js';
import { addXP, playSuccess } from './gamification.js';
import { showToast } from './ui.js';
import { icon, refreshIcons } from './icons.js';

const LESSON_XP = 15;

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

function setModulePhase(moduleId, phase) {
  const view = document.getElementById(`${moduleId}-view`);
  if (!view) return;

  const learnMount = view.querySelector(`#${moduleId}-learn-mount`);
  const practiceZone = view.querySelector(`#${moduleId}-practice-zone`);
  const tabLearn = view.querySelector('[data-phase-tab="learn"]');
  const tabPractice = view.querySelector('[data-phase-tab="practice"]');

  const isLearn = phase === 'learn';
  learnMount?.classList.toggle('hidden', !isLearn);
  practiceZone?.classList.toggle('hidden', isLearn);
  tabLearn?.classList.toggle('active', isLearn);
  tabPractice?.classList.toggle('active', !isLearn);

  saveModuleProgress(moduleId, { currentPhase: phase });
}

function renderLesson(moduleId, index) {
  const lessons = getLessonsForModule(moduleId);
  const lesson = lessons[index];
  const mount = document.getElementById(`${moduleId}-learn-mount`);
  if (!mount || !lesson) return;

  const done = (getModuleProgress(moduleId).lessonsCompleted || []).includes(lesson.id);
  const total = lessons.length;

  mount.innerHTML = `
    <div class="card card-neon learn-card">
      <div class="learn-card-header">
        <span class="learn-step-badge">Lección ${index + 1} de ${total}</span>
        ${done ? `<span class="learn-done-badge">${icon('check', 'lk-icon')} Completada</span>` : ''}
      </div>
      <h3>${lesson.title}</h3>
      <div class="learn-body">${lesson.body}</div>
      <div class="learn-nav">
        <button type="button" class="btn btn-sm btn-dark btn-learn-prev" ${index === 0 ? 'disabled' : ''}>Anterior</button>
        ${done
          ? `<button type="button" class="btn btn-sm btn-primary btn-learn-next">${index < total - 1 ? 'Siguiente lección' : 'Ir a practicar'}</button>`
          : `<button type="button" class="btn btn-sm btn-primary btn-learn-complete">Entendido — continuar (+${LESSON_XP} XP)</button>`
        }
      </div>
    </div>
  `;

  refreshIcons(mount);

  mount.querySelector('.btn-learn-prev')?.addEventListener('click', () => {
    renderLesson(moduleId, index - 1);
  });

  mount.querySelector('.btn-learn-complete')?.addEventListener('click', () => {
    markLessonDone(moduleId, lesson.id);
    addXP(LESSON_XP, `lesson_${moduleId}_${lesson.id}`);
    playSuccess();
    showToast(`Lección completada (+${LESSON_XP} XP)`, 'success', 2200);
    if (isLearnPhaseComplete(moduleId)) {
      unlockPractice(moduleId);
      showToast('¡Zona de práctica desbloqueada!', 'success', 3500);
    }
    renderLesson(moduleId, index);
    updatePhaseTabs(moduleId);
  });

  mount.querySelector('.btn-learn-next')?.addEventListener('click', () => {
    if (index < total - 1) renderLesson(moduleId, index + 1);
    else if (isLearnPhaseComplete(moduleId)) setModulePhase(moduleId, 'practice');
    else showToast('Marca esta lección como completada primero.', 'warning');
  });
}

function unlockPractice(moduleId) {
  const view = document.getElementById(`${moduleId}-view`);
  const tabPractice = view?.querySelector('[data-phase-tab="practice"]');
  tabPractice?.removeAttribute('disabled');
  tabPractice?.classList.remove('locked');
}

function updatePhaseTabs(moduleId) {
  const view = document.getElementById(`${moduleId}-view`);
  const learnPct = getLearnProgressPercent(moduleId);
  const labelLearn = view?.querySelector('.phase-label-learn');
  if (labelLearn) labelLearn.textContent = `Aprender (${learnPct}%)`;
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
        <i data-lucide="flask-conical" class="lk-icon"></i> Practicar
      </button>
    </nav>
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
    setModulePhase(moduleId, savedPhase === 'practice' ? 'practice' : 'learn');
  } else {
    setModulePhase(moduleId, 'learn');
  }

  view.querySelector('[data-phase-tab="learn"]')?.addEventListener('click', () => {
    setModulePhase(moduleId, 'learn');
    const lessons = getLessonsForModule(moduleId);
    const done = (getModuleProgress(moduleId).lessonsCompleted || []).length;
    renderLesson(moduleId, Math.min(done, lessons.length - 1));
  });

  view.querySelector('[data-phase-tab="practice"]')?.addEventListener('click', () => {
    if (!isLearnPhaseComplete(moduleId)) {
      showToast('Completa todas las lecciones antes de practicar.', 'warning');
      return;
    }
    setModulePhase(moduleId, 'practice');
  });

  const lessons = getLessonsForModule(moduleId);
  const startIdx = Math.min(
    (getModuleProgress(moduleId).lessonsCompleted || []).length,
    Math.max(0, lessons.length - 1)
  );
  renderLesson(moduleId, startIdx);
  updatePhaseTabs(moduleId);
  refreshIcons(shell);
}

export function initAllModulePhases() {
  ['logic', 'sets', 'graphs', 'relations'].forEach(initModulePhases);
}
