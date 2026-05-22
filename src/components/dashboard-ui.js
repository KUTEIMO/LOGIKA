import { getProgress } from './gamification.js';
import { getModuleCompletionPercent, isModuleComplete } from './certificates.js';
import { getLearnProgressPercent } from './module-learn.js';
import { refreshIcons } from './icons.js';

/** Panel de módulos — invitados y logueados (sin ruta aquí; la ruta es vista aparte) */
export function refreshDashboardUI() {
  const { isLoggedIn } = getProgress();
  document.body.classList.toggle('user-logged-in', isLoggedIn);
  document.body.classList.toggle('user-guest', !isLoggedIn);

  document.getElementById('dashboard-guest-panel')?.classList.toggle('hidden', isLoggedIn);
  document.getElementById('dashboard-logged-cta')?.classList.toggle('hidden', !isLoggedIn);

  document.querySelectorAll('.nav-logged-only').forEach((el) => {
    el.classList.toggle('hidden', !isLoggedIn);
  });

  const welcomeGuest = document.getElementById('dashboard-welcome-guest');
  const welcomeUser = document.getElementById('dashboard-welcome-user');
  if (welcomeGuest) welcomeGuest.classList.toggle('hidden', isLoggedIn);
  if (welcomeUser) welcomeUser.classList.toggle('hidden', !isLoggedIn);

  renderModuleCardsProgress();
  refreshIcons(document.getElementById('dashboard-view'));
}

function renderModuleCardsProgress() {
  document.querySelectorAll('.module-item-card[data-module]').forEach((card) => {
    const id = card.getAttribute('data-module');
    const learn = getLearnProgressPercent(id);
    const practice = getModuleCompletionPercent(id);
    let badge = card.querySelector('.module-progress-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'module-progress-badge';
      card.querySelector('.module-footer')?.prepend(badge);
    }
    if (isModuleComplete(id)) badge.textContent = 'Certificado ✓';
    else badge.textContent = `Aprende ${learn}% · Práctica ${practice}%`;
    card.classList.toggle('module-complete', isModuleComplete(id));
  });
}
