const version = "1.0";

const appAssets = [
  "index.html",
  "main.js",
  "images/flame.png",
  "images/logo.png",
  "images/sync.png",
  "vendor/bootstrap.min.css",
  "vendor/jquery.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(preCache(`static-${version}`, appAssets));
  console.log("SW: Installed");
});

self.addEventListener("activate", (e) => {
  e.waitUntil(cleanupCache());
  console.log("SW: Activated");
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.match(location.origin)) {
    e.respondWith(cacheWithNetworkFallback(`static-${version}`, e.request));
  }
});

// pretty much the same as
// https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil#example
async function preCache(key, assets) {
  const cache = await caches.open(key);
  await cache.addAll(assets);
}

async function cleanupCache() {
  const keys = await caches.keys();
  await Promise.all(
    keys.map((key) => {
      if (key !== `static-${version}` && key.match("static-")) {
        return caches.delete(key);
      } else {
        return true;
      }
    })
  );
}

async function cacheWithNetworkFallback(cacheKey, request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  } else {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheKey);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  }
}
