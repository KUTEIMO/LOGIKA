/** Perfil de almacenamiento: invitado vs usuario (email) */
const PREFIX = 'logika_';

export function sanitizeProfileId(raw) {
  return String(raw || 'anon')
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '_')
    .slice(0, 80);
}

export function getGuestId() {
  let id = localStorage.getItem(PREFIX + 'guest_id');
  if (!id) {
    id = `guest_${crypto.randomUUID?.() ?? Date.now()}`;
    localStorage.setItem(PREFIX + 'guest_id', id);
  }
  return id;
}

export function getActiveProfileId() {
  const isLoggedIn = localStorage.getItem(PREFIX + 'is_logged_in') === 'true';
  if (isLoggedIn) {
    const email = localStorage.getItem(PREFIX + 'auth_email') || '';
    return `user_${sanitizeProfileId(email || 'session')}`;
  }
  return `guest_${sanitizeProfileId(getGuestId())}`;
}

export function scopedKey(baseName) {
  return `${PREFIX}${baseName}__${getActiveProfileId()}`;
}

const LEGACY_MODULES_KEY = PREFIX + 'module_progress';

export function migrateLegacyModuleProgressIfNeeded() {
  const key = scopedKey('module_progress');
  if (localStorage.getItem(key)) return;
  const legacy = localStorage.getItem(LEGACY_MODULES_KEY);
  if (legacy) {
    localStorage.setItem(key, legacy);
  }
}

export function copyProfileData(fromProfileId, toProfileId, baseNames) {
  baseNames.forEach((base) => {
    const fromKey = `${PREFIX}${base}__${fromProfileId}`;
    const toKey = `${PREFIX}${base}__${toProfileId}`;
    if (!localStorage.getItem(toKey) && localStorage.getItem(fromKey)) {
      localStorage.setItem(toKey, localStorage.getItem(fromKey));
    }
  });
}

export function onUserLogin(email) {
  localStorage.setItem(PREFIX + 'auth_email', email || '');
  const guestId = `guest_${sanitizeProfileId(getGuestId())}`;
  const userId = `user_${sanitizeProfileId(email || 'session')}`;
  const bases = ['module_progress', 'xp', 'level', 'streak', 'completed_challenges', 'certificates_awarded', 'local_action_count'];
  copyProfileData(guestId, userId, bases);
  migrateLegacyModuleProgressIfNeeded();
}

export function onUserLogout() {
  migrateLegacyModuleProgressIfNeeded();
}
