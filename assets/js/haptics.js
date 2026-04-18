(function () {
    'use strict';
    const ok = 'vibrate' in navigator && typeof navigator.vibrate === 'function';
    const enabled = () => localStorage.getItem('mgh_haptic') !== 'off';

    function fire(pattern) {
        if (!ok || !enabled()) return;
        try { navigator.vibrate(pattern); } catch (_) {}
    }

    window.Hapt = {
        tap:     () => fire(10),
        click:   () => fire(15),
        warn:    () => fire([20, 40, 20]),
        success: () => fire([25, 40, 80]),
        error:   () => fire([60, 30, 60]),
        off:     () => { try { navigator.vibrate(0); } catch (_) {} },
        toggle(v) {
            const next = typeof v === 'boolean' ? v : localStorage.getItem('mgh_haptic') === 'off';
            localStorage.setItem('mgh_haptic', next ? 'on' : 'off');
            return next;
        },
        isOn() { return enabled(); },
        isSupported: ok
    };
})();
