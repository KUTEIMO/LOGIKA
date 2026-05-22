// Perfil invitado / sesión — caché local (preparado para sincronizar con BD)
const PREFIX = 'logika_';

export function getPlayerNickname() {
  return localStorage.getItem(PREFIX + 'player_nickname') || '';
}

export function setPlayerNickname(name) {
  const trimmed = name.trim().slice(0, 32);
  if (!trimmed) return false;
  localStorage.setItem(PREFIX + 'player_nickname', trimmed);
  localStorage.setItem(PREFIX + 'username', trimmed);
  return true;
}

export function getSchoolProfile() {
  try {
    const raw = localStorage.getItem(PREFIX + 'school_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSchoolProfile({ schoolName, studentName, grade }) {
  const profile = {
    schoolName: schoolName.trim().slice(0, 120),
    studentName: studentName.trim().slice(0, 80),
    grade: String(grade).trim(),
    savedAt: new Date().toISOString()
  };
  if (!profile.schoolName || !profile.studentName || !profile.grade) {
    return false;
  }
  localStorage.setItem(PREFIX + 'school_profile', JSON.stringify(profile));
  localStorage.setItem(PREFIX + 'school_lead_pending_sync', 'true');
  if (profile.studentName) {
    localStorage.setItem(PREFIX + 'player_nickname', profile.studentName);
    localStorage.setItem(PREFIX + 'username', profile.studentName);
  }
  return true;
}

export function hasSchoolProfile() {
  const p = getSchoolProfile();
  return !!(p && p.schoolName && p.studentName && p.grade);
}

export function hasPlayerNickname() {
  return getPlayerNickname().length >= 2;
}

/** Progreso de módulos (invitado o logueado) */
export function getModuleCache() {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + 'module_cache') || '{}');
  } catch {
    return {};
  }
}

export function saveModuleCache(key, data) {
  const cache = getModuleCache();
  cache[key] = { ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(PREFIX + 'module_cache', JSON.stringify(cache));
}

export function getSchoolQuizProgress() {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + 'school_quiz_progress') || 'null');
  } catch {
    return null;
  }
}

export function saveSchoolQuizProgress(stepIndex, completed) {
  localStorage.setItem(
    PREFIX + 'school_quiz_progress',
    JSON.stringify({ stepIndex, completed, updatedAt: new Date().toISOString() })
  );
}

/** Payload listo para Firebase / API cuando conecten BD */
export function exportLeadPayload() {
  const school = getSchoolProfile();
  const nickname = getPlayerNickname();
  const progress = JSON.parse(localStorage.getItem(PREFIX + 'xp') || '0');
  return {
    type: school ? 'school_cta' : 'guest',
    nickname,
    schoolProfile: school,
    xp: progress,
    level: localStorage.getItem(PREFIX + 'level'),
    streak: localStorage.getItem(PREFIX + 'streak'),
    completedChallenges: JSON.parse(localStorage.getItem(PREFIX + 'completed_challenges') || '[]'),
    moduleCache: getModuleCache(),
    exportedAt: new Date().toISOString()
  };
}
