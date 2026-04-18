(function () {
    'use strict';

    if (window.__mgh_sec_loaded) return;
    window.__mgh_sec_loaded = true;

    const THRESHOLD = 160;
    let overlayShown = false;
    let toastTimer = null;

    function isEditable(t) {
        if (!t) return false;
        const tag = t.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
    }

    function showToast(msg) {
        if (!document.body) return;
        let toast = document.getElementById('__mgh_toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = '__mgh_toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
    }

    function showBlockOverlay() {
        if (overlayShown || !document.body) return;
        overlayShown = true;
        let overlay = document.getElementById('__mgh_block');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = '__mgh_block';
            overlay.innerHTML =
                '<div class="__mgh_block_inner">' +
                '<div class="__mgh_shield">🛡️</div>' +
                '<h2>Access Restricted</h2>' +
                '<p>Developer Tools are not allowed while playing.<br>Please close them to continue.</p>' +
                '</div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('show');
    }

    function hideBlockOverlay() {
        const overlay = document.getElementById('__mgh_block');
        if (overlay) overlay.classList.remove('show');
        overlayShown = false;
    }

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showToast('Right-click is disabled');
        return false;
    }, true);

    document.addEventListener('keydown', (e) => {
        const k = (e.key || '').toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;

        const isF12 = k === 'f12';
        const devToolsCombo = ctrl && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k);
        const viewSource    = ctrl && k === 'u';
        const savePage      = ctrl && k === 's';
        const print         = ctrl && k === 'p';

        if (isF12 || devToolsCombo || viewSource || savePage || print) {
            e.preventDefault();
            e.stopPropagation();
            showToast('This shortcut is disabled');
            return false;
        }
    }, true);

    function checkDevTools() {
        const wDiff = Math.abs(window.outerWidth  - window.innerWidth);
        const hDiff = Math.abs(window.outerHeight - window.innerHeight);
        const open = wDiff > THRESHOLD || hDiff > THRESHOLD;
        if (open) showBlockOverlay();
        else hideBlockOverlay();
    }

    setInterval(checkDevTools, 800);
    window.addEventListener('resize', checkDevTools);

    (function () {
        let triggered = false;
        const bait = /./;
        bait.toString = function () {
            if (!triggered) {
                triggered = true;
                showBlockOverlay();
            }
            return '';
        };
        setInterval(() => { try { console.log(bait); console.clear(); } catch (_) {} }, 1500);
    })();

    ['copy', 'cut', 'dragstart', 'selectstart'].forEach((evt) => {
        document.addEventListener(evt, (e) => {
            if (isEditable(e.target)) return;
            e.preventDefault();
            return false;
        }, true);
    });

    try {
        const noop = function () {};
        const methods = ['log', 'debug', 'info', 'warn', 'error', 'trace', 'table', 'dir'];
        methods.forEach((m) => {
            if (window.console && window.console[m]) window.console[m] = noop;
        });
    } catch (_) {}

    try {
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }
    } catch (_) {
        document.documentElement.style.display = 'none';
    }
})();
