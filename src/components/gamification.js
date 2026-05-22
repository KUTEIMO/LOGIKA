// Gamification & Audio Synthesis Engine using Web Audio API (No dependencies, KISS)

let audioCtx = null;
let isSoundEnabled = true;

// Load sound setting
const savedSound = localStorage.getItem('logika_sound_enabled');
if (savedSound !== null) {
  isSoundEnabled = savedSound === 'true';
}

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Sound Synthesis Functions
export function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  localStorage.setItem('logika_sound_enabled', isSoundEnabled);
  return isSoundEnabled;
}

export function getSoundStatus() {
  return isSoundEnabled;
}

export function playClick() {
  if (!isSoundEnabled) return;
  initAudioContext();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
  
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

export function playSuccess() {
  if (!isSoundEnabled) return;
  initAudioContext();
  
  const t = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Ascending arpeggio)
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t + index * 0.08);
    
    gain.gain.setValueAtTime(0.1, t + index * 0.08);
    gain.gain.setValueAtTime(0.1, t + index * 0.08 + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.08 + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(t + index * 0.08);
    osc.stop(t + index * 0.08 + 0.25);
  });
}

export function playError() {
  if (!isSoundEnabled) return;
  initAudioContext();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.25);
  
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.25);
}

export function playLevelUp() {
  if (!isSoundEnabled) return;
  initAudioContext();
  
  const t = audioCtx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, t + index * 0.06);
    
    gain.gain.setValueAtTime(0.1, t + index * 0.06);
    gain.gain.setValueAtTime(0.1, t + index * 0.06 + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.06 + 0.25);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(t + index * 0.06);
    osc.stop(t + index * 0.06 + 0.3);
  });
}

// User Progress & Storage Engine
const STORAGE_PREFIX = 'logika_';

export function getProgress() {
  const xp = parseInt(localStorage.getItem(STORAGE_PREFIX + 'xp') || '0', 10);
  const streak = parseInt(localStorage.getItem(STORAGE_PREFIX + 'streak') || '0', 10);
  const level = parseInt(localStorage.getItem(STORAGE_PREFIX + 'level') || '1', 10);
  const username = localStorage.getItem(STORAGE_PREFIX + 'username') || 'Invitado';
  const isLoggedIn = localStorage.getItem(STORAGE_PREFIX + 'is_logged_in') === 'true';
  const completedChallenges = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'completed_challenges') || '[]');
  
  return { xp, streak, level, username, isLoggedIn, completedChallenges };
}

export function addXP(amount, challengeId = null) {
  const current = getProgress();
  
  // Prevent duplicate XP for same challenge if provided
  if (challengeId) {
    if (current.completedChallenges.includes(challengeId)) {
      return { levelUp: false, newXP: current.xp };
    }
    current.completedChallenges.push(challengeId);
    localStorage.setItem(STORAGE_PREFIX + 'completed_challenges', JSON.stringify(current.completedChallenges));
  }
  
  const newXP = current.xp + amount;
  localStorage.setItem(STORAGE_PREFIX + 'xp', newXP);
  
  // Calculate Level (KISS: 200 XP per level)
  const newLevel = Math.floor(newXP / 200) + 1;
  let levelUp = false;
  
  if (newLevel > current.level) {
    localStorage.setItem(STORAGE_PREFIX + 'level', newLevel);
    levelUp = true;
    playLevelUp();
  } else {
    playSuccess();
  }
  
  updateUI();
  return { levelUp, newXP, newLevel };
}

export function updateStreak() {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActive = localStorage.getItem(STORAGE_PREFIX + 'last_active');
  let currentStreak = parseInt(localStorage.getItem(STORAGE_PREFIX + 'streak') || '0', 10);
  
  if (!lastActive) {
    // First time
    currentStreak = 1;
  } else {
    const lastDate = new Date(lastActive);
    const todayDate = new Date(todayStr);
    const diffTime = Math.abs(todayDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      currentStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      currentStreak = 1;
    }
    // If diffDays is 0, it is the same day. Do nothing.
  }
  
  localStorage.setItem(STORAGE_PREFIX + 'streak', currentStreak);
  localStorage.setItem(STORAGE_PREFIX + 'last_active', todayStr);
  updateUI();
}

export function setUser(username, isLoggedIn = true) {
  localStorage.setItem(STORAGE_PREFIX + 'username', username);
  localStorage.setItem(STORAGE_PREFIX + 'is_logged_in', isLoggedIn);
  updateUI();
}

export function logoutUser() {
  const nickname = localStorage.getItem(STORAGE_PREFIX + 'player_nickname');
  localStorage.setItem(STORAGE_PREFIX + 'is_logged_in', 'false');
  localStorage.setItem(STORAGE_PREFIX + 'username', nickname || 'Invitado');
  updateUI();
}

export function updateUI() {
  const data = getProgress();
  
  // Update header badges
  const xpEl = document.getElementById('header-xp');
  const streakEl = document.getElementById('header-streak');
  const usernameEl = document.getElementById('header-username');
  const profileSummary = document.getElementById('user-profile-summary');
  const loginBtn = document.getElementById('btn-login-view');
  
  if (xpEl) xpEl.textContent = data.xp;
  if (streakEl) streakEl.textContent = data.streak;
  
  if (usernameEl) {
    usernameEl.textContent = data.username;
  }
  
  if (data.isLoggedIn) {
    profileSummary?.classList.remove('hidden');
    loginBtn?.classList.add('hidden');
    document.body.classList.add('user-logged-in');
    document.body.classList.remove('user-guest');
  } else {
    profileSummary?.classList.add('hidden');
    loginBtn?.classList.remove('hidden');
    document.body.classList.remove('user-logged-in');
    document.body.classList.add('user-guest');
  }
}
