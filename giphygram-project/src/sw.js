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
  e.waitUntil(cleanStaticCache());
  console.log("SW: Activated");
});

self.addEventListener("fetch", (e) => {
  // application shell
  if (e.request.url.match(location.origin)) {
    e.respondWith(cacheWithNetworkFallback(`static-${version}`, e.request));

    // api calls
  } else if (e.request.url.match("api.giphy.com/v1/gifs/trending")) {
    e.respondWith(networkWithCacheFallback(`static-${version}`, e.request));

    // images sent from the API
  } else if (e.request.url.match("giphy.com/media")) {
    e.respondWith(cacheWithNetworkFallback("giphy", e.request));
  }
});

self.addEventListener("message", (e) => {
  if (e.data.action === "cleanGiphyCache") {
    cleanGiphyCache(e.data.giphys);
  }
});

// pretty much the same as
// https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil#example
async function preCache(key, assets) {
  const cache = await caches.open(key);
  await cache.addAll(assets);
}

async function cleanStaticCache() {
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

async function cleanGiphyCache(giphys) {
  const cache = await caches.open("giphy");
  const keys = await cache.keys();
  await Promise.all(
    keys.map((key) => {
      if (!giphys.includes(key.url)) {
        return cache.delete(key);
      } else {
        return true;
      }
    })
  );
}

// Cache strategies

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

async function networkWithCacheFallback(cacheKey, request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // update the cache anyway, in case in the future the network would fail
      const cache = await caches.open(cacheKey);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    } else {
      // handle errors in single place
      throw new Error("Fetch Error");
    }
  } catch {
    return caches.match(request);
  }
}
