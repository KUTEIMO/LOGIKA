// Central Bootstrap, Router, and Guest School Game Loop (KISS & Premium Interaction)
import { initFloatingMascot, setGlobalMascotExpression, renderMascot, updateFloatingMascotVisibility } from './components/mascot.js';
import { initMascotInteractivity } from './components/mascot-interactive.js';
import {
  hasPlayerNickname,
  setPlayerNickname,
  getPlayerNickname,
  hasSchoolProfile,
  setSchoolProfile,
  getSchoolProfile,
  saveSchoolQuizProgress,
  getSchoolQuizProgress
} from './components/profile.js';
import { 
  getProgress, 
  addXP, 
  updateStreak, 
  setUser, 
  logoutUser, 
  updateUI, 
  toggleSound, 
  getSoundStatus,
  playClick,
  playSuccess,
  playError
} from './components/gamification.js';

import { initLogicModule } from './modules/logic.js';
import { initSetsModule } from './modules/sets.js';
import { initGraphsModule } from './modules/graphs.js';
import { initRelationsModule } from './modules/relations.js';
import { initTheme, showToast, showModal } from './components/ui.js';
import { initIcons, refreshIcons, icon } from './components/icons.js';
import { initFirebase, syncSchoolLead, syncUserProgress } from './services/firebase.js';
import { exportLeadPayload } from './components/profile.js';
import { buildProgressPayload, offerModuleResume, promptLoginIfNeeded, onUserLogin, onUserLogout } from './components/progress.js';
import { canOpenModule } from './config/learning-mode.js';
import { tryOpenModuleFromDashboard } from './components/dashboard-ui.js';
import { tryAwardSpecialCertificate } from './components/certificates.js';
import { refreshDashboardUI } from './components/dashboard-ui.js';
import { refreshLearningRouteView, refreshRouteSummary } from './components/learning-route-ui.js';
import { refreshProfileView } from './components/profile-ui.js';
import { initAllModulePhases, initModulePhases } from './components/module-learn.js';
import { SCHOOL_ROUTE_CERTIFICATE } from './config/learning-path.js';
import { SCHOOL_ADVENTURE } from './config/school-adventure.js';

