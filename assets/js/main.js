(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const cards = document.querySelectorAll('.game-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });

            card.addEventListener('click', function (e) {
                if (!e.target.closest('.play-button')) {
                    const btn = this.querySelector('.play-button');
                    if (btn) {
                        window.Sfx && Sfx.click();
                        window.Hapt && Hapt.click();
                        btn.click();
                    }
                }
            });

            const btn = card.querySelector('.play-button');
            if (btn) {
                btn.addEventListener('click', () => {
                    window.Sfx && Sfx.click();
                    window.Hapt && Hapt.click();
                });
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            const map = {
                '1': 'games/codebreaker/index.html',
                '2': 'games/numberguess/index.html',
                '3': 'games/snake/index.html',
                '4': 'games/tictactoe/index.html'
            };
            if (map[e.key]) {
                window.Sfx && Sfx.click();
                window.location.href = map[e.key];
            }
        });

        const themeBtn = document.getElementById('theme-toggle');
        const soundBtn = document.getElementById('sound-toggle');

        function renderTheme() {
            if (!themeBtn) return;
            const t = window.Theme ? Theme.get() : 'dark';
            themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
            themeBtn.setAttribute('aria-pressed', t === 'light');
        }

        function renderSound() {
            if (!soundBtn) return;
            const on = window.Sfx ? Sfx.isOn() : true;
            soundBtn.textContent = on ? '🔊' : '🔇';
            soundBtn.dataset.off = String(!on);
            soundBtn.setAttribute('aria-pressed', on);
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                if (window.Theme) Theme.toggle();
                window.Sfx && Sfx.tap();
                window.Hapt && Hapt.tap();
                renderTheme();
            });
        }

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const nowOn = window.Sfx ? Sfx.toggle() : true;
                if (nowOn && window.Sfx) Sfx.tap();
                window.Hapt && Hapt.tap();
                renderSound();
            });
        }

        renderTheme();
        renderSound();
    });
})();
