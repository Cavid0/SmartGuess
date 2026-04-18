(function () {
    'use strict';

    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null;

    function ensureCtx() {
        if (!AC) return null;
        if (!ctx) ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function enabled() {
        return localStorage.getItem('mgh_sound') !== 'off';
    }

    function tone(freq, dur = 0.1, type = 'sine', gain = 0.12, startFreq = null) {
        if (!enabled()) return;
        const a = ensureCtx();
        if (!a) return;

        const osc = a.createOscillator();
        const g   = a.createGain();

        osc.type = type;
        const now = a.currentTime;
        if (startFreq !== null) {
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq), now + dur);
        } else {
            osc.frequency.setValueAtTime(freq, now);
        }

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(gain, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(g).connect(a.destination);
        osc.start(now);
        osc.stop(now + dur + 0.02);
    }

    window.Sfx = {
        click:   () => tone(520, 0.06, 'square', 0.08),
        tap:     () => tone(680, 0.05, 'triangle', 0.07),
        move:    () => tone(280, 0.04, 'sine', 0.05),
        eat:     () => tone(880, 0.09, 'triangle', 0.12, 440),
        bonus:   () => { tone(660, 0.09, 'triangle', 0.12); setTimeout(() => tone(990, 0.12, 'triangle', 0.12), 80); },
        win:     () => {
            [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.14), i * 90));
        },
        lose:    () => {
            [330, 262, 208].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'sawtooth', 0.12), i * 110));
        },
        warn:    () => tone(420, 0.12, 'square', 0.1),
        toggle(v) {
            const next = typeof v === 'boolean' ? v : localStorage.getItem('mgh_sound') === 'off';
            localStorage.setItem('mgh_sound', next ? 'on' : 'off');
            return next;
        },
        isOn() { return enabled(); }
    };

    document.addEventListener('click', ensureCtx, { once: true, passive: true });
    document.addEventListener('keydown', ensureCtx, { once: true, passive: true });
    document.addEventListener('touchstart', ensureCtx, { once: true, passive: true });
})();
