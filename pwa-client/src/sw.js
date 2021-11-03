// Service Worker
const pwaCache = "pwa-cache-16";

// Static assets to cache on install
const staticCache = [
  "/",
  "style.css",
  "main.js",
  "index.html",
  "thumb.png",
  "warning.png",
];

// pretty much the same as
// https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil#example
async function preCache() {
  const cache = await caches.open(pwaCache);
  await cache.addAll(staticCache);
}

// strategies

// 1. Cache Only: Static Assets - App Shell
async function cacheOnly(request) {
  // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/match
  // assuming we don't store multiple versions of the same request
  return caches.match(request);
}

// 2. Cache with Network Fallback
async function cacheWithNetworkFallback(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  } else {
    const networkResponse = await fetch(request);
    const cache = await caches.open(pwaCache);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  }
}

// 3. Network with Cache Fallback
async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // update the cache anyway, in case in the future the network would fail
      const cache = await caches.open(pwaCache);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    } else {
      return caches.match(request);
    }
  } catch {
    return caches.match(request);
  }
}

// 4. Cache with Network Update
async function cacheWithNetworkUpdate(request) {
  const cache = await caches.open(pwaCache);
  const cachePromise = cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch(() => new Response({ status: 503 }));

  return (await cachePromise) ?? networkPromise;
}

// 5. Cache & Network Race
async function cacheAndNetworkRace(request) {
  const firstResponse = new Promise((resolve, reject) => {
    let firstRejectionReceived = false;

    const rejectOnce = () => {
      if (firstRejectionReceived) {
        reject("No response received");
      } else {
        firstRejectionReceived = true;
      }
    };

    fetch(request)
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(pwaCache);
          cache.put(request, response.clone());
          resolve(response);
        } else {
          rejectOnce();
        }
      })
      .catch(rejectOnce);

    caches
      .match(request)
      .then((response) => {
        if (response) {
          resolve(response);
        } else {
          rejectOnce();
        }
      })
      .catch(rejectOnce);
  });
  return firstResponse;
}

async function cleanupCache() {
  const keys = await caches.keys();

  await Promise.all(
    keys.map((key) => {
      if (key !== pwaCache) {
        return caches.delete(key);
      } else {
        return true;
      }
    })
  );
}

self.addEventListener("install", async (e) => {
  e.waitUntil(preCache());
  console.log("SW: Installed");
});

self.addEventListener("activate", (e) => {
  e.waitUntil(cleanupCache());
  console.log("SW: Activated");
});

self.addEventListener("fetch", async (e) => {
  e.respondWith(cacheAndNetworkRace(e.request));
});

self.addEventListener("message", async (event) => {
  console.log("SW: message received", { data: event.data });

  const clients = await event.currentTarget.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  clients.forEach((client) => {
    // reply to all clients
    client.postMessage("Greetings ALL from SW!");

    // reply to sender only
    if (event.source.id === client.id) {
      client.postMessage(`Greetings ${client.id} from SW`);
    }
  });
});

self.addEventListener("push", async (e) => {
  const message = await e.data.text();
  const notification = self.registration.showNotification(
    message ?? "You'be been notified from the SW!"
  );

  // ensures the service worker stays active throughout the duration of the notification
  e.waitUntil(notification);
});
