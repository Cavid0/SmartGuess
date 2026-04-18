(function () {
'use strict';

const cells        = document.querySelectorAll('.cell');
const boardEl      = document.getElementById('board');
const statusText   = document.getElementById('status-text');

const cardX        = document.getElementById('card-x');
const cardO        = document.getElementById('card-o');
const nameXEl      = document.getElementById('name-x');
const nameOEl      = document.getElementById('name-o');
const scoreXEl     = document.getElementById('score-x');
const scoreOEl     = document.getElementById('score-o');
const scoreDrawEl  = document.getElementById('score-draw');
const turnXEl      = document.getElementById('turn-x');
const turnOEl      = document.getElementById('turn-o');

const resultModal  = document.getElementById('result-modal');
const resultCard   = document.getElementById('result-card');
const modalGlow    = document.getElementById('modal-glow');
const modalIcon    = document.getElementById('modal-icon');
const modalTitle   = document.getElementById('modal-title');
const modalSub     = document.getElementById('modal-sub');
const playAgainBtn = document.getElementById('play-again-btn');
const resetAllBtn  = document.getElementById('reset-all-btn');

const namesModal   = document.getElementById('names-modal');
const editNamesBtn = document.getElementById('edit-names-btn');
const saveNamesBtn = document.getElementById('save-names-btn');
const cancelNamesBtn = document.getElementById('cancel-names-btn');
const inputX       = document.getElementById('input-x');
const inputO       = document.getElementById('input-o');

const resetBtn     = document.getElementById('reset-btn');

const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8], 
    [0,3,6],[1,4,7],[2,5,8], 
    [0,4,8],[2,4,6]          
];

let board      = Array(9).fill(null);
let current    = 'x';
let gameOver   = false;
let scores     = { x: 0, o: 0, draw: 0 };
let names      = { x: 'Alex', o: 'Jordan' };

(function loadStorage() {
    const saved = JSON.parse(localStorage.getItem('ttt_state') || 'null');
    if (saved) {
        scores = saved.scores || scores;
        names  = saved.names  || names;
    }
    nameXEl.textContent = names.x;
    nameOEl.textContent = names.o;
    scoreXEl.textContent = scores.x;
    scoreOEl.textContent = scores.o;
    scoreDrawEl.textContent = scores.draw;
})();

function saveStorage() {
    localStorage.setItem('ttt_state', JSON.stringify({ scores, names }));
}

function initGame(keepTurn = false) {
    board    = Array(9).fill(null);
    gameOver = false;
    if (!keepTurn) current = 'x';

    cells.forEach(c => {
        c.textContent = '';
        c.className   = 'cell';
    });

    updateTurnUI();
}

function updateTurnUI() {
    const name = current === 'x' ? names.x : names.o;
    statusText.textContent = `${name}'s turn`;

    cardX.classList.toggle('active', current === 'x');
    cardO.classList.toggle('active', current === 'o');

    turnXEl.classList.toggle('visible', current === 'x');
    turnOEl.classList.toggle('visible', current === 'o');
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const idx = parseInt(cell.dataset.index);
        if (gameOver || board[idx]) return;

        board[idx] = current;
        cell.textContent = current === 'x' ? '✕' : '○';
        cell.classList.add(current === 'x' ? 'x-cell' : 'o-cell', 'taken', 'mark-enter');
        window.Sfx && Sfx.move();
        window.Hapt && Hapt.tap();
        cell.addEventListener('animationend', () => cell.classList.remove('mark-enter'), { once: true });

        const winLine = checkWin(current);
        if (winLine) {
            handleWin(current, winLine);
        } else if (board.every(Boolean)) {
            handleDraw();
        } else {
            current = current === 'x' ? 'o' : 'x';
            updateTurnUI();
        }
    });
});

function checkWin(player) {
    return WIN_LINES.find(line => line.every(i => board[i] === player)) || null;
}

function handleWin(player, line) {
    gameOver = true;
    window.Sfx && Sfx.win();
    window.Hapt && Hapt.success();

    line.forEach((idx, i) => {
        setTimeout(() => {
            cells[idx].classList.add('win-cell');
        }, i * 100);
    });

    scores[player]++;
    saveStorage();

    const scoreEl = player === 'x' ? scoreXEl : scoreOEl;
    scoreEl.textContent = scores[player];
    scoreEl.classList.add('pop');
    scoreEl.addEventListener('animationend', () => scoreEl.classList.remove('pop'), { once: true });

    const winName  = player === 'x' ? names.x : names.o;
    const winColor = player === 'x' ? '#f472b6' : '#60a5fa';

    statusText.textContent = `${winName} wins! 🎉`;
    cardX.classList.remove('active');
    cardO.classList.remove('active');
    turnXEl.classList.remove('visible');
    turnOEl.classList.remove('visible');

    setTimeout(() => {
        modalGlow.style.background = winColor;
        modalIcon.textContent      = player === 'x' ? '✕' : '○';
        modalIcon.className        = `modal-icon ${player}-icon`;
        modalTitle.textContent     = `${winName} Wins!`;
        modalSub.textContent       = 'Brilliant game. Play again?';
        resultModal.classList.remove('hidden');
    }, 600);
}

function handleDraw() {
    gameOver = true;
    window.Sfx && Sfx.warn();
    window.Hapt && Hapt.warn();
    scores.draw++;
    saveStorage();

    scoreDrawEl.textContent = scores.draw;
    statusText.textContent  = "It's a draw!";
    cardX.classList.remove('active');
    cardO.classList.remove('active');
    turnXEl.classList.remove('visible');
    turnOEl.classList.remove('visible');

    setTimeout(() => {
        modalGlow.style.background = '#fbbf24';
        modalIcon.textContent      = '🤝';
        modalIcon.className        = 'modal-icon draw-icon';
        modalTitle.textContent     = "It's a Draw!";
        modalSub.textContent       = 'So evenly matched. Try again!';
        resultModal.classList.remove('hidden');
    }, 400);
}

playAgainBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    current = current === 'x' ? 'o' : 'x';
    initGame(true);
});

resetAllBtn.addEventListener('click', () => {
    scores = { x: 0, o: 0, draw: 0 };
    saveStorage();
    scoreXEl.textContent    = 0;
    scoreOEl.textContent    = 0;
    scoreDrawEl.textContent = 0;
    resultModal.classList.add('hidden');
    current = 'x';
    initGame();
});

resetBtn.addEventListener('click', () => {
    current = 'x';
    initGame();
});

editNamesBtn.addEventListener('click', () => {
    inputX.value = names.x;
    inputO.value = names.o;
    namesModal.classList.remove('hidden');
    inputX.focus();
});

saveNamesBtn.addEventListener('click', () => {
    const nx = inputX.value.trim() || 'Player 1';
    const no = inputO.value.trim() || 'Player 2';
    names.x = nx;
    names.o = no;
    nameXEl.textContent = nx;
    nameOEl.textContent = no;
    saveStorage();
    namesModal.classList.add('hidden');
    updateTurnUI();
});

cancelNamesBtn.addEventListener('click', () => namesModal.classList.add('hidden'));

namesModal.addEventListener('click', e => {
    if (e.target === namesModal) namesModal.classList.add('hidden');
});

[inputX, inputO].forEach(inp => {
    inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') saveNamesBtn.click();
        if (e.key === 'Escape') cancelNamesBtn.click();
    });
});

document.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') {
        if (document.activeElement.tagName === 'INPUT') return;
        current = 'x';
        initGame();
    }
});

initGame();

})();
