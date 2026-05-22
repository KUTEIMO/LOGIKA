import { getProgress } from './gamification.js';
import { getAllModuleProgress } from './progress.js';
import { isModuleComplete } from './certificates.js';
import { getLearnProgressPercent } from './module-learn.js';
import { LEARNING_PATH } from '../config/learning-path.js';
import { getSchoolProfile, getPlayerNickname } from './profile.js';
import { icon, refreshIcons } from './icons.js';

function getAwardedCerts() {
  try {
    return JSON.parse(localStorage.getItem('logika_certificates_awarded') || '[]');
  } catch {
    return [];
  }
}

export function refreshProfileView() {
  const { xp, level, streak, username, isLoggedIn } = getProgress();
  if (!isLoggedIn) return;

  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };

  set('profile-display-name', username || getPlayerNickname() || 'Estudiante');
  set('profile-xp', String(xp));
  set('profile-level', String(level));
  set('profile-streak', String(streak));

  const email = localStorage.getItem('logika_auth_email') || '—';
  set('profile-email', email);

  const school = getSchoolProfile();
  const schoolEl = document.getElementById('profile-school-block');
  if (schoolEl) {
    if (school) {
      schoolEl.classList.remove('hidden');
      set('profile-school-text', `${school.studentName} · ${school.schoolName} · Grado ${school.grade}`);
    } else {
      schoolEl.classList.add('hidden');
    }
  }

  const modulesEl = document.getElementById('profile-modules-list');
  if (modulesEl) {
    const all = getAllModuleProgress();
    modulesEl.innerHTML = LEARNING_PATH.map((mod) => {
      const learn = getLearnProgressPercent(mod.id);
      const cert = isModuleComplete(mod.id);
      return `
        <li class="profile-module-row">
          <strong>${mod.title}</strong>
          <span>Lecciones ${learn}%</span>
          <span>${cert ? icon('award', 'lk-icon text-yellow') + ' Certificado' : 'En progreso'}</span>
        </li>
      `;
    }).join('');
    refreshIcons(modulesEl);
  }

  const certsEl = document.getElementById('profile-certs-list');
  if (certsEl) {
    const awarded = getAwardedCerts();
    if (!awarded.length) {
      certsEl.innerHTML = '<p class="text-muted text-small">Aún no tienes certificados. Completa módulos en tu ruta.</p>';
    } else {
      certsEl.innerHTML = `<ul class="profile-certs-ul">${awarded.map((id) => `<li><code>${id}</code></li>`).join('')}</ul>`;
    }
  }

  refreshIcons(document.getElementById('profile-view'));
}
