// Set Theory Module with Pixel-Shader Shading Venn Diagrams (KISS & High-Performance Canvas)
import { addXP, playSuccess, playError } from '../components/gamification.js';
import { setGlobalMascotExpression } from '../components/mascot.js';
import { showToast, isLightMode } from '../components/ui.js';
import { saveModuleProgress, promptLoginIfNeeded, getModuleProgress } from '../components/progress.js';
import { afterModuleActivity } from '../components/certificates.js';
import { registerPracticeReset } from '../components/module-learn.js';

export function initSetsModule() {
  const setAInput = document.getElementById('set-a-input');
  const setBInput = document.getElementById('set-b-input');
  const setCInput = document.getElementById('set-c-input');
  const checkEnableC = document.getElementById('checkbox-enable-c');
  const btnCalculate = document.getElementById('btn-calculate-sets');
  const canvas = document.getElementById('venn-canvas');
  const ctx = canvas.getContext('2d');
  
  const resultText = document.getElementById('set-result-elements');
  const resultCard = document.getElementById('set-result-cardinality');
  
  const vennGameTarget = document.getElementById('venn-game-target');
  const btnVennReset = document.getElementById('btn-venn-reset');
  const btnVennVerify = document.getElementById('btn-venn-verify');
  const btnGoPractice = document.getElementById('btn-sets-go-practice');
  const btnBackLearn = document.getElementById('btn-sets-back-learn');
  const practiceCard = document.getElementById('sets-practice-card');
  const learnResults = document.getElementById('sets-learn-results');
  const pillLearn = document.getElementById('sets-pill-learn');
  const pillPractice = document.getElementById('sets-pill-practice');
  const panelTitle = document.getElementById('sets-panel-title');
  const panelHint = document.getElementById('sets-panel-hint');

  const opButtons = document.querySelectorAll('.set-operations-buttons button');

  // Centers and dimensions of circles
  const circleA = { x: 175, y: 155, r: 82 };
  const circleB = { x: 275, y: 155, r: 82 };
  const circleC = { x: 225, y: 235, r: 82 };

  let enableC = false;
  let activeOperation = 'union';
  let phase = getModuleProgress('sets').phase === 'practice' ? 'practice' : 'learn';
  let hasCalculatedOnce = (getModuleProgress('sets').learnCount || 0) > 0;

  // Game states
  let gameTargetOp = 'intersection';
  let lastVennGameMode = false;
  let userSelectedRegions = {
    // True/False representing colored state of partitions
    'A_only': false,
    'B_only': false,
    'C_only': false,
    'AB_shared': false,
    'AC_shared': false,
    'BC_shared': false,
    'ABC_shared': false,
    'outside': false
  };

  // Toggle C Input
  checkEnableC.addEventListener('change', (e) => {
    enableC = e.target.checked;
    if (enableC) {
      setCInput.classList.remove('hidden');
      setCInput.disabled = false;
    } else {
      setCInput.classList.add('hidden');
      setCInput.disabled = true;
    }
    if (phase === 'learn') calculateAndDraw();
    else {
      newGameChallenge();
      drawVennDiagram(null, true);
    }
    setPhase(phase);
  });

  opButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      opButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeOperation = btn.getAttribute('data-op');
      if (phase === 'learn') calculateAndDraw();
    });
  });

  btnCalculate.addEventListener('click', () => {
    calculateAndDraw();
    hasCalculatedOnce = true;
    btnGoPractice?.classList.remove('hidden');
    saveModuleProgress('sets', {
      learnCount: (getModuleProgress('sets').learnCount || 0) + 1,
      phase: 'learn',
      lastOperation: activeOperation
    });
  });

  btnGoPractice?.addEventListener('click', () => {
    setPhase('practice');
    newGameChallenge();
    drawVennDiagram(null, true);
    saveModuleProgress('sets', { phase: 'practice' });
  });

  btnBackLearn?.addEventListener('click', () => {
    setPhase('learn');
    calculateAndDraw();
    saveModuleProgress('sets', { phase: 'learn' });
  });

  function setPhase(next) {
    phase = next;
    const isLearn = phase === 'learn';
    pillLearn?.classList.toggle('active', isLearn);
    pillPractice?.classList.toggle('active', !isLearn);
    practiceCard?.classList.toggle('hidden', isLearn);
    learnResults?.classList.toggle('hidden', !isLearn);
    if (panelTitle) {
      panelTitle.textContent = isLearn
        ? 'Aprende con el diagrama de Venn'
        : 'Pon a prueba: colorea la operación';
    }
    if (panelHint) {
      panelHint.textContent = isLearn
        ? 'Define A y B, elige una operación y pulsa calcular. Observa qué elementos forman el resultado.'
        : 'Haz clic en las regiones del diagrama. Cuando creas que está bien, verifica.';
    }
    if (isLearn && hasCalculatedOnce) btnGoPractice?.classList.remove('hidden');
    else if (!isLearn) btnGoPractice?.classList.add('hidden');
  }

  // Venn Game actions
  btnVennReset.addEventListener('click', () => {
    resetUserSelections();
    drawVennDiagram(null, true);
  });

  btnVennVerify.addEventListener('click', () => {
    verifyVennGame();
  });

  // Register canvas click to color partitions
  canvas.addEventListener('click', (e) => {
    if (phase !== 'practice') return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const region = getRegionAtCoords(clickX, clickY);
    if (region && region !== 'outside') {
      userSelectedRegions[region] = !userSelectedRegions[region];
      drawVennDiagram(null, true);
    }
  });

  resetUserSelections();
  setPhase(phase);
  if (phase === 'learn') calculateAndDraw();
  else {
    newGameChallenge();
    drawVennDiagram(null, true);
  }

  function getElementsArray(inputStr) {
    if (!inputStr.trim()) return [];
    return inputStr.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  function calculateAndDraw() {
    const listA = getElementsArray(setAInput.value);
    const listB = getElementsArray(setBInput.value);
    const listC = enableC ? getElementsArray(setCInput.value) : [];

    const setA = new Set(listA);
    const setB = new Set(listB);
    const setC = new Set(listC);

    let resultSet = new Set();

    // Perform math set operations
    if (activeOperation === 'union') {
      resultSet = new Set([...setA, ...setB]);
      if (enableC) resultSet = new Set([...resultSet, ...setC]);
    } else if (activeOperation === 'intersection') {
      resultSet = new Set([...setA].filter(x => setB.has(x)));
      if (enableC) resultSet = new Set([...resultSet].filter(x => setC.has(x)));
    } else if (activeOperation === 'difference_ab') {
      resultSet = new Set([...setA].filter(x => !setB.has(x)));
      if (enableC) resultSet = new Set([...resultSet].filter(x => !setC.has(x)));
    } else if (activeOperation === 'difference_ba') {
      resultSet = new Set([...setB].filter(x => !setA.has(x)));
      if (enableC) resultSet = new Set([...resultSet].filter(x => !setC.has(x)));
    } else if (activeOperation === 'sym_difference') {
      // (A - B) U (B - A)
      const diff1 = new Set([...setA].filter(x => !setB.has(x)));
      const diff2 = new Set([...setB].filter(x => !setA.has(x)));
      resultSet = new Set([...diff1, ...diff2]);
      if (enableC) {
        // (A Δ B) Δ C
        const diffC1 = new Set([...resultSet].filter(x => !setC.has(x)));
        const diffC2 = new Set([...setC].filter(x => !resultSet.has(x)));
        resultSet = new Set([...diffC1, ...diffC2]);
      }
    }

    const resultArr = Array.from(resultSet).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));
    
    // Update Text results
    resultText.textContent = resultArr.length > 0 ? resultArr.join(', ') : 'Ø (Vacío)';
    resultCard.textContent = resultArr.length;

    // Draw
    drawVennDiagram(resultSet, false);
  }

  // Draw Venn Diagram using shader-like shading
  function drawVennDiagram(highlightSet = null, isGameMode = false) {
    lastVennGameMode = isGameMode;
    const width = canvas.width;
    const height = canvas.height;
    const light = isLightMode();
    const bgRgb = light ? [248, 250, 252] : [3, 7, 18];
    const shadeRgb = light ? [79, 70, 229] : [139, 92, 246];
    const shadeAlpha = light ? 110 : 90;

    // 1. Draw Background Shading using Pixel Buffer
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const inA = Math.hypot(x - circleA.x, y - circleA.y) <= circleA.r;
        const inB = Math.hypot(x - circleB.x, y - circleB.y) <= circleB.r;
        const inC = enableC && Math.hypot(x - circleC.x, y - circleC.y) <= circleC.r;

        let isShaded = false;
        
        if (isGameMode) {
          // Shading determined by user selected regions
          const reg = getRegion(inA, inB, inC);
          isShaded = userSelectedRegions[reg];
        } else {
          // Shading determined by active mathematical operation
          if (activeOperation === 'union') {
            isShaded = inA || inB || (enableC && inC);
          } else if (activeOperation === 'intersection') {
            isShaded = enableC ? (inA && inB && inC) : (inA && inB);
          } else if (activeOperation === 'difference_ab') {
            isShaded = enableC ? (inA && !inB && !inC) : (inA && !inB);
          } else if (activeOperation === 'difference_ba') {
            isShaded = enableC ? (inB && !inA && !inC) : (inB && !inA);
          } else if (activeOperation === 'sym_difference') {
            if (enableC) {
              // XOR of 3 sets: A XOR B XOR C
              isShaded = (inA !== inB) !== inC;
            } else {
              isShaded = inA !== inB;
            }
          }
        }

        const idx = (y * width + x) * 4;
        
        if (isShaded) {
          data[idx] = shadeRgb[0];
          data[idx + 1] = shadeRgb[1];
          data[idx + 2] = shadeRgb[2];
          data[idx + 3] = shadeAlpha;
        } else {
          data[idx] = bgRgb[0];
          data[idx + 1] = bgRgb[1];
          data[idx + 2] = bgRgb[2];
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // 2. Draw Circle Borders and Labels
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = light ? '#6d28d9' : '#c084fc';
    ctx.beginPath();
    ctx.arc(circleA.x, circleA.y, circleA.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = light ? '#6d28d9' : '#c084fc';
    ctx.font = '800 16px Sora';
    ctx.fillText('A', circleA.x - circleA.r + 10, circleA.y - circleA.r + 20);

    ctx.strokeStyle = light ? '#0e7490' : '#22d3ee';
    ctx.beginPath();
    ctx.arc(circleB.x, circleB.y, circleB.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = light ? '#0e7490' : '#22d3ee';
    ctx.fillText('B', circleB.x + circleB.r - 20, circleB.y - circleB.r + 20);

    // Circle C
    if (enableC) {
      ctx.strokeStyle = light ? '#047857' : '#34d399';
      ctx.beginPath();
      ctx.arc(circleC.x, circleC.y, circleC.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = light ? '#047857' : '#34d399';
      ctx.fillText('C', circleC.x - 10, circleC.y + circleC.r - 10);
    }

    // 3. Draw Elements (Values) if not in Game Mode
    if (!isGameMode) {
      drawSetElements();
    }
  }

  // Draw discrete elements in their corresponding mathematical regions
  function drawSetElements() {
    const listA = getElementsArray(setAInput.value);
    const listB = getElementsArray(setBInput.value);
    const listC = enableC ? getElementsArray(setCInput.value) : [];

    const setA = new Set(listA);
    const setB = new Set(listB);
    const setC = new Set(listC);

    const allElements = Array.from(new Set([...listA, ...listB, ...listC]));

    // Determine region for each element
    const regionBins = {
      'A_only': [], 'B_only': [], 'C_only': [],
      'AB_shared': [], 'AC_shared': [], 'BC_shared': [],
      'ABC_shared': []
    };

    allElements.forEach(el => {
      const inA = setA.has(el);
      const inB = setB.has(el);
      const inC = enableC && setC.has(el);
      const reg = getRegion(inA, inB, inC);
      if (regionBins[reg]) regionBins[reg].push(el);
    });

    // Positions mapping for centers of partitions
    const positions = {
      'A_only': { x: 120, y: 155 },
      'B_only': { x: 330, y: 155 },
      'C_only': { x: 225, y: 285 },
      'AB_shared': { x: 225, y: 135 },
      'AC_shared': { x: 175, y: 225 },
      'BC_shared': { x: 275, y: 225 },
      'ABC_shared': { x: 225, y: 185 }
    };

    // Stagger elements around center coordinate
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '700 13px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    Object.keys(regionBins).forEach(region => {
      const elList = regionBins[region];
      const center = positions[region];
      if (!center || elList.length === 0) return;

      elList.forEach((el, index) => {
        // Compute circular offset
        const angle = (index * Math.PI * 2) / elList.length;
        const radius = elList.length > 1 ? 18 : 0;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        ctx.fillText(el, center.x + offsetX, center.y + offsetY);
      });
    });
  }

  // Get partition region identifier based on intersections
  function getRegion(inA, inB, inC) {
    if (enableC) {
      if (inA && inB && inC) return 'ABC_shared';
      if (inA && inB && !inC) return 'AB_shared';
      if (inA && !inB && inC) return 'AC_shared';
      if (!inA && inB && inC) return 'BC_shared';
      if (inA && !inB && !inC) return 'A_only';
      if (!inA && inB && !inC) return 'B_only';
      if (!inA && !inB && inC) return 'C_only';
    } else {
      if (inA && inB) return 'AB_shared';
      if (inA && !inB) return 'A_only';
      if (!inA && inB) return 'B_only';
    }
    return 'outside';
  }

  // Determine region name from raw coordinates
  function getRegionAtCoords(x, y) {
    const inA = Math.hypot(x - circleA.x, y - circleA.y) <= circleA.r;
    const inB = Math.hypot(x - circleB.x, y - circleB.y) <= circleB.r;
    const inC = enableC && Math.hypot(x - circleC.x, y - circleC.y) <= circleC.r;
    return getRegion(inA, inB, inC);
  }

  function resetUserSelections() {
    Object.keys(userSelectedRegions).forEach(k => {
      userSelectedRegions[k] = false;
    });
  }

  // Generate new game challenge
  function newGameChallenge() {
    const challenges = enableC 
      ? ['union', 'intersection', 'sym_difference'] 
      : ['union', 'intersection', 'difference_ab', 'difference_ba', 'sym_difference'];
    
    gameTargetOp = challenges[Math.floor(Math.random() * challenges.length)];
    
    let opText = '';
    if (gameTargetOp === 'union') opText = enableC ? 'A ∪ B ∪ C' : 'A ∪ B';
    else if (gameTargetOp === 'intersection') opText = enableC ? 'A ∩ B ∩ C' : 'A ∩ B';
    else if (gameTargetOp === 'difference_ab') opText = 'A - B';
    else if (gameTargetOp === 'difference_ba') opText = 'B - A';
    else if (gameTargetOp === 'sym_difference') opText = enableC ? 'A Δ B Δ C' : 'A Δ B';

    vennGameTarget.textContent = opText;
    resetUserSelections();
  }

  // Check if user colored the correct regions
  function verifyVennGame() {
    // Generate the correct region pattern mathematically
    const correctRegions = {};
    
    // We check a point in each region center to see if it belongs to the operation
    const centers = {
      'A_only': { x: 120, y: 155 },
      'B_only': { x: 330, y: 155 },
      'C_only': { x: 225, y: 285 },
      'AB_shared': { x: 225, y: 135 },
      'AC_shared': { x: 175, y: 225 },
      'BC_shared': { x: 275, y: 225 },
      'ABC_shared': { x: 225, y: 185 },
      'outside': { x: 20, y: 20 }
    };

    Object.keys(centers).forEach(regionKey => {
      const pt = centers[regionKey];
      const inA = Math.hypot(pt.x - circleA.x, pt.y - circleA.y) <= circleA.r;
      const inB = Math.hypot(pt.x - circleB.x, pt.y - circleB.y) <= circleB.r;
      const inC = enableC && Math.hypot(pt.x - circleC.x, pt.y - circleC.y) <= circleC.r;

      let isCorrectShaded = false;
      if (gameTargetOp === 'union') {
        isCorrectShaded = inA || inB || (enableC && inC);
      } else if (gameTargetOp === 'intersection') {
        isCorrectShaded = enableC ? (inA && inB && inC) : (inA && inB);
      } else if (gameTargetOp === 'difference_ab') {
        isCorrectShaded = enableC ? (inA && !inB && !inC) : (inA && !inB);
      } else if (gameTargetOp === 'difference_ba') {
        isCorrectShaded = enableC ? (inB && !inA && !inC) : (inB && !inA);
      } else if (gameTargetOp === 'sym_difference') {
        isCorrectShaded = enableC ? ((inA !== inB) !== inC) : (inA !== inB);
      }

      correctRegions[regionKey] = isCorrectShaded;
    });

    // Compare
    let win = true;
    const checkKeys = enableC 
      ? ['A_only', 'B_only', 'C_only', 'AB_shared', 'AC_shared', 'BC_shared', 'ABC_shared']
      : ['A_only', 'B_only', 'AB_shared'];
      
    checkKeys.forEach(k => {
      if (userSelectedRegions[k] !== correctRegions[k]) {
        win = false;
      }
    });

    if (win) {
      setGlobalMascotExpression('happy');
      addXP(50, `sets_game_${gameTargetOp}_${Date.now()}`);
      playSuccess();
      showToast('¡Excelente! Coloreaste exactamente la región correcta.', 'success');
      saveModuleProgress('sets', {
        phase: 'practice',
        practiceWins: (getModuleProgress('sets').practiceWins || 0) + 1
      });
      promptLoginIfNeeded();
      afterModuleActivity('sets');
      newGameChallenge();
      drawVennDiagram(null, true);
    } else {
      setGlobalMascotExpression('sad');
      playError();
      showToast('Región incorrecta. Revisa la definición de la operación e inténtalo de nuevo.', 'error');
    }
  }

  document.addEventListener('logika-theme-change', () => {
    drawVennDiagram(null, lastVennGameMode);
  });

  registerPracticeReset('sets', () => {
    if (phase === 'practice' || lastVennGameMode) {
      newGameChallenge();
      drawVennDiagram(null, true);
    }
  });
}
