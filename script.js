// Oyun Değişkenleri
let currentNumber = 0;
let attempts = 0;
let maxAttempts = 5;
let gameActive = false;

// DOM Elementleri
const screens = {
    welcome: document.getElementById('welcome-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    startBtn: document.getElementById('start-btn'),
    guessInput: document.getElementById('guess-input'),
    guessBtn: document.getElementById('guess-btn'),
    resetBtn: document.getElementById('reset-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    homeBtn: document.getElementById('home-btn'),
    attemptCount: document.getElementById('attempt-count'),
    remainingAttempts: document.getElementById('remaining-attempts'),
    progressFill: document.getElementById('progress-fill'),
    feedback: document.getElementById('feedback'),
    hintArea: document.getElementById('hint-area'),
    resultIcon: document.getElementById('result-icon'),
    resultTitle: document.getElementById('result-title'),
    resultMessage: document.getElementById('result-message'),
    correctNumber: document.getElementById('correct-number'),
    totalGuesses: document.getElementById('total-guesses'),
    currentYear: document.getElementById('current-year')
};

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    elements.currentYear.textContent = new Date().getFullYear();
});

// Oyunu Başlatma
function initializeGame() {
    currentNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameActive = true;
    
    updateProgress();
    clearFeedback();
    clearHint();
    
    // Input'u temizle ve focus'la
    elements.guessInput.value = '';
    elements.guessInput.disabled = false;
    elements.guessBtn.disabled = false;
}

// Event Listener'ları Ayarlama
function setupEventListeners() {
    // Oyunu Başlat
    elements.startBtn.addEventListener('click', startGame);
    
    // Tahmin Et
    elements.guessBtn.addEventListener('click', makeGuess);
    
    // Enter tuşu ile tahmin
    elements.guessInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && gameActive) {
            makeGuess();
        }
    });
    
    // Input sadece rakam kabul etsin
    elements.guessInput.addEventListener('input', function(e) {
        let value = parseInt(e.target.value);
        if (value < 1) e.target.value = '';
        if (value > 100) e.target.value = '100';
    });
    
    // Yeni Oyun
    elements.resetBtn.addEventListener('click', function() {
        initializeGame();
        showFeedback('🔄 Yeni oyun başladı! Yeni bir sayı düşündüm.', 'success');
    });
    
    // Tekrar Oyna
    elements.playAgainBtn.addEventListener('click', function() {
        showScreen('game');
        initializeGame();
    });
    
    // Ana Sayfaya Dön
    elements.homeBtn.addEventListener('click', function() {
        showScreen('welcome');
        initializeGame();
    });
}

// Ekran Değiştirme
function showScreen(screenName) {
    // Tüm ekranları gizle
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // İstenen ekranı göster
    screens[screenName].classList.add('active');
}

// Oyunu Başlat
function startGame() {
    showScreen('game');
    initializeGame();
    elements.guessInput.focus();
}

// Tahmin Yapma
function makeGuess() {
    if (!gameActive) return;
    
    const guess = parseInt(elements.guessInput.value);
    
    // Geçersiz giriş kontrolü
    if (isNaN(guess) || guess < 1 || guess > 100) {
        showFeedback('❌ Lütfen 1-100 arasında geçerli bir sayı girin!', 'error');
        elements.guessInput.classList.add('shake');
        setTimeout(() => elements.guessInput.classList.remove('shake'), 500);
        return;
    }
    
    attempts++;
    updateProgress();
    
    // Tahmin kontrolü
    if (guess === currentNumber) {
        // Doğru tahmin - Kazandı
        gameWon();
    } else if (attempts >= maxAttempts) {
        // Tahmin bitti - Kaybetti
        gameLost();
    } else {
        // Yanlış tahmin - İpucu ver
        giveHint(guess);
    }
    
    // Input'u temizle
    elements.guessInput.value = '';
    elements.guessInput.focus();
}

// İlerleme Güncelleme
function updateProgress() {
    const progressPercentage = (attempts / maxAttempts) * 100;
    elements.progressFill.style.width = `${progressPercentage}%`;
    elements.attemptCount.textContent = attempts;
    elements.remainingAttempts.textContent = maxAttempts - attempts;
}

