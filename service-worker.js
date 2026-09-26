// Smart Azan Clock — minimal service worker
// Just enough to satisfy PWA installability requirements and let the
// app shell (HTML/CSS/JS/icons) open instantly on repeat visits.
// It does NOT cache MQTT data — that always comes live over the network.

const CACHE_NAME = "azan-clock-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first for everything (broker traffic is separate, over WebSocket,
  // and is never touched by this handler). Falls back to the cached shell
  // only if the network request fails (e.g. briefly offline).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
