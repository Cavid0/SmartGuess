const VERSION = 'mgh-v1';
const CORE = [
    './',
    './index.html',
    './manifest.webmanifest',
    './assets/favicon.svg',
    './assets/css/style.css',
    './assets/css/security.css',
    './assets/js/main.js',
    './assets/js/security.js',
    './assets/js/haptics.js',
    './assets/js/sounds.js',
    './assets/js/theme.js',
    './assets/js/pwa.js',
    './games/codebreaker/index.html',
    './games/codebreaker/style.css',
    './games/codebreaker/script.js',
    './games/numberguess/index.html',
    './games/numberguess/style.css',
    './games/numberguess/script.js',
    './games/snake/index.html',
    './games/snake/style.css',
    './games/snake/script.js',
    './games/tictactoe/index.html',
    './games/tictactoe/style.css',
    './games/tictactoe/script.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== location.origin) return;

    event.respondWith(
        caches.match(req).then((cached) => {
            const network = fetch(req).then((res) => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(VERSION).then((cache) => cache.put(req, clone));
                }
                return res;
            }).catch(() => cached);
            return cached || network;
        })
    );
});