// İpucu Verme
function giveHint(guess) {
    let feedbackText, hintText;
    
    if (guess < currentNumber) {
        feedbackText = '⬆️ Daha BÜYÜK bir sayı dene!';
        hintText = `💡 İpucu: ${guess} ile 100 arasında bir sayı`;
    } else {
        feedbackText = '⬇️ Daha KÜÇÜK bir sayı dene!';
        hintText = `💡 İpucu: 1 ile ${guess} arasında bir sayı`;
    }
    
    showFeedback(feedbackText, 'warning');
    showHint(hintText);
    
    // Kalan hakka göre ek ipucu
    const remaining = maxAttempts - attempts;
    if (remaining === 2) {
        setTimeout(() => {
            showFeedback(`⚠️ Sadece ${remaining} tahmin hakkın kaldı! Dikkatli ol.`, 'error');
        }, 1500);
    } else if (remaining === 1) {
        setTimeout(() => {
            showFeedback('🔥 Son şansın! Dikkatlice düşün.', 'error');
        }, 1500);
    }
}

// Oyun Kazanıldı
function gameWon() {
    gameActive = false;
    elements.guessInput.disabled = true;
    elements.guessBtn.disabled = true;
    
    // Konfeti efekti
    createConfetti();
    
    // Kazanma mesajı
    showFeedback('🎉 TEBRİKLER! Doğru tahmin ettin!', 'success');
    
    setTimeout(() => {
        showScreen('result');
        elements.resultIcon.textContent = '🏆';
        elements.resultTitle.textContent = 'KAZANDIN!';
        elements.resultTitle.className = 'result-title win';
        
        let message = '';
        if (attempts === 1) {
            message = 'Harika! İlk denemede buldun! 🎯';
        } else if (attempts <= 3) {
            message = 'Mükemmel performans! Çok hızlıydın! ⚡';
        } else {
            message = 'Tebrikler! Sonunda başardın! 🎊';
        }
        
        elements.resultMessage.textContent = message;
        elements.correctNumber.textContent = currentNumber;
        elements.totalGuesses.textContent = attempts;
    }, 2000);
}

// Oyun Kaybedildi
function gameLost() {
    gameActive = false;
    elements.guessInput.disabled = true;
    elements.guessBtn.disabled = true;
    
    showFeedback('💔 Tahmin hakkın bitti!', 'error');
    
    setTimeout(() => {
        showScreen('result');
        elements.resultIcon.textContent = '😔';
        elements.resultTitle.textContent = 'KAYBETTIN!';
        elements.resultTitle.className = 'result-title lose';
        elements.resultMessage.textContent = 'Üzülme! Bir daha deneyebilirsin. 💪';
        elements.correctNumber.textContent = currentNumber;
        elements.totalGuesses.textContent = attempts;
    }, 2000);
}

// Geri Bildirim Gösterme
function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type} show`;
    
    setTimeout(() => {
        elements.feedback.classList.remove('show');
    }, 3000);
}

// Geri Bildirimi Temizle
function clearFeedback() {
    elements.feedback.classList.remove('show');
    elements.feedback.textContent = '';
}

// İpucu Gösterme
function showHint(message) {
    elements.hintArea.textContent = message;
    elements.hintArea.classList.add('show');
    
    setTimeout(() => {
        elements.hintArea.classList.remove('show');
    }, 4000);
}

// İpucunu Temizle
function clearHint() {
    elements.hintArea.classList.remove('show');
    elements.hintArea.textContent = '';
}

// Konfeti Animasyonu
function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    // 50 adet konfeti oluştur
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            container.appendChild(confetti);
            
            // Animasyon bitince konfeti'yi sil
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 100);
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // ESC tuşu ile ana menüye dön
    if (e.key === 'Escape') {
        showScreen('welcome');
        initializeGame();
    }
    
    // R tuşu ile oyunu yeniden başlat
    if (e.key.toLowerCase() === 'r' && gameActive) {
        initializeGame();
        showFeedback('🔄 Oyun yenilendi!', 'success');
    }
});

// Sayfa görünürlük değiştiğinde
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Sayfa gizlendiğinde ses/animasyon durdur
        console.log('Oyun duraklatıldı');
    } else {
        // Sayfa tekrar görünür olduğunda devam et
        console.log('Oyun devam ediyor');
        if (gameActive && screens.game.classList.contains('active')) {
            elements.guessInput.focus();
        }
    }
});