let secretCode = [];
let attempts = 0;
const maxAttempts = 6;
let gameActive = false;

const elements = {
    inputs: [
        document.getElementById('digit-1'),
        document.getElementById('digit-2'),
        document.getElementById('digit-3'),
        document.getElementById('digit-4')
    ],
    submitBtn: document.getElementById('submit-guess'),
    newGameBtn: document.getElementById('new-game'),
    attemptsLeft: document.getElementById('attempts-left'),
    attemptsBar: document.getElementById('attempts-bar'),
    guessesMade: document.getElementById('guesses-made'),
    historyList: document.getElementById('history-list'),
    feedback: document.getElementById('feedback-message'),
    modal: document.getElementById('result-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalIcon: document.getElementById('modal-icon'),
    secretCodeDisplay: document.getElementById('secret-code'),
    playAgainBtn: document.getElementById('modal-restart')
};

function init() {
    setupEventListeners();
    initializeGame();
}

function setupEventListeners() {
    elements.submitBtn.addEventListener('click', submitGuess);
    elements.newGameBtn.addEventListener('click', initializeGame);
    elements.playAgainBtn.addEventListener('click', () => {
        elements.modal.classList.remove('show');
        initializeGame();
    });

    elements.inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (!/^\d*$/.test(e.target.value)) {
                e.target.value = '';
                return;
            }
            if (e.target.value && index < 3) {
                elements.inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                elements.inputs[index - 1].focus();
            }
            if (e.key === 'Enter' && gameActive) {
                submitGuess();
            }
        });

        input.addEventListener('paste', handlePaste);
    });
}

function handlePaste(e) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const numbers = paste.replace(/\D/g, '').slice(0, 4);
    
    numbers.split('').forEach((num, i) => {
        if (elements.inputs[i]) elements.inputs[i].value = num;
    });
    
    if (numbers.length > 0 && numbers.length < 4) {
        elements.inputs[numbers.length].focus();
    } else if (numbers.length === 4) {
        elements.submitBtn.focus();
    }
}

function initializeGame() {
    secretCode = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
    attempts = 0;
    gameActive = true;
    
    elements.attemptsLeft.textContent = maxAttempts;
    elements.attemptsBar.style.width = '100%';
    elements.attemptsBar.style.background = 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))';
    
    elements.guessesMade.textContent = `0/${maxAttempts}`;
    elements.historyList.innerHTML = '<div class="empty-log"><span>Awaiting input sequence...</span></div>';
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback-area';
    
    elements.inputs.forEach(input => {
        input.value = '';
        input.disabled = false;
        input.parentElement.classList.remove('shake');
    });
    
    elements.submitBtn.disabled = false;
    elements.inputs[0].focus();
}

function updateProgressBar() {
    const remaining = maxAttempts - attempts;
    const percentage = (remaining / maxAttempts) * 100;
    
    elements.attemptsLeft.textContent = remaining;
    elements.attemptsBar.style.width = `${percentage}%`;
    elements.guessesMade.textContent = `${attempts}/${maxAttempts}`;

    if (remaining <= 2) {
        elements.attemptsBar.style.background = 'linear-gradient(90deg, var(--neon-red), var(--primary))';
        elements.attemptsBar.style.boxShadow = '0 0 15px var(--neon-red)';
    } else if (remaining <= 4) {
        elements.attemptsBar.style.background = 'linear-gradient(90deg, var(--neon-orange), var(--warning))';
        elements.attemptsBar.style.boxShadow = '0 0 15px var(--neon-orange)';
    } else {
        elements.attemptsBar.style.background = 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))';
        elements.attemptsBar.style.boxShadow = '0 0 15px var(--neon-green)';
    }
}

function submitGuess() {
    if (!gameActive) return;
    
    const guess = elements.inputs.map(input => input.value);
    
    if (guess.some(digit => digit === '')) {
        showFeedback('INCOMPLETE SEQUENCE', 'error');
        shakeInputs();
        return;
    }
    
    attempts++;
    updateProgressBar();
    
    const feedback = analyzeGuess(guess);
    logAttempt(guess, feedback);
    
    elements.inputs.forEach(input => input.value = '');
    elements.inputs[0].focus();
    
    if (feedback.every(f => f === 'correct')) {
        endGame(true);
    } else if (attempts >= maxAttempts) {
        endGame(false);
    }
}

function analyzeGuess(guess) {
    const feedback = new Array(4).fill('wrong');
    const secretCopy = [...secretCode];
    const guessCopy = [...guess.map(Number)];
    
    guessCopy.forEach((digit, i) => {
        if (digit === secretCode[i]) {
            feedback[i] = 'correct';
            secretCopy[i] = -1;
            guessCopy[i] = -2;
        }
    });
    
    guessCopy.forEach((digit, i) => {
        if (digit === -2) return;
        
        const foundIndex = secretCopy.findIndex(s => s === digit);
        if (foundIndex !== -1) {
            feedback[i] = 'existing';
            secretCopy[foundIndex] = -1;
        }
    });
    
    return feedback;
}

function logAttempt(guess, feedback) {
    const emptyLog = elements.historyList.querySelector('.empty-log');
    if (emptyLog) emptyLog.remove();
    
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const numSpan = document.createElement('span');
    numSpan.className = 'attempt-number';
    numSpan.textContent = `#${String(attempts).padStart(2, '0')}`;
    
    const digitsDiv = document.createElement('div');
    digitsDiv.className = 'attempt-digits';
    
    guess.forEach((digit, i) => {
        const miniDigit = document.createElement('div');
        miniDigit.className = `mini-digit ${feedback[i] === 'existing' ? 'exists' : feedback[i]}`;
        miniDigit.textContent = digit;
        digitsDiv.appendChild(miniDigit);
    });
    
    item.appendChild(numSpan);
    item.appendChild(digitsDiv);
    
    if (feedback.every(f => f === 'correct')) {
        item.classList.add('win');
    }
    
    elements.historyList.insertBefore(item, elements.historyList.firstChild);
}

function showFeedback(msg, type) {
    elements.feedback.textContent = msg;
    elements.feedback.className = `feedback-area ${type}`;
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback-area';
    }, 2000);
}

function shakeInputs() {
    elements.inputs.forEach(input => {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    });
}

function endGame(isWin) {
    gameActive = false;
    elements.inputs.forEach(input => input.disabled = true);
    elements.submitBtn.disabled = true;
    
    setTimeout(() => {
        elements.modalTitle.textContent = isWin ? 'SYSTEM DECRYPTED' : 'ACCESS DENIED';
        elements.modalMessage.textContent = isWin 
            ? `Successfully breached in ${attempts} attempt(s).` 
            : 'Maximum attempts reached. System locked.';
        elements.modalIcon.textContent = isWin ? '🔓' : '🔒';
        elements.secretCodeDisplay.textContent = secretCode.join('');
        elements.modal.classList.add('show');
    }, 800);
}

init();