// School Guest Mode: lección → reto por etapa
let schoolQuizStepIndex = 0;
let schoolSubPhase = 'lesson';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initIcons();
  initFirebase();
  if (localStorage.getItem('logika_school_lead_pending_sync') === 'true') {
    syncSchoolLead(exportLeadPayload()).then((r) => {
      if (r.ok) localStorage.removeItem('logika_school_lead_pending_sync');
    });
  }

  // 1. Initialize Gamification & Streaks
  updateStreak();
  updateUI();
  refreshDashboardUI();

  // 2. Initialize Mascot + interacción (cursor, ejercicios)
  initFloatingMascot();
  initMascotInteractivity();
  updateFloatingMascotVisibility('landing-view');

  // 3. Initialize Math Modules
  initLogicModule();
  initSetsModule();
  initGraphsModule();
  initRelationsModule();
  initAllModulePhases();

  // 4. Setup Router & View Navigation
  const navButtons = document.querySelectorAll('.nav-links .nav-btn, #btn-logo');
  const views = document.querySelectorAll('.main-content .view');

  const LOGIN_ONLY_VIEWS = ['learning-route-view', 'profile-view'];

  function navigateTo(targetViewId) {
    if (LOGIN_ONLY_VIEWS.includes(targetViewId) && !getProgress().isLoggedIn) {
      showToast('Inicia sesión para acceder a Mi ruta y Mi perfil.', 'warning');
      navigateTo('login-view');
      return;
    }

    views.forEach(v => v.classList.remove('active'));
    
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
      targetView.classList.add('active');
    }
    
    // Update navigation active button state
    navButtons.forEach(btn => {
      const target = btn.getAttribute('data-target');
      if (target === targetViewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updateFloatingMascotVisibility(targetViewId);

    if (targetViewId === 'landing-view') {
      renderMascot('mascot-landing-placeholder', 'normal');
    } else if (targetViewId === 'school-view') {
      renderMascot('mascot-school-container', 'friendly');
    } else if (targetViewId === 'dashboard-view') {
      setGlobalMascotExpression('happy', { speak: false });
      refreshDashboardUI();
      if (getProgress().isLoggedIn) {
        refreshLearningRouteView();
      }
    } else if (targetViewId === 'learning-route-view') {
      refreshRouteSummary();
      refreshLearningRouteView();
    } else if (targetViewId === 'profile-view') {
      refreshProfileView();
    } else if (['logic-view', 'sets-view', 'graphs-view', 'relations-view'].includes(targetViewId)) {
      const moduleId = targetViewId.replace('-view', '');
      initModulePhases(moduleId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target') || 'landing-view';
      playClick();
      navigateTo(target);
    });
  });

  // Action Buttons from Landing Page
  document.getElementById('btn-logo').addEventListener('click', () => {
    navigateTo('landing-view');
  });

  document.getElementById('btn-start-playing').addEventListener('click', () => {
    playClick();
    if (!hasPlayerNickname()) {
      openNicknameModal(null);
      return;
    }
    navigateTo('dashboard-view');
  });

  document.getElementById('btn-guest-trial').addEventListener('click', () => {
    playClick();
    if (!hasPlayerNickname()) {
      localStorage.setItem('logika_player_nickname', 'Explorador');
      localStorage.setItem('logika_username', 'Explorador');
      updateUI();
    }
    navigateTo('dashboard-view');
    showToast('Modo prueba: tu progreso se guarda en este navegador. Inicia sesión para respaldarlo en la nube.', 'info', 5000);
  });

  document.getElementById('btn-login-view').addEventListener('click', () => {
    playClick();
    navigateTo('login-view');
  });

  // Back to Dashboard buttons in modules
  document.querySelectorAll('.btn-back-dashboard').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      navigateTo('dashboard-view');
    });
  });

  // Apodo / caché invitado
  const nicknameModal = document.getElementById('nickname-modal');
  const nicknameInput = document.getElementById('nickname-input');
  let pendingModuleNav = null;

  function openNicknameModal(targetModule) {
    pendingModuleNav = targetModule;
    nicknameModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    nicknameInput.value = getPlayerNickname();
    nicknameInput.focus();
  }

  function closeNicknameModal() {
    nicknameModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    pendingModuleNav = null;
  }

  document.getElementById('nickname-modal-save')?.addEventListener('click', () => {
    const name = nicknameInput.value.trim();
    if (!setPlayerNickname(name)) {
      showToast('Escribe un apodo de al menos 2 caracteres.', 'warning');
      return;
    }
    playSuccess();
    showToast(`¡Hola, ${name}! Tu progreso se guardará en este dispositivo.`, 'success');
    updateUI();
    const target = pendingModuleNav;
    closeNicknameModal();
    if (target) navigateTo(`${target}-view`);
    else navigateTo('dashboard-view');
  });

  document.getElementById('nickname-modal-close')?.addEventListener('click', closeNicknameModal);

  const moduleLabels = {
    logic: { title: 'Lógica proposicional' },
    sets: { title: 'Teoría de conjuntos' },
    graphs: { title: 'Teoría de grafos' },
    relations: { title: 'Relaciones y matrices' }
  };

  function openModule(mod) {
    if (!canOpenModule(mod)) {
      showToast('Este módulo está bloqueado. Completa el anterior en Mi ruta.', 'warning');
      return;
    }
    initModulePhases(mod);
    navigateTo(`${mod}-view`);
  }

  document.addEventListener('logika-navigate-module', (e) => {
    const mod = e.detail?.moduleId;
    if (mod) openModule(mod);
  });

  document.querySelectorAll('[data-target]').forEach((btn) => {
    if (btn.classList.contains('nav-btn')) return;
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target) {
        playClick();
        navigateTo(target);
      }
    });
  });

  document.querySelectorAll('.btn-open-module').forEach(btn => {
    btn.addEventListener('click', () => {
      const mod = btn.getAttribute('data-module');
      playClick();
      if (!tryOpenModuleFromDashboard(mod)) {
        showToast('Completa el módulo anterior para desbloquear este.', 'warning');
        return;
      }
      if (!hasPlayerNickname()) {
        openNicknameModal(mod);
        return;
      }
      offerModuleResume(mod, moduleLabels[mod] || {}, () => openModule(mod), () => openModule(mod));
    });
  });

  document.addEventListener('logika-complexity-change', () => {
    refreshDashboardUI();
  });

  // User Profile actions
  document.getElementById('btn-logout').addEventListener('click', () => {
    playClick();
    onUserLogout();
    logoutUser();
    refreshDashboardUI();
    refreshRouteSummary();
    navigateTo('landing-view');
    showToast('Has cerrado sesión.', 'info');
  });

  document.getElementById('dashboard-cta-login')?.addEventListener('click', () => {
    playClick();
    navigateTo('login-view');
  });

  document.getElementById('btn-auth-guest').addEventListener('click', () => {
    playClick();
    navigateTo('dashboard-view');
  });

  // Login form submission handler
  const authForm = document.getElementById('auth-form');
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    playClick();
    
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const usernameInput = document.getElementById('auth-username').value.trim();
    const mode = document.querySelector('input[name="auth-mode"]:checked').value;
    
    localStorage.setItem('logika_auth_email', email);
    onUserLogin(email);

    if (mode === 'register') {
      if (!usernameInput) {
        showToast('Por favor escribe un nombre de usuario para el registro.', 'warning');
        return;
      }
      setPlayerNickname(usernameInput);
      setUser(usernameInput, true);
      addXP(100);
      playSuccess();
      showModal(
        'Registro exitoso',
        `<p>¡Bienvenido, <strong>${usernameInput}</strong>! Te hemos otorgado <strong>+100 XP</strong> de regalo.</p><p>Tu progreso local se respaldó en Firestore.</p>`,
        { confirmLabel: '¡A aprender!' }
      );
    } else {
      const name = usernameInput || email.split('@')[0] || 'estudiante';
      if (usernameInput) setPlayerNickname(usernameInput);
      setUser(name, true);
      playSuccess();
      showToast(`Sesión iniciada. Progreso respaldado, ${name}.`, 'success');
    }

    syncUserProgress(buildProgressPayload(email)).then((r) => {
      if (!r.ok) showToast('Sesión OK, pero no se pudo subir el progreso. Revisa la conexión.', 'warning');
    });

    authForm.reset();
    updateUI();
    refreshDashboardUI();
    refreshRouteSummary();
    navigateTo('dashboard-view');
  });

  // 5. Sound toggle action handler
  const soundBtn = document.getElementById('btn-toggle-sound');
  soundBtn.addEventListener('click', () => {
    const isEnabled = toggleSound();
    playClick();
    if (isEnabled) {
      soundBtn.classList.remove('muted');
      soundBtn.innerHTML = icon('volume-2');
      refreshIcons(soundBtn);
    } else {
      soundBtn.classList.add('muted');
      soundBtn.innerHTML = icon('volume-x');
      refreshIcons(soundBtn);
    }
  });

  // Set initial sound state
  if (!getSoundStatus()) {
    soundBtn.classList.add('muted');
    soundBtn.innerHTML = icon('volume-x');
    refreshIcons(soundBtn);
  }

  // Colegio: CTA (colegio, nombre, grado) — lead local + futuro BD
  const schoolCtaForm = document.getElementById('school-cta-form');
  const schoolCtaSaved = document.getElementById('school-cta-saved');
  const schoolCtaSummary = document.getElementById('school-cta-summary');

  function refreshSchoolCtaUI() {
    const profile = getSchoolProfile();
    if (profile) {
      schoolCtaForm?.classList.add('hidden');
      schoolCtaSaved?.classList.remove('hidden');
      if (schoolCtaSummary) {
        schoolCtaSummary.innerHTML = `<strong>${profile.studentName}</strong> · ${profile.schoolName} · Grado ${profile.grade}`;
      }
      document.getElementById('school-name-input').value = profile.schoolName;
      document.getElementById('student-name-input').value = profile.studentName;
      document.getElementById('student-grade-select').value = profile.grade;
    } else {
      schoolCtaForm?.classList.remove('hidden');
      schoolCtaSaved?.classList.add('hidden');
    }
  }

  refreshSchoolCtaUI();

  document.getElementById('btn-save-school-profile')?.addEventListener('click', () => {
    playClick();
    const ok = setSchoolProfile({
      schoolName: document.getElementById('school-name-input').value,
      studentName: document.getElementById('student-name-input').value,
      grade: document.getElementById('student-grade-select').value
    });
    if (!ok) {
      showToast('Completa colegio, nombre y grado.', 'warning');
      return;
    }
    setPlayerNickname(document.getElementById('student-name-input').value.trim());
    updateUI();
    refreshSchoolCtaUI();
    playSuccess();
    showToast('¡Listo! Ya puedes empezar la aventura.', 'success');
    renderMascot('mascot-school-container', 'friendly');
    document.getElementById('school-mascot-bubble').textContent =
      '¡Perfecto! Cuando termines los retos, te preparo una medalla con tu nombre.';

    const payload = exportLeadPayload();
    syncSchoolLead(payload).then((r) => {
      if (r.ok) localStorage.removeItem('logika_school_lead_pending_sync');
    });
  });

  document.getElementById('btn-edit-school-profile')?.addEventListener('click', () => {
    playClick();
    schoolCtaForm?.classList.remove('hidden');
    schoolCtaSaved?.classList.add('hidden');
  });

  // 6. Colegio invitado: lección → reto
  const btnStartSchoolQuiz = document.getElementById('btn-start-school-quiz');
  const quizArea = document.getElementById('school-quiz-area');
  const quizProgress = document.getElementById('school-quiz-progress');
  const lessonPanel = document.getElementById('school-lesson-panel');
  const challengePanel = document.getElementById('school-challenge-panel');
  const lessonStep = document.getElementById('school-lesson-step');
  const lessonTitle = document.getElementById('school-lesson-title');
  const lessonBody = document.getElementById('school-lesson-body');
  const btnSchoolToChallenge = document.getElementById('btn-school-to-challenge');
  const quizStep = document.getElementById('school-quiz-step');
  const quizTitle = document.getElementById('school-quiz-title');
  const quizBody = document.getElementById('school-quiz-body');
  const btnQuizExplanation = document.getElementById('btn-quiz-explanation');
  const btnSchoolQuizNext = document.getElementById('btn-school-quiz-next');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizExplanationPanel = document.getElementById('quiz-explanation-panel');
  const quizExplanationContent = document.getElementById('quiz-explanation-content');
  const schoolMascotBubble = document.getElementById('school-mascot-bubble');

  let selectedOptionIndex = null;
  let hasCheckedAnswer = false;

  function setSchoolMascot(text, expression = 'friendly') {
    if (schoolMascotBubble) {
      schoolMascotBubble.innerHTML = text;
      refreshIcons(schoolMascotBubble);
    }
    renderMascot('mascot-school-container', expression);
  }

  btnStartSchoolQuiz?.addEventListener('click', () => {
    if (!hasSchoolProfile()) {
      showToast('Primero completa el formulario de colegio (arriba).', 'warning');
      document.getElementById('school-cta-card')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    playClick();
    const saved = getSchoolQuizProgress();
    schoolQuizStepIndex = saved?.completed ? 0 : (saved?.stepIndex ?? 0);
    schoolSubPhase = 'lesson';
    quizArea.classList.remove('hidden');
    loadSchoolQuizStep();

    setTimeout(() => {
      quizArea.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });

  btnSchoolToChallenge?.addEventListener('click', () => {
    playClick();
    schoolSubPhase = 'challenge';
    loadSchoolChallenge();
  });

  function loadSchoolQuizStep() {
    schoolSubPhase = 'lesson';
    const stepData = SCHOOL_ADVENTURE[schoolQuizStepIndex];
    const total = SCHOOL_ADVENTURE.length;
    const pct = ((schoolQuizStepIndex + 1) / total) * 100;
    quizProgress.style.width = `${pct}%`;

    lessonPanel?.classList.remove('hidden');
    challengePanel?.classList.add('hidden');

    lessonStep.textContent = `Etapa ${schoolQuizStepIndex + 1} de ${total}`;
    lessonTitle.textContent = stepData.lessonTitle;
    lessonBody.innerHTML = stepData.lessonBody;

    const profile = getSchoolProfile();
    const name = profile?.studentName ? `${profile.studentName}, ` : '';
    setSchoolMascot(`${name}${stepData.mascotLesson}`, 'friendly');

    saveSchoolQuizProgress(schoolQuizStepIndex, false);
    refreshIcons(lessonPanel);
  }

  function loadSchoolChallenge() {
    const stepData = SCHOOL_ADVENTURE[schoolQuizStepIndex];
    selectedOptionIndex = null;
    hasCheckedAnswer = false;

    lessonPanel?.classList.add('hidden');
    challengePanel?.classList.remove('hidden');

    btnSchoolQuizNext.textContent = 'Verificar respuesta';
    btnQuizExplanation.classList.add('hidden');
    quizFeedback.classList.add('hidden');
    quizExplanationPanel.classList.add('hidden');
    quizExplanationContent.innerHTML = '';

    const total = SCHOOL_ADVENTURE.length;
    quizStep.textContent = `Reto ${schoolQuizStepIndex + 1} de ${total}`;
    quizTitle.textContent = stepData.challengeTitle;

    let optionsHTML = '';
    stepData.options.forEach((opt, idx) => {
      optionsHTML += `
        <button class="option-btn" data-index="${idx}">
          <span>${opt.text}</span>
          <span class="indicator-icon">${icon('circle')}</span>
        </button>
      `;
    });

    quizBody.innerHTML = `
      <p>${stepData.question}</p>
      <div class="quiz-options-list">${optionsHTML}</div>
    `;

    const optButtons = quizBody.querySelectorAll('.option-btn');
    optButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (hasCheckedAnswer) return;
        playClick();
        optButtons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedOptionIndex = parseInt(btn.getAttribute('data-index'), 10);
      });
    });

    setSchoolMascot(stepData.mascotChallenge, 'thoughtful');
    refreshIcons(quizBody);
  }

  btnSchoolQuizNext.addEventListener('click', () => {
    if (selectedOptionIndex === null) {
      showToast('Por favor selecciona una de las opciones.', 'warning');
      return;
    }

    const stepData = SCHOOL_ADVENTURE[schoolQuizStepIndex];

    if (!hasCheckedAnswer) {
      hasCheckedAnswer = true;
      const optButtons = quizBody.querySelectorAll('.option-btn');
      const isCorrect = stepData.options[selectedOptionIndex].value === 'correct';

      optButtons.forEach((btn, idx) => {
        btn.classList.remove('selected');
        const optVal = stepData.options[idx].value;
        if (optVal === 'correct') {
          btn.classList.add('correct');
          btn.querySelector('.indicator-icon').innerHTML = icon('circle-check');
          refreshIcons(btn);
        } else if (idx === selectedOptionIndex) {
          btn.classList.add('wrong');
          btn.querySelector('.indicator-icon').innerHTML = icon('circle-x');
          refreshIcons(btn);
        }
      });

      if (isCorrect) {
        playSuccess();
        quizFeedback.innerHTML = `${icon('circle-check')} ¡Bien hecho!`;
        refreshIcons(quizFeedback);
        quizFeedback.className = 'quiz-feedback-text text-green';
        quizFeedback.classList.remove('hidden');
        setSchoolMascot(`${icon('star')} ¡Genial! Siguiente lección o terminas la aventura.`, 'happy');
      } else {
        playError();
        quizFeedback.textContent = 'Casi — mira la explicación y prueba otra vez.';
        quizFeedback.className = 'quiz-feedback-text text-danger';
        quizFeedback.classList.remove('hidden');
        setSchoolMascot(`${icon('lightbulb')} No pasa nada, equivocarse es parte del juego. Lee la explicación abajo.`, 'sad');
      }

      quizExplanationContent.innerHTML = stepData.explanation;
      quizExplanationPanel.classList.remove('hidden');
      btnQuizExplanation.classList.remove('hidden');
      btnSchoolQuizNext.textContent =
        schoolQuizStepIndex < SCHOOL_ADVENTURE.length - 1 ? 'Siguiente etapa' : 'Completar aventura';
    } else {
      if (schoolQuizStepIndex < SCHOOL_ADVENTURE.length - 1) {
        schoolQuizStepIndex++;
        saveSchoolQuizProgress(schoolQuizStepIndex, false);
        loadSchoolQuizStep();
      } else {
        quizArea.classList.add('hidden');
        saveSchoolQuizProgress(schoolQuizStepIndex, true);
        addXP(100, `school_adventure_complete_${Date.now()}`);
        playSuccess();
        setSchoolMascot(`${icon('award')} ¡Lo lograste! Tu medalla te espera: descárgala y compártela.`, 'happy');

        tryAwardSpecialCertificate(
          'school_route',
          SCHOOL_ROUTE_CERTIFICATE.title,
          SCHOOL_ROUTE_CERTIFICATE.subtitle
        );
        refreshDashboardUI();
      }
    }
  });

  // Display explanation modal / bubble when clicked
  btnQuizExplanation.addEventListener('click', () => {
    playClick();
    quizExplanationPanel.classList.remove('hidden');
    quizExplanationPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Trigger initial mascot render on first view load
  renderMascot('mascot-landing-placeholder', 'normal');
});
