// Propositional Logic Solver & Mini Quiz (KISS & RPN Engine)
import { addXP, playSuccess, playError } from '../components/gamification.js';
import { setGlobalMascotExpression, showMascotSpeech } from '../components/mascot.js';
import { showToast, clearLogicError, showLogicError } from '../components/ui.js';
import { saveModuleProgress, promptLoginIfNeeded, getModuleProgress } from '../components/progress.js';
import { afterModuleActivity } from '../components/certificates.js';

/** Fórmulas de ejemplo (evita "<->" roto en atributos HTML) */
export const LOGIC_EXAMPLES = {
  demorgan1: { label: 'Ley de De Morgan 1', formula: '~(p ^ q) <-> (~p v ~q)' },
  conditional: { label: 'Equivalencia Condicional', formula: 'p -> q <-> ~p v q' },
  distributive: { label: 'Ley Distributiva', formula: 'p ^ (q v r) <-> (p ^ q) v (p ^ r)' }
};

const OPERATORS = {
  '~': { precedence: 4, association: 'right', unary: true },
  '^': { precedence: 3, association: 'left', unary: false },
  v: { precedence: 2, association: 'left', unary: false },
  '->': { precedence: 1, association: 'right', unary: false },
  '<->': { precedence: 0, association: 'left', unary: false }
};

const OP_SCAN = ['<->', '->', '~', '^', 'v', '(', ')'];
const VAR_PATTERN = /^[pqr]$/;

function normalizeFormula(formula) {
  let s = formula.toLowerCase().trim();
  s = s.replace(/\s+/g, ' ');

  s = s.replace(/<=>/g, '<->');
  s = s.replace(/↔/g, '<->');
  s = s.replace(/=>/g, '->');
  s = s.replace(/→/g, '->');
  s = s.replace(/&&/g, ' ^ ');
  s = s.replace(/\|\|/g, ' v ');
  s = s.replace(/\band\b/g, ' ^ ');
  s = s.replace(/\bor\b/g, ' v ');
  s = s.replace(/¬/g, '~');
  s = s.replace(/!/g, '~');
  s = s.replace(/\*/g, '^');
  s = s.replace(/\+/g, ' v ');
  s = s.replace(/\|/g, ' v ');
  s = s.replace(/&/g, '^');

  return s.replace(/\s+/g, ' ').trim();
}

