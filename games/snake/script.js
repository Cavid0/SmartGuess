(function () {
'use strict';

const canvas   = document.getElementById('game-canvas');
const ctx      = canvas.getContext('2d');
const rotateHint = document.getElementById('rotate-hint');
const dpadBtns   = document.querySelectorAll('.dp-btn[data-dir]');
const dpPauseBtn = document.getElementById('dp-pause');
const overlay  = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');
const newGameBtn = document.getElementById('new-game');
const infoBtn    = document.getElementById('info-btn');
const closeInfoBtn = document.getElementById('close-info');
const infoModal  = document.getElementById('info-modal');

const scoreEl    = document.getElementById('score');
const highScEl   = document.getElementById('high-score');
const levelEl    = document.getElementById('level');
const lengthEl   = document.getElementById('length');
const logList    = document.getElementById('log-list');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg   = document.getElementById('overlay-msg');

const CELL       = 20;
const COLS       = 25;
const ROWS       = 25;
const BASE_SPEED = 220;

canvas.width  = COLS * CELL;
canvas.height = ROWS * CELL;

const C = {
    bg:        '#0a0a0a',
    grid:      'rgba(255,255,255,0.03)',
    snakeHead: '#39ff14',
    snakeBody: '#2bbb10',
    snakeGlow: 'rgba(57,255,20,0.35)',
    food:      '#ff4b6e',
    foodGlow:  'rgba(255,75,110,0.5)',
    bonusFood: '#fbbf24',
    bonusGlow: 'rgba(251,191,36,0.5)',
    text:      '#ffffff',
};

let snake, dir, nextDir, food, bonusFood, score, highScore, level, gameLoop, paused, running;

highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
highScEl.textContent = highScore;

function rand(max) { return Math.floor(Math.random() * max); }

function randCell(exclude = []) {
    let pos;
    do {
        pos = { x: rand(COLS), y: rand(ROWS) };
    } while (exclude.some(p => p.x === pos.x && p.y === pos.y));
    return pos;
}

function addLog(icon, text, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-icon">${icon}</span><span>${text}</span>`;
    logList.prepend(entry);
    
    while (logList.children.length > 30) logList.lastChild.remove();
}

function speedForLevel(lvl) {
    return Math.max(60, BASE_SPEED - (lvl - 1) * 15);
}

function init() {
    const midX = Math.floor(COLS / 2);
    const midY = Math.floor(ROWS / 2);
    snake   = [
        { x: midX,     y: midY },
        { x: midX - 1, y: midY },
        { x: midX - 2, y: midY },
    ];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;
    level   = 1;
    bonusFood = null;
    paused  = false;
    running = true;

    food = randCell(snake);

    updateStats();
    logList.innerHTML = '';
    addLog('🟢', 'New game started', 'success');
    addLog('ℹ️', 'Eat food to grow & level up', 'info');
}

document.addEventListener('keydown', e => {
    if (!running) return;

    switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W':
            if (dir.y !== 1)  nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown':  case 's': case 'S':
            if (dir.y !== -1) nextDir = { x: 0, y: 1 };  break;
        case 'ArrowLeft':  case 'a': case 'A':
            if (dir.x !== 1)  nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': case 'D':
            if (dir.x !== -1) nextDir = { x: 1, y: 0 };  break;
        case ' ':
            e.preventDefault();
            togglePause(); break;
    }

    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
    }
});

let touchStart = null;
canvas.addEventListener('touchstart', e => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
canvas.addEventListener('touchend', e => {
    if (!touchStart || !running) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && dir.x !== -1) nextDir = { x: 1, y: 0 };
        if (dx < -20 && dir.x !== 1) nextDir = { x: -1, y: 0 };
    } else {
        if (dy > 20 && dir.y !== -1) nextDir = { x: 0, y: 1 };
        if (dy < -20 && dir.y !== 1) nextDir = { x: 0, y: -1 };
    }
    touchStart = null;
}, { passive: true });

function startLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, speedForLevel(level));
}

function tick() {
    if (paused || !running) return;

    dir = { ...nextDir };

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return gameOver('Hit the wall! 💥');
    }
    
    if (snake.some(p => p.x === head.x && p.y === head.y)) {
        return gameOver('Ate yourself! 😵');
    }

    snake.unshift(head);

    let ate = false;

    if (head.x === food.x && head.y === food.y) {
        score += 10 * level;
        ate = true;
        food = randCell(snake);
        addLog('🍎', `+${10 * level} points`, 'success');
        window.Sfx && Sfx.eat();
        window.Hapt && Hapt.tap();

        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel > level) {
            level = newLevel;
            addLog('⬆️', `Level ${level}!`, 'warning');
            window.Sfx && Sfx.bonus();
            window.Hapt && Hapt.success();
            startLoop();
        }

        if (!bonusFood && Math.random() < 0.3) {
            bonusFood = randCell(snake);
            bonusFood.expires = Date.now() + 5000;
            addLog('⭐', 'Bonus food appeared!', 'warning');
        }
    }

    if (bonusFood) {
        if (head.x === bonusFood.x && head.y === bonusFood.y) {
            score += 50 * level;
            ate = true;
            addLog('⭐', `Bonus! +${50 * level} points`, 'warning');
            window.Sfx && Sfx.bonus();
            window.Hapt && Hapt.success();
            bonusFood = null;
        } else if (Date.now() > bonusFood.expires) {
            bonusFood = null;
            addLog('⏰', 'Bonus food expired', 'system');
        }
    }

    if (!ate) snake.pop();

    updateStats();
    draw();
}

function gameOver(reason) {
    running = false;
    clearInterval(gameLoop);
    window.Sfx && Sfx.lose();
    window.Hapt && Hapt.error();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScEl.textContent = highScore;
        addLog('🏆', 'New high score!', 'success');
        window.Sfx && Sfx.win();
    }

    addLog('💀', reason, 'danger');
    addLog('📊', `Final score: ${score}`, 'info');

    overlayTitle.textContent = 'Game Over';
    overlayMsg.textContent   = `Score: ${score} | High Score: ${highScore}\n${reason}`;
    startBtn.textContent     = 'PLAY AGAIN';
    overlay.classList.remove('hidden');
}

function togglePause() {
    paused = !paused;
    if (paused) {
        overlayTitle.textContent = 'Paused';
        overlayMsg.textContent   = 'Press Space or click to resume';
        startBtn.textContent     = 'RESUME';
        overlay.classList.remove('hidden');
        addLog('⏸️', 'Game paused', 'info');
    } else {
        overlay.classList.add('hidden');
        addLog('▶️', 'Game resumed', 'info');
    }
}

function updateStats() {
    scoreEl.textContent  = score;
    levelEl.textContent  = level;
    lengthEl.textContent = snake.length;
}

