import { getProgress } from './gamification.js';
import { getModuleCompletionPercent, isModuleComplete } from './certificates.js';
import { getLearnProgressPercent } from './module-learn.js';
import {
  isUserLoggedIn,
  isRouteModuleLocked,
  canOpenModule,
  getRouteModuleStatus,
  getGuestComplexity,
  setGuestComplexity,
  COMPLEXITY_OPTIONS
} from '../config/learning-mode.js';
import { LEARNING_PATH } from '../config/learning-path.js';
import { refreshIcons, icon } from './icons.js';

/** Panel de módulos — refleja Mi ruta si hay sesión */
export function refreshDashboardUI() {
  const { isLoggedIn } = getProgress();
  document.body.classList.toggle('user-logged-in', isLoggedIn);
  document.body.classList.toggle('user-guest', !isLoggedIn);

  document.getElementById('dashboard-guest-panel')?.classList.toggle('hidden', isLoggedIn);
  document.getElementById('dashboard-logged-cta')?.classList.toggle('hidden', !isLoggedIn);
  document.getElementById('dashboard-guest-complexity')?.classList.toggle('hidden', isLoggedIn);

  document.querySelectorAll('.nav-logged-only').forEach((el) => {
    el.classList.toggle('hidden', !isLoggedIn);
  });

  const welcomeGuest = document.getElementById('dashboard-welcome-guest');
  const welcomeUser = document.getElementById('dashboard-welcome-user');
  if (welcomeGuest) welcomeGuest.classList.toggle('hidden', isLoggedIn);
  if (welcomeUser) welcomeUser.classList.toggle('hidden', !isLoggedIn);

  if (isLoggedIn) {
    const loggedHint = document.getElementById('dashboard-logged-cta');
    if (loggedHint) {
      loggedHint.innerHTML = `
        <p class="text-small text-muted">${icon('route', 'lk-icon')} Los módulos siguen el orden de <strong>Mi ruta</strong>. Completa cada uno para desbloquear el siguiente.</p>
      `;
      refreshIcons(loggedHint);
    }
  }

  bindGuestComplexitySelect();
  renderModuleCardsProgress();
  refreshIcons(document.getElementById('dashboard-view'));
}

function bindGuestComplexitySelect() {
  const select = document.getElementById('guest-complexity-select');
  const hint = document.getElementById('guest-complexity-hint');
  if (!select || select.dataset.bound === '1') return;
  select.dataset.bound = '1';
  select.value = getGuestComplexity();
  const updateHint = () => {
    const opt = COMPLEXITY_OPTIONS.find((o) => o.id === select.value);
    if (hint && opt) hint.textContent = opt.hint;
  };
  updateHint();
  select.addEventListener('change', () => {
    setGuestComplexity(select.value);
    updateHint();
    renderModuleCardsProgress();
    document.dispatchEvent(new CustomEvent('logika-complexity-change'));
  });
}

function renderModuleCardsProgress() {
  document.querySelectorAll('.module-item-card[data-module]').forEach((card) => {
    const id = card.getAttribute('data-module');
    const learn = getLearnProgressPercent(id);
    const practice = getModuleCompletionPercent(id);
    const locked = isRouteModuleLocked(id);
    const status = getRouteModuleStatus(id);
    const order = LEARNING_PATH.find((m) => m.id === id)?.order ?? '';

    let badge = card.querySelector('.module-progress-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'module-progress-badge';
      card.querySelector('.module-footer')?.prepend(badge);
    }

    const btn = card.querySelector('.btn-open-module');

    if (locked) {
      badge.textContent = `Bloqueado · termina módulo ${order - 1}`;
      card.classList.add('module-locked');
      card.classList.remove('module-complete');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `${icon('lock', 'lk-icon')} Bloqueado`;
      }
    } else if (isModuleComplete(id)) {
      badge.textContent = 'Certificado listo';
      card.classList.remove('module-locked');
      card.classList.add('module-complete');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Continuar ${icon('circle-arrow-right', 'lk-icon')}`;
      }
    } else {
      const phase =
        status === 'learn' ? `Aprende ${learn}%` : status === 'practice' ? `Práctica ${practice}%` : '';
      badge.textContent = isUserLoggedIn()
        ? `${phase} · Ruta ${order}`
        : `Aprende ${learn}% · Práctica ${practice}%`;
      card.classList.remove('module-locked', 'module-complete');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Ingresar ${icon('circle-arrow-right', 'lk-icon')}`;
      }
    }
    refreshIcons(card);
  });
}

export function tryOpenModuleFromDashboard(moduleId) {
  if (!canOpenModule(moduleId)) {
    return false;
  }
  return true;
}
