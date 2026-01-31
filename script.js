let randomNumber = 0;
let attempts = 0;
const maxAttempts = 5;
let gameActive = false;

const elements = {
    newGame: document.getElementById('new-game'),
    submitGuess: document.getElementById('submit-guess'),
    playAgain: document.getElementById('play-again'),
    guessInput: document.getElementById('guess-input'),
    currentAttempt: document.getElementById('current-attempt'),
    progressFill: document.getElementById('progress-fill'),
    progressPercent: document.getElementById('progress-percent'),
    feedbackArea: document.getElementById('feedback-area'),
    hintArea: document.getElementById('hint-area'),
    historyList: document.getElementById('history-list'),
    resultModal: document.getElementById('result-modal'),
    modalIcon: document.getElementById('modal-icon'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    correctNumber: document.getElementById('correct-number'),
    totalAttempts: document.getElementById('total-attempts')
};

function init() {
    elements.newGame.addEventListener('click', resetGame);
    elements.submitGuess.addEventListener('click', submitGuess);
    elements.playAgain.addEventListener('click', playAgain);
    
    elements.guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && gameActive) {
            submitGuess();
        }
    });

    elements.guessInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        if (value < 1) e.target.value = '';
        if (value > 100) e.target.value = '100';
    });

    initializeGame();
}

function initializeGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameActive = true;
    
    elements.currentAttempt.textContent = '0';
    elements.progressFill.style.width = '0%';
    elements.progressPercent.textContent = '0%';
    elements.guessInput.value = '';
    elements.guessInput.disabled = false;
    elements.submitGuess.disabled = false;
    
    elements.feedbackArea.className = 'feedback-area';
    elements.feedbackArea.textContent = '';
    elements.hintArea.className = 'hint-area';
    elements.hintArea.textContent = '';
    elements.historyList.innerHTML = '<div class="empty-state">No guesses yet</div>';
    elements.resultModal.classList.remove('show');
}

function resetGame() {
    initializeGame();
    showFeedback('New game started! Good luck!', 'success');
}

function submitGuess() {
    if (!gameActive) return;
    
    const guess = parseInt(elements.guessInput.value);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
        showFeedback('Please enter a valid number between 1 and 100!', 'error');
        elements.guessInput.classList.add('shake');
        setTimeout(() => elements.guessInput.classList.remove('shake'), 500);
        return;
    }
    
    attempts++;
    updateProgress();
    addToHistory(guess);
    
    if (guess === randomNumber) {
        winGame();
    } else if (attempts >= maxAttempts) {
        loseGame();
    } else {
        provideHint(guess);
    }
    
    elements.guessInput.value = '';
    elements.guessInput.focus();
}

function updateProgress() {
    // 100 is full, 0 is empty. We want 0 attempts to be empty.
    const percentage = (attempts / maxAttempts) * 100;
    
    // Circular progress stroke-dashoffset calculation
    // Circle circumference = 100 (due to path pathLength or dasharray 0,100 trick)
    const circle = document.getElementById('circular-fill');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }

    elements.currentAttempt.textContent = attempts;
}

function provideHint(guess) {
    let feedback, hint;
    
    if (guess < randomNumber) {
        feedback = '⬆️ Try a HIGHER number!';
        hint = `💡 Hint: Between ${guess} and 100`;
    } else {
        feedback = '⬇️ Try a LOWER number!';
        hint = `💡 Hint: Between 1 and ${guess}`;
    }
    
    showFeedback(feedback, 'warning');
    showHint(hint);
    
    const remaining = maxAttempts - attempts;
    if (remaining === 2) {
        setTimeout(() => {
            showFeedback(`⚠️ Only ${remaining} attempts left!`, 'error');
        }, 1500);
    } else if (remaining === 1) {
        setTimeout(() => {
            showFeedback('🔥 Last chance! Think carefully.', 'error');
        }, 1500);
    }
}

function showFeedback(message, type) {
    elements.feedbackArea.textContent = message;
    elements.feedbackArea.className = `feedback-area ${type} show`;
    
    setTimeout(() => {
        elements.feedbackArea.classList.remove('show');
    }, 3000);
}

function showHint(message) {
    elements.hintArea.textContent = message;
    elements.hintArea.classList.add('show');
    
    setTimeout(() => {
        elements.hintArea.classList.remove('show');
    }, 4000);
}

function addToHistory(guess) {
    if (attempts === 1) {
        elements.historyList.innerHTML = '';
    }
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    let hintText;
    if (guess === randomNumber) {
        hintText = '✅ Correct!';
    } else if (guess < randomNumber) {
        hintText = '⬆️ Too low';
    } else {
        hintText = '⬇️ Too high';
    }
    
    historyItem.innerHTML = `
        <span class="history-item-guess">#${attempts}: ${guess}</span>
        <span class="history-item-hint">${hintText}</span>
    `;
    
    elements.historyList.appendChild(historyItem);
}

function winGame() {
    gameActive = false;
    elements.guessInput.disabled = true;
    elements.submitGuess.disabled = true;
    
    createConfetti();
    showFeedback('🎉 CONGRATULATIONS! You won!', 'success');
    
    setTimeout(() => {
        elements.modalIcon.textContent = '🏆';
        elements.modalTitle.textContent = 'YOU WIN!';
        elements.modalTitle.className = 'modal-title win';
        
        let message = '';
        if (attempts === 1) {
            message = 'Incredible! First try! 🎯';
        } else if (attempts <= 3) {
            message = 'Excellent performance! ⚡';
        } else {
            message = 'Great job! You found it! 🎊';
        }
        
        elements.modalMessage.textContent = message;
        elements.correctNumber.textContent = randomNumber;
        elements.totalAttempts.textContent = attempts;
        elements.resultModal.classList.add('show');
    }, 1500);
}

function loseGame() {
    gameActive = false;
    elements.guessInput.disabled = true;
    elements.submitGuess.disabled = true;
    
    showFeedback('💔 Out of attempts!', 'error');
    
    setTimeout(() => {
        elements.modalIcon.textContent = '😔';
        elements.modalTitle.textContent = 'GAME OVER';
        elements.modalTitle.className = 'modal-title lose';
        elements.modalMessage.textContent = "Don't give up! Try again! 💪";
        elements.correctNumber.textContent = randomNumber;
        elements.totalAttempts.textContent = attempts;
        elements.resultModal.classList.add('show');
    }, 1500);
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.3 + 's';
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 25);
    }
}

function playAgain() {
    elements.resultModal.classList.remove('show');
    initializeGame();
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.resultModal.classList.contains('show')) {
        playAgain();
    }
    if (e.key.toLowerCase() === 'n' && gameActive) {
        resetGame();
    }
});

elements.resultModal.addEventListener('click', (e) => {
    if (e.target === elements.resultModal) {
        playAgain();
    }
});
