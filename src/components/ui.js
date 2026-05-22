// Premium UI: toasts, modals, theme (WCAG-friendly)
import { icon, refreshIcons } from './icons.js';

const THEME_KEY = 'logika-theme';

export function isLightMode() {
  return document.body.classList.contains('light-mode');
}

export function showToast(message, type = 'info', durationMs = 4200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const iconNames = {
    success: 'circle-check',
    error: 'circle-x',
    warning: 'triangle-alert',
    info: 'info'
  };
  const iconName = iconNames[type] || iconNames.info;

  toast.innerHTML = `${icon(iconName)}<span>${message}</span>`;
  container.appendChild(toast);
  refreshIcons(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  const remove = () => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 320);
  };

  setTimeout(remove, durationMs);
  toast.addEventListener('click', remove);
}

export function showModal(title, contentHtml, options = {}) {
  const overlay = document.getElementById('custom-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close-btn');
  const confirmBtn = document.getElementById('modal-confirm-btn');
  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = contentHtml;

  if (options.confirmLabel) {
    confirmBtn.textContent = options.confirmLabel;
    confirmBtn.classList.remove('hidden');
  } else {
    confirmBtn.classList.add('hidden');
  }

  closeBtn.textContent = options.cancelLabel || 'Cerrar';

  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');

  const previousFocus = document.activeElement;
  closeBtn.focus();

  const close = () => {
    overlay.classList.add('hidden');
    document.body.classList.remove('modal-open');
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  };

  const onOverlayClick = (e) => {
    if (e.target === overlay) close();
  };

  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };

  closeBtn.onclick = () => {
    if (options.onCancel) options.onCancel();
    close();
  };
  confirmBtn.onclick = () => {
    if (options.onConfirm) options.onConfirm();
    close();
  };
  overlay.onclick = onOverlayClick;
  document.addEventListener('keydown', onKey, { once: true });

  return { close };
}

export function initTheme() {
  const toggle = document.getElementById('btn-theme-toggle');
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = saved === 'light';

  applyTheme(prefersLight ? 'light' : 'dark', false);

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = isLightMode() ? 'dark' : 'light';
      applyTheme(next, true);
    });
  }
}

function applyTheme(mode, persist) {
  const isLight = mode === 'light';
  document.body.classList.toggle('light-mode', isLight);
  document.body.classList.toggle('cyber-dark', !isLight);

  const toggle = document.getElementById('btn-theme-toggle');
  if (toggle) {
    const label = isLight ? 'Activar modo oscuro' : 'Activar modo claro';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    toggle.setAttribute('aria-checked', isLight ? 'true' : 'false');
    toggle.innerHTML = isLight ? icon('moon') : icon('sun');
    refreshIcons(toggle);
  }

  if (persist) {
    localStorage.setItem(THEME_KEY, mode);
  }

  document.dispatchEvent(new CustomEvent('logika-theme-change', { detail: { mode } }));
}

export function clearLogicError() {
  const el = document.getElementById('logic-error-container');
  if (el) {
    el.classList.add('hidden');
    el.innerHTML = '';
  }
}

export function showLogicError(message, hint = '') {
  const el = document.getElementById('logic-error-container');
  if (!el) return;

  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="logic-error-card" role="alert" aria-live="assertive">
      <span class="error-badge">${icon('triangle-alert')} Error de sintaxis</span>
      <p class="logic-error-msg">${message}</p>
      ${hint ? `<p class="logic-error-hint">${hint}</p>` : ''}
    </div>
  `;
  refreshIcons(el);
}

export function announceLive(regionId, message) {
  const region = document.getElementById(regionId);
  if (region) {
    region.textContent = message;
  }
}
