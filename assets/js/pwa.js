(function () {
    'use strict';
    if (!('serviceWorker' in navigator)) return;

    function resolveSwUrl() {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);
        let prefix = '';
        if (path.endsWith('/') || !path.endsWith('.html')) {
            prefix = '';
        } else {
            const depth = segments.length - 1;
            prefix = '../'.repeat(Math.max(0, depth));
        }
        return prefix + 'sw.js';
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register(resolveSwUrl()).catch(() => {});
    });
})();
