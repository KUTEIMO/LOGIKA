// Zona de aprendizaje + pestañas Aprender / Practicar por módulo
import {
  getLessonsForModule,
  isUserLoggedIn,
  getGuestComplexity,
  setGuestComplexity,
  COMPLEXITY_OPTIONS
} from '../config/learning-mode.js';
import { getModuleProgress, saveModuleProgress } from './progress.js';
import { addXP, playSuccess } from './gamification.js';
import { showToast } from './ui.js';
import { icon, refreshIcons } from './icons.js';

const LESSON_XP = 15;
const practiceResetHandlers = new Map();

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
  const lessonRoute = view.querySelector(`#${moduleId}-lesson-route`);

  const isLearn = phase === 'learn';
  learnMount?.classList.toggle('hidden', !isLearn);
  practiceZone?.classList.toggle('hidden', isLearn);
  lessonRoute?.classList.toggle('hidden', !isLearn);
  tabLearn?.classList.toggle('active', isLearn);
  tabPractice?.classList.toggle('active', !isLearn);
  practiceHint?.classList.toggle('hidden', isLearn);

  saveModuleProgress(moduleId, { currentPhase: phase });
}

function renderLessonRouteNav(moduleId, activeIndex) {
  const view = document.getElementById(`${moduleId}-view`);
  const nav = view?.querySelector(`#${moduleId}-lesson-route`);
  if (!nav) return;

  const lessons = getLessonsForModule(moduleId);
  const done = getModuleProgress(moduleId).lessonsCompleted || [];

  let html = `<p class="lesson-route-title">${icon('route', 'lk-icon')} Ruta de lecciones</p><div class="lesson-route-pills">`;
  const firstPending = lessons.findIndex((l) => !done.includes(l.id));
  lessons.forEach((lesson, i) => {
    const completed = done.includes(lesson.id);
    const active = i === activeIndex;
    const canOpen = completed || (firstPending !== -1 && i === firstPending);
    html += `
      <button type="button" class="lesson-route-pill ${active ? 'active' : ''} ${completed ? 'done' : ''} ${!canOpen ? 'locked' : ''}"
        data-lesson-index="${i}" ${!canOpen ? 'disabled' : ''}>
        ${completed ? icon('circle-check', 'lk-icon') : icon('book-open', 'lk-icon')}
        <span>${i + 1}. ${lesson.title}</span>
      </button>
    `;
  });
  html += '</div>';
  nav.innerHTML = html;
  refreshIcons(nav);

  nav.querySelectorAll('.lesson-route-pill:not(.locked)').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-lesson-index'), 10);
      renderLesson(moduleId, idx);
    });
  });
}

function renderGuestComplexityBar(moduleId) {
  const view = document.getElementById(`${moduleId}-view`);
  const bar = view?.querySelector(`#${moduleId}-complexity-bar`);
  if (!bar) return;
  if (isUserLoggedIn()) {
    bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');
  const current = getGuestComplexity();
  bar.innerHTML = `
    <label class="complexity-label" for="${moduleId}-complexity-select">${icon('sliders-horizontal', 'lk-icon')} Complejidad del módulo</label>
    <select id="${moduleId}-complexity-select" class="set-input complexity-select">
      ${COMPLEXITY_OPTIONS.map(
        (o) => `<option value="${o.id}" ${o.id === current ? 'selected' : ''}>${o.label}</option>`
      ).join('')}
    </select>
    <p class="text-small text-muted complexity-hint" id="${moduleId}-complexity-hint"></p>
  `;
  const hint = bar.querySelector(`#${moduleId}-complexity-hint`);
  const select = bar.querySelector(`#${moduleId}-complexity-select`);
  const updateHint = () => {
    const opt = COMPLEXITY_OPTIONS.find((o) => o.id === select.value);
    if (hint && opt) hint.textContent = opt.hint;
  };
  updateHint();
  select?.addEventListener('change', () => {
    setGuestComplexity(select.value);
    saveModuleProgress(moduleId, { complexity: select.value });
    updateHint();
    const done = (getModuleProgress(moduleId).lessonsCompleted || []).filter((id) =>
      getLessonsForModule(moduleId).some((l) => l.id === id)
    );
    saveModuleProgress(moduleId, { lessonsCompleted: done, learnComplete: false });
    renderLesson(moduleId, 0);
    updatePhaseTabs(moduleId);
    document.dispatchEvent(new CustomEvent('logika-complexity-change'));
    showToast('Complejidad actualizada. La práctica usará retos acordes.', 'info', 2800);
  });
  refreshIcons(bar);
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
  renderLessonRouteNav(moduleId, index);

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
    document.dispatchEvent(new CustomEvent('logika-practice-enter', { detail: { moduleId } }));
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
    <div class="module-complexity-bar hidden" id="${moduleId}-complexity-bar"></div>
    <p class="module-phase-hint text-small text-muted hidden" id="${moduleId}-practice-hint">
      <i data-lucide="info" class="lk-icon"></i> Puedes volver a <strong>Repasar</strong> y abrir cualquier lección ya vista. Si sales de Practicar, el ejercicio se reiniciará.
    </p>
    <div class="lesson-route-nav hidden" id="${moduleId}-lesson-route" aria-label="Lecciones del módulo"></div>
    <div id="${moduleId}-learn-mount" class="module-learn-mount"></div>
  `;

  const practiceWrap = document.createElement('div');
  practiceWrap.id = `${moduleId}-practice-zone`;
  practiceWrap.className = 'module-practice-zone hidden';
  layout.parentNode.insertBefore(shell, layout);
  practiceWrap.appendChild(layout);
  shell.appendChild(practiceWrap);

  view.dataset.phasesInit = '1';

  renderGuestComplexityBar(moduleId);

  if (isLearnPhaseComplete(moduleId)) {
    unlockPractice(moduleId);
    const savedPhase = getModuleProgress(moduleId).currentPhase;
    setModulePhase(moduleId, savedPhase === 'practice' ? 'practice' : 'learn', { skipReset: true });
  } else {
    setModulePhase(moduleId, 'learn', { skipReset: true });
  }

  view.querySelector('[data-phase-tab="learn"]')?.addEventListener('click', () => {
    setModulePhase(moduleId, 'learn');
    const lessons = getLessonsForModule(moduleId);
    const done = getModuleProgress(moduleId).lessonsCompleted || [];
    const lastDoneIdx = lessons.reduce((acc, l, i) => (done.includes(l.id) ? i : acc), 0);
    renderLesson(moduleId, lastDoneIdx);
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
  const done = getModuleProgress(moduleId).lessonsCompleted || [];
  const lastDoneIdx = lessons.reduce((acc, l, i) => (done.includes(l.id) ? i : acc), 0);
  renderLesson(moduleId, lastDoneIdx);
  updatePhaseTabs(moduleId);
  refreshIcons(shell);
}

export function initAllModulePhases() {
  ['logic', 'sets', 'graphs', 'relations'].forEach(initModulePhases);
}
