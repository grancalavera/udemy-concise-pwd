// Service Worker
const pwaCache = "pwa-cache-1";

// pretty much the same as
// https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil#example
async function preCache() {
  const cache = await caches.open(pwaCache);
  await cache.addAll(["/", "style.css", "thumb.png"]);
}

async function fetchCache(e) {
  const cache = await caches.open(pwaCache);

  const cachedResponse = await cache.match(e.request);

  if (cachedResponse) {
    console.log(`serving ${e.request.url} from cache`);
    return cachedResponse;
  } else {
    console.log(`adding ${e.request.url} to cache`);
    const fetchedResponse = await fetch(e.request);
    cache.put(e.request, fetchedResponse.clone());
    return fetchedResponse;
  }
}

self.addEventListener("install", async (e) => {
  e.waitUntil(preCache());
  console.log("SW: Installed");
});

self.addEventListener("fetch", async (e) => {
  // leave out all requests for external domains
  if (e.request.url.match(location.origin)) {
    e.respondWith(fetchCache(e));
  }
});

self.addEventListener("activate", (e) => {
  console.log("SW: Activated");
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
