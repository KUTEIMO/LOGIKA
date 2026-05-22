import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

let db = null;
let initialized = false;

function getConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
}

export function initFirebase() {
  if (initialized) return !!db;
  const config = getConfig();
  if (!config) {
    console.warn('[LOGIKA] Firebase: falta .env con VITE_FIREBASE_*');
    return false;
  }
  try {
    const app = initializeApp(config);
    db = getFirestore(app);
    isSupported().then((ok) => {
      if (ok) getAnalytics(app);
    });
    initialized = true;
    return true;
  } catch (err) {
    console.error('[LOGIKA] Firebase init error', err);
    return false;
  }
}

export async function syncSchoolLead(payload) {
  if (!db && !initFirebase()) return { ok: false, reason: 'offline' };
  const school = payload?.schoolProfile || payload;
  const schoolName = school.schoolName?.trim?.() || school.schoolName || '';
  const studentName = school.studentName?.trim?.() || school.studentName || payload?.nickname || '';
  const grade = String(school.grade ?? '').trim();
  if (!schoolName || !studentName || !grade) {
    return { ok: false, reason: 'missing_fields' };
  }
  try {
    await addDoc(collection(db, 'school_leads'), {
      schoolName,
      studentName,
      grade,
      nickname: payload?.nickname || studentName,
      xp: payload?.xp ?? 0,
      level: payload?.level ?? '1',
      streak: payload?.streak ?? '0',
      completedChallenges: payload?.completedChallenges ?? [],
      moduleCache: payload?.moduleCache ?? {},
      exportedAt: payload?.exportedAt || new Date().toISOString(),
      createdAt: serverTimestamp(),
      source: 'school_cta'
    });
    return { ok: true };
  } catch (err) {
    console.error('[LOGIKA] syncSchoolLead', err);
    return { ok: false, reason: err.message };
  }
}

export async function syncAchievementMedal(payload) {
  if (!db && !initFirebase()) return { ok: false };
  try {
    await addDoc(collection(db, 'achievements'), {
      ...payload,
      createdAt: serverTimestamp()
    });
    return { ok: true };
  } catch (err) {
    console.error('[LOGIKA] syncAchievementMedal', err);
    return { ok: false };
  }
}

export async function syncGuestProgress(payload) {
  if (!db && !initFirebase()) return { ok: false };
  try {
    await addDoc(collection(db, 'progress_snapshots'), {
      guestId: payload.guestId || '',
      email: payload.email || '',
      nickname: payload.nickname || '',
      xp: payload.xp ?? 0,
      level: payload.level ?? 1,
      modules: payload.modules ?? {},
      completedChallenges: payload.completedChallenges ?? [],
      schoolProfile: payload.schoolProfile ?? null,
      exportedAt: payload.exportedAt || new Date().toISOString(),
      createdAt: serverTimestamp()
    });
    return { ok: true };
  } catch (err) {
    console.error('[LOGIKA] syncGuestProgress', err);
    return { ok: false };
  }
}

/** Alias usado al iniciar sesión */
export async function syncUserProgress(payload) {
  return syncGuestProgress(payload);
}
