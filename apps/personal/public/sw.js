const CACHE = "app-shell-v1";
// cache the shell; add more assets as needed
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => (self as any).skipWaiting())
  );
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => (self as any).clients.claim())
  );
});

// network-first for navigations; cache-first for static
self.addEventListener("fetch", (event: any) => {
  const req: Request = event.request;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(res => res || fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }))
    );
  }
});
