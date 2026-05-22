// Relations and Functions Module with interactive Matrix editor and property checkers (KISS)
import { playSuccess, playError } from '../components/gamification.js';
import { saveModuleProgress, getModuleProgress } from '../components/progress.js';
import { afterModuleActivity } from '../components/certificates.js';
import { setGlobalMascotExpression } from '../components/mascot.js';
import { icon, refreshIcons } from '../components/icons.js';
import { registerPracticeReset } from '../components/module-learn.js';

export function initRelationsModule() {
  const setInput = document.getElementById('relation-set-input');
  const pairsInput = document.getElementById('relation-pairs-input');
  const matrixGrid = document.getElementById('relations-matrix-grid');
  const btnCalculate = document.getElementById('btn-calculate-relations');
  
  const propReflexive = document.getElementById('prop-reflexive');
  const propSymmetric = document.getElementById('prop-symmetric');
  const propTransitive = document.getElementById('prop-transitive');
  const propAntisymmetric = document.getElementById('prop-antisymmetric');
  const equivalenceBadge = document.getElementById('equivalence-relation-badge');

  let elements = [];
  let currentPairs = [];

  // Parse A and set up initial grid
  setInput.addEventListener('input', () => {
    updateElementsAndBuildMatrix();
  });

  btnCalculate.addEventListener('click', () => {
    parseTextPairsAndCalculate();
  });

  // Init
  updateElementsAndBuildMatrix();
  parseTextPairsAndCalculate();

  function getElementsArray(inputStr) {
    if (!inputStr.trim()) return [];
    return inputStr.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  function updateElementsAndBuildMatrix() {
    elements = getElementsArray(setInput.value);
    
    // Clear and build matrix grid
    if (elements.length === 0) {
      matrixGrid.innerHTML = '<p class="text-muted">Ingresa elementos en el conjunto A.</p>';
      return;
    }

    // Set grid columns template dynamically: +1 for header columns
    matrixGrid.style.gridTemplateColumns = `auto repeat(${elements.length}, 40px)`;
    
    let gridHTML = '<div></div>'; // Top-left empty spacer
    
    // Header row
    elements.forEach(el => {
      gridHTML += `<div class="matrix-label">${el}</div>`;
    });

    // Content rows
    elements.forEach((rowEl, rIdx) => {
      gridHTML += `<div class="matrix-label">${rowEl}</div>`; // Row header
      
      elements.forEach((colEl, cIdx) => {
        const pairStr = `(${rowEl},${colEl})`;
        // Check if this pair is already in current text input
        const isChecked = hasPair(rowEl, colEl);
        
        gridHTML += `
          <div class="matrix-cell-checkbox ${isChecked ? 'checked' : ''}" 
               data-row="${rowEl}" 
               data-col="${colEl}" 
               title="Par (${rowEl}, ${colEl})">
          </div>`;
      });
    });

    matrixGrid.innerHTML = gridHTML;

    // Attach click events to grid cells
    const cells = matrixGrid.querySelectorAll('.matrix-cell-checkbox');
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const r = cell.getAttribute('data-row');
        const c = cell.getAttribute('data-col');
        
        const isNowChecked = !cell.classList.contains('checked');
        if (isNowChecked) {
          cell.classList.add('checked');
          addPairToText(r, c);
        } else {
          cell.classList.remove('checked');
          removePairFromText(r, c);
        }
        
        calculateProperties();
      });
    });
  }

  // Parse pairs from the text input field
  function parseTextPairsAndCalculate() {
    const rawPairs = pairsInput.value;
    
    // Parse regex format: (x, y) or (x,y)
    const regex = /\(\s*([^,\s)]+)\s*,\s*([^,\s)]+)\s*\)/g;
    let match;
    const parsedPairs = [];
    
    while ((match = regex.exec(rawPairs)) !== null) {
      const u = match[1].trim();
      const v = match[2].trim();
      
      // Ensure they exist in elements A to avoid out-of-bounds relations
      if (elements.includes(u) && elements.includes(v)) {
        parsedPairs.push({ u, v });
      }
    }

    currentPairs = parsedPairs;
    
    // Sync checkbox grid visually
    const cells = matrixGrid.querySelectorAll('.matrix-cell-checkbox');
    cells.forEach(cell => {
      const r = cell.getAttribute('data-row');
      const c = cell.getAttribute('data-col');
      if (hasPair(r, c)) {
        cell.classList.add('checked');
      } else {
        cell.classList.remove('checked');
      }
    });

    calculateProperties();
  }

  // Properties logic checkers
  function calculateProperties() {
    if (elements.length === 0) return;

    // 1. Reflexive check
    let isReflexive = true;
    for (const x of elements) {
      if (!hasPair(x, x)) {
        isReflexive = false;
        break;
      }
    }

    // 2. Symmetric check
    let isSymmetric = true;
    for (const pair of currentPairs) {
      if (!hasPair(pair.v, pair.u)) {
        isSymmetric = false;
        break;
      }
    }

    // 3. Transitive check
    let isTransitive = true;
    for (const p1 of currentPairs) {
      for (const p2 of currentPairs) {
        if (p1.v === p2.u) {
          // If (x,y) and (y,z) exist, we must have (x,z)
          if (!hasPair(p1.u, p2.v)) {
            isTransitive = false;
            break;
          }
        }
      }
      if (!isTransitive) break;
    }

    // 4. Antisymmetric check
    let isAntisymmetric = true;
    for (const p of currentPairs) {
      if (hasPair(p.v, p.u) && p.u !== p.v) {
        // If (x,y) and (y,x) exist, x must equal y
        isAntisymmetric = false;
        break;
      }
    }

    // Update UI items
    updatePropertyUI(propReflexive, isReflexive);
    updatePropertyUI(propSymmetric, isSymmetric);
    updatePropertyUI(propTransitive, isTransitive);
    updatePropertyUI(propAntisymmetric, isAntisymmetric);

    // Equivalence Relation check (Reflexive + Symmetric + Transitive)
    if (isReflexive && isSymmetric && isTransitive) {
      equivalenceBadge.innerHTML = `${icon('crown', 'text-yellow')} ¡Es una Relación de Equivalencia! (Reflexiva, Simétrica y Transitiva)`;
      refreshIcons(equivalenceBadge);
      equivalenceBadge.classList.remove('hidden');
      setGlobalMascotExpression('happy');
    } else {
      equivalenceBadge.classList.add('hidden');
      setGlobalMascotExpression('thoughtful');
    }

    saveModuleProgress('relations', {
      checksRun: (getModuleProgress('relations').checksRun || 0) + 1,
      isEquivalence: isReflexive && isSymmetric && isTransitive
    });
    afterModuleActivity('relations');
  }

  function updatePropertyUI(element, isTrue) {
    const statusWrap = element.querySelector('.status-icon');
    if (isTrue) {
      element.className = 'property-item true';
      statusWrap.innerHTML = icon('circle-check', 'text-green');
    } else {
      element.className = 'property-item false';
      statusWrap.innerHTML = icon('circle-x', 'text-danger');
    }
    refreshIcons(statusWrap);
  }

  // Helpers for text manipulation
  function hasPair(u, v) {
    return currentPairs.some(p => p.u === u && p.v === v);
  }

  function addPairToText(u, v) {
    if (hasPair(u, v)) return;
    currentPairs.push({ u, v });
    writePairsToInput();
  }

  function removePairFromText(u, v) {
    currentPairs = currentPairs.filter(p => !(p.u === u && p.v === v));
    writePairsToInput();
  }

  function writePairsToInput() {
    const pairsStr = currentPairs.map(p => `(${p.u},${p.v})`).join(', ');
    pairsInput.value = pairsStr;
  }

  registerPracticeReset('relations', () => {
    setInput.value = '1, 2, 3, 4';
    pairsInput.value = '(1,1), (1,2), (2,2), (3,4)';
    updateElementsAndBuildMatrix();
    parseTextPairsAndCalculate();
    setGlobalMascotExpression('normal');
  });
}
