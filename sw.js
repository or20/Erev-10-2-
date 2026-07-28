const CACHE_NAME = "erev-10-pwa-v20";

const ASSETS = [
  "./",
  "./index.html",
  "./join.html",
  "./signup.html",
  "./client-v3.html",
  "./client-ru.html",
  "./manager.html",
  "./courier.html",
  "./bakery.html",
  "./styles.css",
  "./supabase-config.js",
  "./manifest.webmanifest",
  "./manifest-manager.webmanifest",
  "./manifest-customer.webmanifest",
  "./manifest-courier.webmanifest",
  "./manifest-bakery.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // קובץ חסר אחד לא מפיל את כל התקנת האפליקציה.
      await Promise.allSettled(ASSETS.map(asset => cache.add(asset)));
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // חשוב: לא מתערבים בכלל ב-Supabase, ב-CDN או בכל שרת חיצוני.
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(event.request, { ignoreSearch: true })) ||
                 (await caches.match("./join.html")) ||
                 new Response("אין חיבור לאינטרנט", {
                   status: 503,
                   headers: { "Content-Type": "text/plain; charset=utf-8" }
                 });
        })
    );
    return;
  }

  // קבצים מקומיים: מטמון קודם, ובמקביל עדכון מהשרת.
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
      return cached || network;
    })
  );
});