function draw() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(canvas.width, y * CELL);
        ctx.stroke();
    }

    if (bonusFood) {
        ctx.save();
        ctx.shadowColor = C.bonusGlow;
        ctx.shadowBlur  = 18;
        ctx.fillStyle   = C.bonusFood;
        roundRect(bonusFood.x, bonusFood.y, 4);
        ctx.restore();
        
        const remaining = Math.max(0, bonusFood.expires - Date.now()) / 5000;
        ctx.save();
        ctx.strokeStyle = 'rgba(251,191,36,0.5)';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        const cx = bonusFood.x * CELL + CELL / 2;
        const cy = bonusFood.y * CELL + CELL / 2;
        ctx.arc(cx, cy, CELL * 0.9, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * remaining);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = C.foodGlow;
    ctx.shadowBlur  = 16;
    ctx.fillStyle   = C.food;
    roundRect(food.x, food.y, 4);
    ctx.restore();

    for (let i = snake.length - 1; i >= 1; i--) {
        const alpha = 0.55 + 0.45 * (1 - i / snake.length);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = C.snakeGlow;
        ctx.shadowBlur  = 8;
        ctx.fillStyle   = C.snakeBody;
        roundRect(snake[i].x, snake[i].y, 3);
        ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = C.snakeGlow;
    ctx.shadowBlur  = 20;
    ctx.fillStyle   = C.snakeHead;
    roundRect(snake[0].x, snake[0].y, 5);
    ctx.restore();

    drawEyes(snake[0]);
}

function roundRect(col, row, radius) {
    const x = col * CELL + 1;
    const y = row * CELL + 1;
    const w = CELL - 2;
    const h = CELL - 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function drawEyes(head) {
    const cx = head.x * CELL + CELL / 2;
    const cy = head.y * CELL + CELL / 2;
    const eyeOffset = 3.5;
    const eyeRadius = 2;

    let e1, e2;
    if (dir.x === 1)  { e1 = { x: cx+3, y: cy-eyeOffset }; e2 = { x: cx+3, y: cy+eyeOffset }; }
    if (dir.x === -1) { e1 = { x: cx-3, y: cy-eyeOffset }; e2 = { x: cx-3, y: cy+eyeOffset }; }
    if (dir.y === -1) { e1 = { x: cx-eyeOffset, y: cy-3 }; e2 = { x: cx+eyeOffset, y: cy-3 }; }
    if (dir.y === 1)  { e1 = { x: cx-eyeOffset, y: cy+3 }; e2 = { x: cx+eyeOffset, y: cy+3 }; }
    if (!e1) return;

    ctx.fillStyle = '#000';
    [e1, e2].forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawIdle() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(canvas.width, y*CELL); ctx.stroke();
    }
}
drawIdle();

startBtn.addEventListener('click', () => {
    if (!running || overlay.classList.contains('hidden') === false) {
        overlay.classList.add('hidden');
        init();
        draw();
        startLoop();
    }
});

newGameBtn.addEventListener('click', () => {
    clearInterval(gameLoop);
    overlay.classList.remove('hidden');
    overlayTitle.textContent = 'Snake';
    overlayMsg.textContent   = 'Use arrow keys or swipe to move. Eat the food to grow!';
    startBtn.textContent     = 'START GAME';
    running = false;
    drawIdle();
    logList.innerHTML = '';
    addLog('🔄', 'Game reset', 'system');
    addLog('ℹ️', 'Press START to begin', 'info');
    scoreEl.textContent  = '0';
    levelEl.textContent  = '1';
    lengthEl.textContent = '3';
});

infoBtn.addEventListener('click', () => {
    if (running && !paused && overlay.classList.contains('hidden')) {
        togglePause();
    }
    infoModal.classList.remove('hidden');
});

closeInfoBtn.addEventListener('click', () => {
    infoModal.classList.add('hidden');
});

infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        infoModal.classList.add('hidden');
    }
});

function applyDir(name) {
    if (!running) return;
    window.Hapt && Hapt.tap();
    if (name === 'up'    && dir.y !== 1)  nextDir = { x: 0, y: -1 };
    if (name === 'down'  && dir.y !== -1) nextDir = { x: 0, y: 1 };
    if (name === 'left'  && dir.x !== 1)  nextDir = { x: -1, y: 0 };
    if (name === 'right' && dir.x !== -1) nextDir = { x: 1, y: 0 };
}

dpadBtns.forEach(btn => {
    const handler = (e) => { e.preventDefault(); applyDir(btn.dataset.dir); };
    btn.addEventListener('touchstart', handler, { passive: false });
    btn.addEventListener('click', handler);
});

if (dpPauseBtn) {
    dpPauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (running) togglePause();
    });
}

function evalOrientation() {
    if (!rotateHint) return;
    const narrowLandscape = window.matchMedia('(orientation: landscape) and (max-height: 480px)').matches;
    rotateHint.classList.toggle('show', narrowLandscape);
}
evalOrientation();
window.addEventListener('resize', evalOrientation);
window.addEventListener('orientationchange', evalOrientation);

})();