/** Lexer por caracteres — no usa replace(/v/g) global (rompía "<->") */
function tokenize(formula) {
  const normalized = normalizeFormula(formula);
  const s = normalized.replace(/\s+/g, '');
  const tokens = [];
  let i = 0;

  while (i < s.length) {
    if (/[pqr]/.test(s[i])) {
      tokens.push(s[i]);
      i += 1;
      continue;
    }

    let matched = false;
    for (const op of OP_SCAN) {
      if (s.startsWith(op, i)) {
        tokens.push(op);
        i += op.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const ch = s[i];
      if (ch === '<') {
        throw new Error(
          'Token desconocido: "<". Para bicondicional escribe <-> o usa el botón ↔ del teclado.'
        );
      }
      throw new Error(
        `Token desconocido: "${ch}". Usa variables p, q, r y conectores ~, ^, v, ->, <->`
      );
    }
  }

  return tokens;
}

function shuntingYard(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (VAR_PATTERN.test(token)) {
      outputQueue.push(token);
    } else if (token in OPERATORS) {
      const o1 = token;
      let o2 = operatorStack[operatorStack.length - 1];

      while (
        o2 in OPERATORS &&
        ((OPERATORS[o1].association === 'left' && OPERATORS[o1].precedence <= OPERATORS[o2].precedence) ||
          (OPERATORS[o1].association === 'right' && OPERATORS[o1].precedence < OPERATORS[o2].precedence))
      ) {
        outputQueue.push(operatorStack.pop());
        o2 = operatorStack[operatorStack.length - 1];
      }
      operatorStack.push(o1);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      let top = operatorStack[operatorStack.length - 1];
      while (top !== '(') {
        if (operatorStack.length === 0) {
          throw new Error('Paréntesis desbalanceados');
        }
        outputQueue.push(operatorStack.pop());
        top = operatorStack[operatorStack.length - 1];
      }
      operatorStack.pop();
    } else {
      throw new Error(`Token desconocido: "${token}"`);
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top === '(' || top === ')') {
      throw new Error('Paréntesis desbalanceados');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

function evaluatePostfix(postfix, values) {
  const stack = [];

  for (const token of postfix) {
    if (VAR_PATTERN.test(token)) {
      stack.push(values[token]);
    } else if (token in OPERATORS) {
      const op = OPERATORS[token];
      if (op.unary) {
        if (stack.length < 1) throw new Error('Expresión mal formada: falta operando tras la negación');
        const a = stack.pop();
        stack.push(!a);
      } else {
        if (stack.length < 2) throw new Error('Expresión mal formada: faltan operandos en un conector');
        const b = stack.pop();
        const a = stack.pop();

        if (token === '^') stack.push(a && b);
        else if (token === 'v') stack.push(a || b);
        else if (token === '->') stack.push(!a || b);
        else if (token === '<->') stack.push(a === b);
      }
    }
  }

  if (stack.length !== 1) throw new Error('Expresión mal formada: revisa paréntesis y conectores');
  return stack.pop();
}

function getVariables(tokens) {
  const vars = new Set();
  for (const t of tokens) {
    if (VAR_PATTERN.test(t)) vars.add(t);
  }
  return Array.from(vars).sort();
}

function getSyntaxHint(message) {
  const m = message.toLowerCase();
  if (m.includes('paréntesis')) return 'Verifica que cada "(" tenga su ")" correspondiente.';
  if (m.includes('mal formada')) return 'Ejemplo válido: (p ^ q) -> r. No dejes conectores sueltos.';
  if (m.includes('desconocido') || m.includes('bicondicional')) {
    return 'Usa el teclado virtual: ↔ inserta <-> correctamente. Variables: p, q, r.';
  }
  return 'Prueba un ejemplo de la lista o arma la fórmula con los botones.';
}

/** Borra el último token o carácter (no limpia todo) */
function backspaceFormula(value) {
  let v = value.replace(/\s+$/, '');
  if (!v) return '';

  const multi = ['<->', '->'];
  for (const op of multi) {
    if (v.endsWith(op)) return v.slice(0, -op.length).replace(/\s+$/, '');
  }

  const last = v[v.length - 1];
  if (['~', '^', 'v', '(', ')'].includes(last) || VAR_PATTERN.test(last)) {
    return v.slice(0, -1).replace(/\s+$/, '');
  }

  return v.slice(0, -1);
}

function appendToken(current, token) {
  const binary = ['->', '<->', '^', 'v'];
  if (binary.includes(token)) {
    const base = current.trim();
    return base ? `${base} ${token} ` : `${token} `;
  }
  return `${current}${token}`;
}

export function initLogicModule() {
  const formulaInput = document.getElementById('logic-formula-input');
  const keyboardBtns = document.querySelectorAll('.logical-keyboard .btn-kbd');
  const btnClear = document.getElementById('btn-logic-clear');
  const btnBackspace = document.getElementById('btn-logic-backspace');
  const btnCalculate = document.getElementById('btn-logic-calculate');
  const placeholder = document.getElementById('logic-placeholder');
  const resultContainer = document.getElementById('logic-result-container');
  const formulaTitle = document.getElementById('logic-formula-title');
  const classificationBadge = document.getElementById('logic-classification-badge');
  const truthTableOutput = document.getElementById('truth-table-output');
  const exampleBtns = document.querySelectorAll('.btn-load-logic-example');
  const quizChoicesContainer = document.getElementById('logic-mini-quiz-choices');

  let currentQuizAnswer = '';
  let quizAnswered = false;

  keyboardBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-token');
      formulaInput.value = appendToken(formulaInput.value, token).replace(/\s+/g, ' ');
      clearLogicError();
    });
  });

  btnBackspace?.addEventListener('click', () => {
    formulaInput.value = backspaceFormula(formulaInput.value);
    clearLogicError();
  });

  formulaInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      formulaInput.value = backspaceFormula(formulaInput.value);
      clearLogicError();
    }
  });

  btnClear.addEventListener('click', () => {
    formulaInput.value = '';
    resultContainer.classList.add('hidden');
    placeholder.classList.remove('hidden');
    clearLogicError();
    setGlobalMascotExpression('normal');
  });

  exampleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-example-id');
      const ex = LOGIC_EXAMPLES[id];
      if (ex) {
        formulaInput.value = ex.formula;
        clearLogicError();
        setGlobalMascotExpression('thoughtful');
        showToast(`Ejemplo cargado: ${ex.label}`, 'info', 2200);
      }
    });
  });

  btnCalculate.addEventListener('click', () => {
    const rawFormula = formulaInput.value.trim();
    if (!rawFormula) {
      showToast('Ingresa una fórmula primero.', 'warning');
      return;
    }

    clearLogicError();
    resultContainer.classList.add('hidden');
    placeholder.classList.remove('hidden');

    try {
      const tokens = tokenize(rawFormula);
      const postfix = shuntingYard(tokens);
      const variables = getVariables(tokens);

      if (variables.length === 0) {
        throw new Error('La fórmula debe contener al menos una variable (p, q o r).');
      }

      const numRows = Math.pow(2, variables.length);
      const rows = [];
      let truesCount = 0;

      for (let i = 0; i < numRows; i++) {
        const assignment = {};
        variables.forEach((v, index) => {
          assignment[v] = ((i >> (variables.length - 1 - index)) & 1) === 0;
        });

        const result = evaluatePostfix(postfix, assignment);
        if (result) truesCount++;
        rows.push({ assignment, result });
      }

      let classification = 'Contingencia';
      if (truesCount === numRows) classification = 'Tautología';
      else if (truesCount === 0) classification = 'Contradicción';
      currentQuizAnswer = classification.toLowerCase();
      quizAnswered = false;

      formulaTitle.textContent = `Fórmula: ${rawFormula}`;
      classificationBadge.textContent = '¿?';
      classificationBadge.className = 'badge-classification badge-classification-pending';
      classificationBadge.classList.add('hidden');

      let tableHTML = '<thead><tr>';
      variables.forEach((v) => {
        tableHTML += `<th scope="col">${v}</th>`;
      });
      tableHTML += '<th scope="col">Resultado</th></tr></thead><tbody>';

      rows.forEach((row) => {
        tableHTML += '<tr>';
        variables.forEach((v) => {
          tableHTML += `<td><span class="${row.assignment[v] ? 'val-true' : 'val-false'}">${row.assignment[v] ? 'V' : 'F'}</span></td>`;
        });
        tableHTML += `<td><span class="${row.result ? 'val-true' : 'val-false'}">${row.result ? 'V' : 'F'}</span></td></tr>`;
      });
      tableHTML += '</tbody>';

      truthTableOutput.innerHTML = tableHTML;
      loadMiniQuiz();

      placeholder.classList.add('hidden');
      resultContainer.classList.remove('hidden');
      setGlobalMascotExpression('thoughtful');
      showToast('Tabla generada. Clasifica el resultado en el reto (+50 XP).', 'success', 3200);

      saveModuleProgress('logic', {
        tablesGenerated: (getModuleProgress('logic').tablesGenerated || 0) + 1,
        lastFormula: rawFormula
      });

    } catch (err) {
      const msg = err.message || 'Error de sintaxis desconocido';
      const hint = getSyntaxHint(msg);
      showLogicError(msg, hint);
      setGlobalMascotExpression('sad');
      showMascotSpeech(`Revisa tu fórmula. ${hint}`, 8000);
      playError();
    }
  });

  function loadMiniQuiz() {
    quizChoicesContainer.innerHTML = '';
    const choices = [
      { text: 'Tautología', value: 'tautología' },
      { text: 'Contradicción', value: 'contradicción' },
      { text: 'Contingencia', value: 'contingencia' }
    ];

    choices.forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-dark';
      btn.textContent = c.text;
      btn.setAttribute('aria-label', `Clasificar como ${c.text}`);
      btn.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;

        const btns = quizChoicesContainer.querySelectorAll('button');
        btns.forEach((b) => b.classList.add('disabled'));

        const badge = document.getElementById('logic-classification-badge');
        const classMap = {
          tautología: ['Tautología', 'tautology'],
          contradicción: ['Contradicción', 'contradiction'],
          contingencia: ['Contingencia', 'contingency']
        };
        const [label, cls] = classMap[currentQuizAnswer] || ['Contingencia', 'contingency'];

        if (c.value === currentQuizAnswer) {
          btn.style.background = 'var(--accent)';
          btn.style.color = '#000';
          setGlobalMascotExpression('happy');
          addXP(50, `logic_quiz_${currentQuizAnswer}_${Date.now()}`);
          playSuccess();
          saveModuleProgress('logic', {
            quizzesCorrect: (getModuleProgress('logic').quizzesCorrect || 0) + 1
          });
          if (badge) {
            badge.textContent = label;
            badge.className = `badge-classification ${cls}`;
            badge.classList.remove('hidden');
          }
          showToast(`¡Correcto! Era ${label}. +50 XP`, 'success');
          promptLoginIfNeeded();
          afterModuleActivity('logic');
        } else {
          btn.style.background = 'var(--danger)';
          setGlobalMascotExpression('sad');
          playError();
          showToast('Incorrecto. Revisa la tabla e intenta otra clasificación.', 'error');
        }
      });
      quizChoicesContainer.appendChild(btn);
    });
  }
}
