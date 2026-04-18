(function () {
    'use strict';
    const KEY = 'mgh_theme';

    function get() {
        const v = localStorage.getItem(KEY);
        if (v === 'light' || v === 'dark') return v;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
    }

    function set(theme) {
        localStorage.setItem(KEY, theme);
        apply(theme);
    }

    apply(get());

    window.Theme = {
        get, set,
        toggle() { const next = get() === 'dark' ? 'light' : 'dark'; set(next); return next; }
    };
})();
