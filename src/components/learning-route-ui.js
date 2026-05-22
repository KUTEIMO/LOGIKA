import { getProgress } from './gamification.js';
import { getModuleProgress } from './progress.js';
import { isModuleComplete, getModuleCompletionPercent } from './certificates.js';
import { getLearnProgressPercent, isLearnPhaseComplete } from './module-learn.js';
import { LEARNING_PATH } from '../config/learning-path.js';
import { getLessonsForModule, isRouteModuleLocked } from '../config/learning-mode.js';
import { icon, refreshIcons } from './icons.js';

export function refreshLearningRouteView() {
  const container = document.getElementById('route-modules-list');
  if (!container) return;

  let html = '';

  LEARNING_PATH.forEach((mod, idx) => {
    const learnPct = getLearnProgressPercent(mod.id);
    const practicePct = getModuleCompletionPercent(mod.id);
    const lessons = getLessonsForModule(mod.id);
    const doneLessons = (getModuleProgress(mod.id).lessonsCompleted || []).length;
    const routeLocked = isRouteModuleLocked(mod.id);

    const overall = Math.round(learnPct * 0.4 + practicePct * 0.6);

    html += `
      <article class="route-module-card ${routeLocked ? 'route-locked' : ''}" data-module="${mod.id}">
        <header class="route-module-head">
          <span class="route-module-order">${mod.order}</span>
          <div>
            <h3>${mod.title}</h3>
            <p class="text-small text-muted">Progreso total del módulo: <strong>${overall}%</strong></p>
          </div>
          ${isModuleComplete(mod.id) ? `<span class="route-cert-badge">${icon('award', 'lk-icon')} Certificado</span>` : ''}
        </header>

        <div class="route-levels">
          <div class="route-level ${learnPct >= 100 ? 'route-level-done' : ''}">
            <span class="route-level-icon">${icon('book-open', 'lk-icon')}</span>
            <div>
              <strong>Nivel 1 · Aprendizaje</strong>
              <p class="text-small">${doneLessons} / ${lessons.length} lecciones</p>
              <div class="path-progress-bar"><div class="path-progress-fill" style="width:${learnPct}%"></div></div>
            </div>
          </div>
          <div class="route-level ${!isLearnPhaseComplete(mod.id) ? 'route-level-locked' : practicePct >= 100 ? 'route-level-done' : ''}">
            <span class="route-level-icon">${icon('flask-conical', 'lk-icon')}</span>
            <div>
              <strong>Nivel 2 · Práctica interactiva</strong>
              <p class="text-small">Simuladores y retos del módulo</p>
              <div class="path-progress-bar"><div class="path-progress-fill" style="width:${isLearnPhaseComplete(mod.id) ? practicePct : 0}%"></div></div>
            </div>
          </div>
          <div class="route-level ${isModuleComplete(mod.id) ? 'route-level-done' : 'route-level-locked'}">
            <span class="route-level-icon">${icon('award', 'lk-icon')}</span>
            <div>
              <strong>Nivel 3 · Certificado</strong>
              <p class="text-small">Al completar lecciones + práctica</p>
            </div>
          </div>
        </div>

        <div class="route-module-actions">
          ${routeLocked
            ? '<span class="text-small text-muted">Desbloquea al terminar el módulo anterior</span>'
            : `<button type="button" class="btn btn-sm btn-primary btn-route-open-module" data-module="${mod.id}">Continuar módulo</button>`
          }
        </div>
      </article>
    `;
  });

  container.innerHTML = html;
  refreshIcons(document.getElementById('learning-route-view'));

  container.querySelectorAll('.btn-route-open-module').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mod = btn.getAttribute('data-module');
      document.dispatchEvent(new CustomEvent('logika-navigate-module', { detail: { moduleId: mod } }));
    });
  });
}

export function refreshRouteSummary() {
  const { xp, level, streak, username } = getProgress();
  const el = (id, val) => {
    const n = document.getElementById(id);
    if (n) n.textContent = val;
  };
  el('route-user-name', username);
  el('route-stat-xp', String(xp));
  el('route-stat-level', String(level));
  el('route-stat-streak', String(streak));

  const completed = LEARNING_PATH.filter((m) => isModuleComplete(m.id)).length;
  el('route-stat-modules', `${completed} / ${LEARNING_PATH.length}`);
}
