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
import { buildProgressPayload, offerModuleResume, promptLoginIfNeeded } from './components/progress.js';
import { tryAwardSpecialCertificate } from './components/certificates.js';
import { refreshDashboardUI } from './components/dashboard-ui.js';
import { refreshLearningRouteView, refreshRouteSummary } from './components/learning-route-ui.js';
import { refreshProfileView } from './components/profile-ui.js';
import { initAllModulePhases, initModulePhases } from './components/module-learn.js';
import { SCHOOL_ROUTE_CERTIFICATE } from './config/learning-path.js';

// School Guest Mode Quiz State
let schoolQuizStepIndex = 0;
const schoolQuizData = [
  {
    title: "Reto 1 de 3 · Lógica de Programación",
    question: "Un robot de almacén está programado con la siguiente regla lógica:<br><br><strong>El robot avanza SI Y SOLO SI no detecta obstáculo Y tiene batería cargada.</strong><br><br>Si el sensor indica que Obstáculo = FALSO (no hay) y Batería = VERDADERO (está cargada). ¿Cuál es la decisión correcta del robot?",
    options: [
      { text: "Avanzar (El condicional lógico es verdadero)", value: "correct" },
      { text: "Quedarse quieto (El condicional lógico es falso)", value: "wrong" },
      { text: "Entrar en cortocircuito", value: "wrong" }
    ],
    explanation: "<strong>¡Correcto!</strong> En lógica proposicional, si representamos Obstáculo como <i>o</i> y Batería como <i>b</i>, la condición es: <code>~o ^ b</code>. Como <code>~F ^ V</code> equivale a <code>V ^ V = V</code>, la salida es verdadera y el robot avanza. ¡Así es como el software toma decisiones mediante compuertas lógicas!"
  },
  {
    title: "Reto 2 de 3 · Ciberseguridad y Conjuntos",
    question: "Un especialista en ciberseguridad de la Unisimón quiere filtrar servidores vulnerables. Necesita encontrar los servidores que: <strong>Son computadores Linux (Conjunto A) Y tienen malware detectado (Conjunto B), pero EXCLUYENDO a los que tienen Cortafuegos activo (Conjunto C).</strong><br><br>¿Cuál operación representa este filtro?",
    options: [
      { text: "(A ∪ B) ∩ C (Unión de Linux y malware, intersecado con cortafuegos)", value: "wrong" },
      { text: "(A ∩ B) - C (Intersección de Linux y malware, restando cortafuegos)", value: "correct" },
      { text: "A - B - C (Linux menos malware menos cortafuegos)", value: "wrong" }
    ],
    explanation: "<strong>¡Correcto!</strong> La intersección <code>A ∩ B</code> selecciona elementos que cumplen AMBAS condiciones (Linux y Malware), y la diferencia <code>- C</code> remueve a los que tienen Cortafuegos activo. ¡Las bases de datos SQL y firewalls usan álgebra de conjuntos para filtrar datos y proteger redes!"
  },
  {
    title: "Reto 3 de 3 · Rutas de Videojuegos y Grafos",
    question: "Queremos transmitir datos en un juego multijugador online desde Cúcuta a un servidor en Bogotá. Hay dos caminos posibles en la red:<br><br>1. <strong>Línea directa (A → D):</strong> con un PING (latencia/peso) de <strong>8 ms</strong>.<br>2. <strong>Ruta alternativa (A → B → D):</strong> pasando por un nodo en Bucaramanga. El ping A-B es de <strong>2 ms</strong> y el ping B-D es de <strong>3 ms</strong>.<br><br>¿Qué ruta elegirá un algoritmo de enrutamiento de Sistemas?",
    options: [
      { text: "La ruta alternativa A → B → D (Ping total de 5 ms)", value: "correct" },
      { text: "La línea directa A → D (Ping total de 8 ms)", value: "wrong" }
    ],
    explanation: "<strong>¡Correcto!</strong> En teoría de grafos, los algoritmos de camino mínimo (como Dijkstra) no miran el número de conexiones físicas, sino la suma de los pesos (latencia). La suma de la ruta indirecta es 2 + 3 = 5 ms, que es mejor que 8 ms. ¡Así es como Google Maps calcula el camino más rápido para evitar trancones!"
  }
];

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
      renderMascot('mascot-school-container', 'thoughtful');
    } else if (targetViewId === 'dashboard-view') {
      setGlobalMascotExpression('happy', { speak: false });
      refreshDashboardUI();
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
      if (!hasPlayerNickname()) {
        openNicknameModal(mod);
        return;
      }
      offerModuleResume(mod, moduleLabels[mod] || {}, () => openModule(mod), () => openModule(mod));
    });
  });

  // User Profile actions
  document.getElementById('btn-logout').addEventListener('click', () => {
    playClick();
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
    renderMascot('mascot-school-container', 'happy');
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

  // 6. Colegio Invitado: Gamified Quiz Loop
  const btnStartSchoolQuiz = document.getElementById('btn-start-school-quiz');
  const quizArea = document.getElementById('school-quiz-area');
  const quizProgress = document.getElementById('school-quiz-progress');
  const quizStep = document.getElementById('school-quiz-step');
  const quizTitle = document.getElementById('school-quiz-title');
  const quizBody = document.getElementById('school-quiz-body');
  const btnQuizExplanation = document.getElementById('btn-quiz-explanation');
  const btnSchoolQuizNext = document.getElementById('btn-school-quiz-next');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizExplanationPanel = document.getElementById('quiz-explanation-panel');
  const quizExplanationContent = document.getElementById('quiz-explanation-content');
  
  let selectedOptionIndex = null;
  let hasCheckedAnswer = false;

  btnStartSchoolQuiz?.addEventListener('click', () => {
    if (!hasSchoolProfile()) {
      showToast('Primero completa el formulario de colegio (arriba).', 'warning');
      document.getElementById('school-cta-card')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    playClick();
    const saved = getSchoolQuizProgress();
    schoolQuizStepIndex = saved?.completed ? 0 : (saved?.stepIndex ?? 0);
    quizArea.classList.remove('hidden');
    loadSchoolQuizStep();
    
    // Smooth scroll down to quiz
    setTimeout(() => {
      quizArea.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });

  function loadSchoolQuizStep() {
    const stepData = schoolQuizData[schoolQuizStepIndex];
    selectedOptionIndex = null;
    hasCheckedAnswer = false;

    // Reset button states
    btnSchoolQuizNext.textContent = "Verificar Respuesta";
    btnQuizExplanation.classList.add('hidden');
    quizFeedback.classList.add('hidden');
    quizExplanationPanel.classList.add('hidden');
    quizExplanationContent.innerHTML = '';

    // Update steps UI
    const pct = ((schoolQuizStepIndex + 1) / schoolQuizData.length) * 100;
    quizProgress.style.width = `${pct}%`;
    quizStep.textContent = `Reto ${schoolQuizStepIndex + 1} de ${schoolQuizData.length}`;
    quizTitle.textContent = stepData.title;

    // Load question content
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

    // Add option click events
    const optButtons = quizBody.querySelectorAll('.option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (hasCheckedAnswer) return;
        playClick();
        
        optButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        selectedOptionIndex = parseInt(btn.getAttribute('data-index'));
      });
    });

    renderMascot('mascot-school-container', 'thoughtful');
    const profile = getSchoolProfile();
    document.getElementById('school-mascot-bubble').textContent = profile
      ? `${profile.studentName}, analiza bien las opciones. ¡Tú puedes lograrlo!`
      : 'Analiza bien las opciones. ¡Tú puedes lograrlo!';
    saveSchoolQuizProgress(schoolQuizStepIndex, false);
    refreshIcons(quizBody);
  }

  btnSchoolQuizNext.addEventListener('click', () => {
    if (selectedOptionIndex === null) {
      showToast('Por favor selecciona una de las opciones.', 'warning');
      return;
    }

    const stepData = schoolQuizData[schoolQuizStepIndex];

    if (!hasCheckedAnswer) {
      // CHECK ANSWER MODE
      hasCheckedAnswer = true;
      const optButtons = quizBody.querySelectorAll('.option-btn');
      const selectedBtn = optButtons[selectedOptionIndex];
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
        quizFeedback.innerHTML = `${icon('circle-check')} ¡Respuesta correcta!`;
        refreshIcons(quizFeedback);
        quizFeedback.className = "quiz-feedback-text text-green";
        quizFeedback.classList.remove('hidden');
        
        renderMascot('mascot-school-container', 'happy');
        document.getElementById('school-mascot-bubble').innerHTML = "¡Excelente! Veo madera de Ingeniero de Sistemas en ti.";
      } else {
        playError();
        quizFeedback.textContent = "Respuesta incorrecta. Intentemos repasar.";
        quizFeedback.className = "quiz-feedback-text text-danger";
        quizFeedback.classList.remove('hidden');
        
        renderMascot('mascot-school-container', 'sad');
        document.getElementById('school-mascot-bubble').innerHTML = "¡Ups! Está bien equivocarse, así se aprende. Mira la explicación.";
      }

      quizExplanationContent.innerHTML = stepData.explanation;
      quizExplanationPanel.classList.remove('hidden');
      btnQuizExplanation.classList.remove('hidden');
      btnSchoolQuizNext.textContent = schoolQuizStepIndex < schoolQuizData.length - 1 ? "Siguiente Reto" : "Completar Aventura";
      
    } else {
      // NEXT STEP MODE
      if (schoolQuizStepIndex < schoolQuizData.length - 1) {
        schoolQuizStepIndex++;
        saveSchoolQuizProgress(schoolQuizStepIndex, false);
        loadSchoolQuizStep();
      } else {
        quizArea.classList.add('hidden');
        saveSchoolQuizProgress(schoolQuizStepIndex, true);
        addXP(100, `school_adventure_complete_${Date.now()}`);
        playSuccess();
        
        renderMascot('mascot-school-container', 'happy');
        document.getElementById('school-mascot-bubble').textContent =
          '¡Felicidades! Mereces tu medalla. Descárgala y compártela.';

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
